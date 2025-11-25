"""
API Gateway/Proxy to manage all the microservices
This gateway integrates all the APIs we've been testing into a single entry point
"""

from fastapi import FastAPI, HTTPException, Request, BackgroundTasks, Path
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.routing import Route
import requests
import json
from typing import Optional, Dict, Any, Annotated
import asyncio
from urllib.parse import urljoin, urlparse
import logging

# Disable SSL warnings for self-signed certificates
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from pydantic import ConfigDict, constr

app = FastAPI(
    title="API Gateway",
    description="Gateway to manage all the microservices",
    version="1.0.0",
    # Disable automatic UUID parsing
    openapi_url="/openapi.json",
    docs_url="/docs"
)

# Add CORS middleware - MUST be before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "*"  # Allow all origins during development - remove in production
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allow_headers=["*"],
    expose_headers=["Access-Control-Allow-Origin", "Access-Control-Allow-Credentials", "Access-Control-Allow-Methods", "Access-Control-Allow-Headers", "X-User-Id", "Authorization"],
    max_age=3600,
)

# Service registry - mapping of service names to their base URLs
SERVICE_REGISTRY = {
    "users": "https://users.inf326.nursoft.dev/usersservice",
    "channels": "https://channel-api.inf326.nur.dev",
    "threads": "https://threads.inf326.nursoft.dev/threads",
    "messages": "https://messages-service.kroder.dev",
    "presence": "https://presence-134-199-176-197.nip.io",
    "search": "https://searchservice.inf326.nursoft.dev",
    "files": "http://file-service-134-199-176-197.nip.io",
    "chatbot": "https://chatbotprogra.inf326.nursoft.dev",
    "wikipedia": "https://wikipedia-chatbot.inf326.nursoft.dev"
}

class GatewayService:
    """Service class to handle API gateway logic"""
    
    @staticmethod
    def forward_request(service_name: str, path: str, method: str, headers: Dict, body: Optional[Dict] = None, 
                       params: Optional[Dict] = None, timeout: int = 30) -> JSONResponse:
        """
        Forward a request to the appropriate service
        """
        if service_name not in SERVICE_REGISTRY:
            raise HTTPException(status_code=404, detail=f"Service {service_name} not found")
        
        base_url = SERVICE_REGISTRY[service_name]
        url = f"{base_url}{path}"

        logger.info(f"Forwarding {method} request to {url}")
        logger.info(f"Query params: {params}")
        logger.info(f"Request body: {body}")

        try:
            # Prepare headers - remove hop-by-hop headers that shouldn't be forwarded
            filtered_headers = {k: v for k, v in headers.items()
                              if k.lower() not in ['host', 'connection', 'upgrade', 'keep-alive']}

            logger.info(f"Filtered headers being sent: {list(filtered_headers.keys())}")

            # Make the request to the target service
            # Note: verify=False disables SSL verification (useful for self-signed certs)
            if method.upper() == "GET":
                response = requests.get(url, headers=filtered_headers, params=params, timeout=timeout, verify=False)
            elif method.upper() == "POST":
                response = requests.post(url, json=body, headers=filtered_headers, params=params, timeout=timeout, verify=False)
            elif method.upper() == "PUT":
                response = requests.put(url, json=body, headers=filtered_headers, params=params, timeout=timeout, verify=False)
            elif method.upper() == "PATCH":
                response = requests.patch(url, json=body, headers=filtered_headers, params=params, timeout=timeout, verify=False)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=filtered_headers, params=params, timeout=timeout, verify=False)
            else:
                raise HTTPException(status_code=405, detail=f"Method {method} not allowed")
            
            # Create response with the same status code and content
            content = response.content
            response_headers = dict(response.headers)

            logger.info(f"Received response from {service_name}: status={response.status_code}")

            # Remove hop-by-hop headers and content-length from the response
            headers_to_remove = ['connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization', 'te', 'trailers', 'transfer-encoding', 'upgrade', 'content-length']
            filtered_response_headers = {k: v for k, v in response_headers.items()
                                       if k.lower() not in headers_to_remove}

            # Parse content appropriately based on content type
            content_type = response.headers.get('content-type', '').lower()

            if content:
                # For content that might be JSON, check if it starts with JSON-like characters
                try:
                    content_str = content.decode('utf-8')
                    if 'application/json' in content_type and (content_str.strip().startswith('{') or content_str.strip().startswith('[')):
                        # Handle JSON content
                        try:
                            content_data = json.loads(content_str)
                        except json.JSONDecodeError:
                            # Not valid JSON despite the content type
                            content_data = content_str
                    else:
                        # Handle non-JSON content
                        content_data = content_str
                except UnicodeDecodeError:
                    # If UTF-8 decode fails, return as hex string or handle as binary
                    content_data = content.hex()  # Convert binary data to hex string as fallback
            else:
                content_data = None

            logger.info(f"Forwarding response with status {response.status_code}")

            # Return response with filtered headers (CORS is handled by middleware)
            return JSONResponse(
                status_code=response.status_code,
                content=content_data,
                headers=filtered_response_headers
            )
            
        except requests.exceptions.Timeout:
            logger.error(f"Timeout forwarding request to {service_name}")
            raise HTTPException(status_code=408, detail=f"Request to {service_name} timed out after {timeout} seconds")
        except requests.exceptions.ConnectionError as e:
            logger.error(f"Connection error to {service_name}: {str(e)}")
            raise HTTPException(status_code=502, detail=f"Connection error to {service_name}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error forwarding to {service_name}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error calling {service_name}: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error forwarding request to {service_name}: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


# Health check endpoint
@app.get("/health")
async def gateway_health():
    """Health check for the gateway"""
    return {"status": "healthy", "services": list(SERVICE_REGISTRY.keys())}


# Specific endpoints for each service with more descriptive routes

# Users service endpoints
@app.get("/api/users/health")
@app.post("/api/users/health")
@app.options("/api/users/health")
async def users_health(request: Request):
    if request.method == "OPTIONS":
        return JSONResponse(status_code=200, content={})
    return GatewayService.forward_request("users", "/health", "GET", {})

@app.post("/api/users/register")
@app.options("/api/users/register")
async def user_register(request: Request):
    if request.method == "OPTIONS":
        return JSONResponse(status_code=200, content={})
    headers = dict(request.headers)
    body = await request.json() if request.method == "POST" else None
    return GatewayService.forward_request("users", "/v1/users/register", "POST", headers, body)

@app.post("/api/users/login")
@app.options("/api/users/login")
async def user_login(request: Request):
    if request.method == "OPTIONS":
        return JSONResponse(status_code=200, content={})
    headers = dict(request.headers)
    body = await request.json() if request.method == "POST" else None
    return GatewayService.forward_request("users", "/v1/auth/login", "POST", headers, body)

@app.get("/api/users/me")
@app.options("/api/users/me")
async def user_me(request: Request):
    if request.method == "OPTIONS":
        return JSONResponse(status_code=200, content={})
    headers = dict(request.headers)
    logger.info(f"Authorization header: {headers.get('authorization', 'NOT FOUND')}")
    return GatewayService.forward_request("users", "/v1/users/me", "GET", headers)

@app.patch("/api/users/me")
@app.options("/api/users/me")
async def update_user_me(request: Request):
    if request.method == "OPTIONS":
        return JSONResponse(status_code=200, content={})
    headers = dict(request.headers)
    body = await request.json() if request.method == "PATCH" else None
    return GatewayService.forward_request("users", "/v1/users/me", "PATCH", headers, body)


# Channels service endpoints
@app.get("/api/channels/health")
async def channels_health():
    return GatewayService.forward_request("channels", "/health", "GET", {})

@app.get("/api/channels")
async def list_channels(request: Request):
    headers = dict(request.headers)
    params = dict(request.query_params)
    return GatewayService.forward_request("channels", "/v1/channels/", "GET", headers, params=params)

@app.post("/api/channels")
async def create_channel(request: Request):
    headers = dict(request.headers)
    body = await request.json() if request.method == "POST" else None
    return GatewayService.forward_request("channels", "/v1/channels/", "POST", headers, body)

@app.get("/api/channels/{channel_id}")
async def get_channel(channel_id: str, request: Request):
    headers = dict(request.headers)
    return GatewayService.forward_request("channels", f"/v1/channels/{channel_id}", "GET", headers)

@app.put("/api/channels/{channel_id}")
async def update_channel(channel_id: str, request: Request):
    headers = dict(request.headers)
    body = await request.json() if request.method == "PUT" else None
    return GatewayService.forward_request("channels", f"/v1/channels/{channel_id}", "PUT", headers, body)

@app.delete("/api/channels/{channel_id}")
async def delete_channel(channel_id: str, request: Request):
    headers = dict(request.headers)
    return GatewayService.forward_request("channels", f"/v1/channels/{channel_id}", "DELETE", headers)


# Threads service endpoints - Special handling for POST /api/threads
@app.post("/api/threads")
async def create_thread(
    request: Request,
    channel_id: str = None,
    user_id: str = None,
    thread_name: str = None
):
    """Create a new thread - matches test logic"""
    logger.info(f"POST /api/threads called with channel_id={channel_id}, user_id={user_id}, thread_name={thread_name}")
    headers = dict(request.headers)
    params = {
        "channel_id": channel_id,
        "user_id": user_id,
        "thread_name": thread_name
    }
    # Forward to /threads/ (final URL will be https://threads.inf326.nursoft.dev/threads/threads/)
    return GatewayService.forward_request("threads", "/threads/", "POST", headers, None, params)

@app.options("/api/threads")
async def create_thread_options(request: Request):
    return JSONResponse(status_code=200, content={})

# Catch-all for other threads routes - no validation
@app.api_route("/api/threads/{path:path}", methods=["GET", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def proxy_threads(request: Request, path: str):
    """Proxy all threads requests without any validation"""
    if request.method == "OPTIONS":
        # Handle preflight requests
        return JSONResponse(
            status_code=200,
            content={},
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD",
                "Access-Control-Allow-Headers": "X-Requested-With, Content-Type, Accept, Authorization, X-User-Id"
            }
        )

    headers = dict(request.headers)
    params = dict(request.query_params)
    body = None
    if request.method in ["PUT", "PATCH"]:
        body = await request.json()

    # Add /threads/ prefix for threads service
    logger.info(f"{request.method} /api/threads/{path} -> /threads/{path}")
    return GatewayService.forward_request("threads", f"/threads/{path}", request.method, headers, body, params)

@app.get("/api/channels/{channel_id}/threads")
async def get_channel_threads(channel_id: str, request: Request):
    headers = dict(request.headers)
    params = dict(request.query_params)
    params['channel_id'] = channel_id
    return GatewayService.forward_request("threads", "/channel/get_threads", "GET", headers, params=params)


# Messages service endpoints - Catch-all proxy without validation
@app.api_route("/api/messages/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def proxy_messages(request: Request, path: str):
    """Proxy all messages requests without any validation"""
    if request.method == "OPTIONS":
        # Handle preflight requests
        return JSONResponse(
            status_code=200,
            content={},
            headers={
                "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD",
                "Access-Control-Allow-Headers": "X-Requested-With, Content-Type, Accept, Authorization, X-User-Id"
            }
        )

    headers = dict(request.headers)
    params = dict(request.query_params)
    body = None
    if request.method in ["POST", "PUT", "PATCH"]:
        body = await request.json()

    logger.info(f"{request.method} /api/messages/{path} -> /{path}")
    return GatewayService.forward_request("messages", f"/{path}", request.method, headers, body, params)


# Presence service endpoints
@app.get("/api/presence/health")
async def presence_health():
    return GatewayService.forward_request("presence", "/api/v1.0.0/presence/health", "GET", {})

@app.post("/api/presence")
async def register_presence(request: Request):
    headers = dict(request.headers)
    body = await request.json() if request.method == "POST" else None
    return GatewayService.forward_request("presence", "/api/v1.0.0/presence", "POST", headers, body)

@app.get("/api/presence")
async def list_presence_users(request: Request):
    headers = dict(request.headers)
    params = dict(request.query_params)
    return GatewayService.forward_request("presence", "/api/v1.0.0/presence", "GET", headers, params=params)

@app.get("/api/presence/{user_id}")
async def get_user_presence(user_id: str, request: Request):
    headers = dict(request.headers)
    return GatewayService.forward_request("presence", f"/api/v1.0.0/presence/{user_id}", "GET", headers)

@app.patch("/api/presence/{user_id}")
async def update_presence(user_id: str, request: Request):
    headers = dict(request.headers)
    body = await request.json() if request.method == "PATCH" else None
    return GatewayService.forward_request("presence", f"/api/v1.0.0/presence/{user_id}", "PATCH", headers, body)

@app.delete("/api/presence/{user_id}")
async def delete_presence(user_id: str, request: Request):
    headers = dict(request.headers)
    return GatewayService.forward_request("presence", f"/api/v1.0.0/presence/{user_id}", "DELETE", headers)

@app.get("/api/presence/stats")
async def get_presence_stats(request: Request):
    headers = dict(request.headers)
    return GatewayService.forward_request("presence", "/api/v1.0.0/presence/stats", "GET", headers)


# Search service endpoints
@app.get("/api/search/health")
async def search_health(request: Request):
    headers = dict(request.headers)
    params = dict(request.query_params)
    # Test basic functionality by searching for a sample term
    if not params:
        params = {"q": "test"}
    return GatewayService.forward_request("search", "/api/message/search_message", "GET", headers, params=params)

@app.get("/api/search/messages")
async def search_messages(request: Request):
    headers = dict(request.headers)
    params = dict(request.query_params)
    return GatewayService.forward_request("search", "/api/message/search_message", "GET", headers, params=params)

@app.get("/api/search/files")
async def search_files(request: Request):
    headers = dict(request.headers)
    params = dict(request.query_params)
    return GatewayService.forward_request("search", "/api/files/search_files", "GET", headers, params=params)

@app.get("/api/search/channels")
async def search_channels(request: Request):
    headers = dict(request.headers)
    params = dict(request.query_params)
    return GatewayService.forward_request("search", "/api/channel/search_channel", "GET", headers, params=params)

@app.get("/api/search/threads/id/{thread_id}")
async def search_threads_by_id(thread_id: str, request: Request):
    headers = dict(request.headers)
    return GatewayService.forward_request("search", f"/api/threads/id/{thread_id}", "GET", headers)

@app.get("/api/search/threads/author/{author}")
async def search_threads_by_author(author: str, request: Request):
    headers = dict(request.headers)
    return GatewayService.forward_request("search", f"/api/threads/author/{author}", "GET", headers)


# Files service endpoints
@app.get("/api/files/health")
async def files_health():
    return GatewayService.forward_request("files", "/healthz", "GET", {})

@app.get("/api/files")
async def list_files(request: Request):
    headers = dict(request.headers)
    params = dict(request.query_params)
    return GatewayService.forward_request("files", "/v1/files", "GET", headers, params=params)

@app.post("/api/files")
async def upload_file(request: Request):
    # Handling multipart/form-data for file uploads would require special handling
    # This is a simplified implementation
    headers = dict(request.headers)
    params = dict(request.query_params)
    body = await request.json() if request.method == "POST" else None
    return GatewayService.forward_request("files", "/v1/files", "POST", headers, body, params)


# Chatbot service endpoints
@app.get("/api/chatbot/health")
async def chatbot_health():
    return GatewayService.forward_request("chatbot", "/health", "GET", {})

@app.post("/api/chatbot/chat")
async def chatbot_chat(request: Request):
    headers = dict(request.headers)
    body = await request.json() if request.method == "POST" else None
    return GatewayService.forward_request("chatbot", "/chat", "POST", headers, body, timeout=300)

# Wikipedia and Programming Bot Commands
@app.post("/api/commands/wikipedia")
@app.options("/api/commands/wikipedia")
async def wikipedia_command(request: Request):
    """
    Wikipedia bot command endpoint - can be used in any chat to get Wikipedia information
    Expected request body: {"message": "search term"}
    """
    if request.method == "OPTIONS":
        return JSONResponse(status_code=200, content={})
    headers = dict(request.headers)
    body = await request.json() if request.method == "POST" else None

    # The Wikipedia service expects a "message" field at its /chat-wikipedia endpoint
    # Map incoming "query" or "message" to the expected "message" field
    if body:
        final_message = body.get("message", body.get("query", ""))
        formatted_body = {"message": final_message}
    else:
        formatted_body = {"message": ""} # Send empty message if no body

    return GatewayService.forward_request("wikipedia", "/chat-wikipedia", "POST", headers, formatted_body)


@app.post("/api/commands/programming")
@app.options("/api/commands/programming")
async def programming_command(request: Request):
    """
    Programming bot with auto-completion command endpoint
    Expected request body: {"message": "code or query"}
    """
    if request.method == "OPTIONS":
        return JSONResponse(status_code=200, content={})
    headers = dict(request.headers)
    body = await request.json() if request.method == "POST" else None

    # The service expects a body with only the "message" field.
    if body:
        message = body.get("message", body.get("code", body.get("query", "")))
        formatted_body = {"message": message}
    else:
        formatted_body = {"message": ""}

    return GatewayService.forward_request("chatbot", "/chat", "POST", headers, formatted_body, timeout=300)


@app.post("/api/commands/code")
@app.options("/api/commands/code")
async def code_command(request: Request):
    """
    Code documentation command endpoint
    Forwards requests to the chatbot service for code-related queries
    Expected request body: {"message": "code query or question"}
    """
    if request.method == "OPTIONS":
        return JSONResponse(status_code=200, content={})
    headers = dict(request.headers)
    body = await request.json() if request.method == "POST" else None

    # The service expects a body with only the "message" field.
    if body:
        message = body.get("message", body.get("code", body.get("query", "")))
        formatted_body = {"message": message}
    else:
        formatted_body = {"message": ""}

    return GatewayService.forward_request("chatbot", "/chat", "POST", headers, formatted_body, timeout=300)


# Service discovery endpoint
@app.get("/services")
async def list_services():
    """List all available services"""
    return {
        "services": {
            name: url for name, url in SERVICE_REGISTRY.items()
        }
    }


# Note: General proxy endpoint removed - all routes should be explicitly defined above
# This prevents conflicts with specific /api/* routes
# If you need a general proxy, add it after all specific routes with appropriate path constraints


# Custom exception handler to include CORS headers in error responses
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with CORS headers"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers={
            "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD",
            "Access-Control-Allow-Headers": "*",
        }
    )


# Rate limiting and circuit breaker could be implemented here
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Middleware to log requests"""
    logger.info(f"Received {request.method} request to {request.url.path}")
    response = await call_next(request)
    return response


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)