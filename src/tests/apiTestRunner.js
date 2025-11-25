// Frontend API Test Runner
import * as api from '../api';

// API Base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8000';

// Simple color functions for browser console (using CSS styling)
class Colors {
  static success(text) {
    return `%c${text}%c`;
  }

  static error(text) {
    return `%c${text}%c`;
  }

  static warning(text) {
    return `%c${text}%c`;
  }

  static info(text) {
    return `%c${text}%c`;
  }

  static getStyles(type) {
    switch(type) {
      case 'success':
        return ['color: #28a745;', ''];
      case 'error':
        return ['color: #dc3545;', ''];
      case 'warning':
        return ['color: #ffc107;', ''];
      case 'info':
        return ['color: #007bff;', ''];
      default:
        return ['', ''];
    }
  }
}

export class APITestRunner {
  constructor() {
    this.token = null;
    this.userId = null;

    // Test statistics
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.skippedTests = 0;
  }

  logTest(method, endpoint, status, response_data = null, error_msg = null, status_code = null) {
    // Log test results to console for frontend
    if (status === "PASS") {
      console.log(`  ✓ ${method} ${endpoint}`);
      if (response_data && response_data.access_token) {
        console.log(`     ✓ Token obtenido: ${response_data.access_token.substring(0, 20)}...`);
      }
    } else if (status === "FAIL") {
      console.log(`  ✗ ${method} ${endpoint} (Status: ${status_code}) - ${error_msg}`);
      if (response_data) {
        console.log(`       Response:`, response_data);
      }
    } else if (status === "SKIP") {
      console.log(`  ⊘ ${method} ${endpoint} - Saltado (${error_msg})`);
    }
  }

  printSummary(test_name, suite_passed, suite_total) {
    if (suite_passed === suite_total) {
      console.log(`✓ ${test_name}: ${suite_passed} pasados, ${suite_total - suite_passed} fallidos`);
    } else {
      console.log(`✗ ${test_name}: ${suite_passed} pasados, ${suite_total - suite_passed} fallidos`);
    }
  }

  async runTest(apiCall, method, endpoint, expected_status = 200, data = null) {
    this.totalTests += 1;
    
    try {
      const response = await apiCall();
      
      // For successful responses, check if they have the expected status
      if (response) {
        this.passedTests += 1;
        this.logTest(method, endpoint, "PASS", response);
        return { status: "PASS", data: response };
      } else {
        this.failedTests += 1;
        this.logTest(method, endpoint, "FAIL", {}, 
          `Expected ${expected_status}, got unexpected response`, 
          500);
        return { status: "FAIL", data: {} };
      }
    } catch (error) {
      this.failedTests += 1;
      this.logTest(method, endpoint, "FAIL", {}, error.message || error.toString(), error.response?.status || 0);
      return { status: "FAIL", data: {}, error: error };
    }
  }
}

export class TestHealth {
  constructor(runner) {
    this.runner = runner;
  }

  async testGatewayHealth() {
    console.log("     📡 Checking gateway health endpoint...");
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      
      if (response.ok) {
        this.runner.logTest("GET", "/health", "PASS", data);
        return true;
      } else {
        this.runner.logTest("GET", "/health", "FAIL", data, `HTTP ${response.status}`, response.status);
        return false;
      }
    } catch (error) {
      this.runner.logTest("GET", "/health", "FAIL", {}, error.message, 0);
      return false;
    }
  }

  async testUsersHealth() {
    console.log("     📡 Checking users service health...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/health`);
      const data = await response.json();
      
      if (response.ok) {
        this.runner.logTest("GET", "/api/users/health", "PASS", data);
        return true;
      } else {
        this.runner.logTest("GET", "/api/users/health", "FAIL", data, `HTTP ${response.status}`, response.status);
        return false;
      }
    } catch (error) {
      this.runner.logTest("GET", "/api/users/health", "FAIL", {}, error.message, 0);
      return false;
    }
  }

  async testChannelsHealth() {
    console.log("     📡 Checking channels service health...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/channels/health`);
      const data = await response.json();
      
      if (response.ok) {
        this.runner.logTest("GET", "/api/channels/health", "PASS", data);
        return true;
      } else {
        this.runner.logTest("GET", "/api/channels/health", "FAIL", data, `HTTP ${response.status}`, response.status);
        return false;
      }
    } catch (error) {
      this.runner.logTest("GET", "/api/channels/health", "FAIL", {}, error.message, 0);
      return false;
    }
  }
}

export class TestUserRegistration {
  constructor(runner) {
    this.runner = runner;
    this.testEmail = `testuser_${Date.now()}@example.com`;
    this.testUsername = `testuser_${Date.now()}`;
    this.testPassword = "securepassword123";
  }

  async testRegisterUser() {
    console.log(`     📝 Registrando usuario: ${this.testEmail}`);
    
    try {
      const result = await api.registerUser({
        email: this.testEmail,
        username: this.testUsername,
        password: this.testPassword,
        full_name: "Test User"
      });
      
      if (result.id) {
        this.runner.userId = result.id;
        console.log(`     ✓ Usuario ID obtenido: ${result.id}`);
        return true;
      }
      return false;
    } catch (error) {
      this.runner.logTest("POST", "/api/users/register", "FAIL", {}, error.message, error.status || 400);
      return false;
    }
  }
}

export class TestAuthentication {
  constructor(runner, registrationSuite) {
    this.runner = runner;
    this.registrationSuite = registrationSuite;
  }

  async testLogin() {
    console.log(`     🔐 Intentando login con usuario: ${this.registrationSuite.testEmail}`);
    
    try {
      const result = await api.loginUser(this.registrationSuite.testEmail, this.registrationSuite.testPassword);
      
      if (result.access_token) {
        this.runner.token = result.access_token;
        localStorage.setItem('accessToken', result.access_token);
        return true;
      }
      return false;
    } catch (error) {
      this.runner.logTest("POST", "/api/users/login", "FAIL", {}, error.message, error.status || 400);
      return false;
    }
  }
}

export class TestUserProfile {
  constructor(runner) {
    this.runner = runner;
  }

  async getUserProfile() {
    if (!this.runner.token) {
      this.runner.logTest("GET", "/api/users/me", "SKIP", {}, "sin token");
      this.runner.skippedTests += 1;
      return false;
    }

    try {
      const result = await api.getCurrentUser();
      return true;
    } catch (error) {
      this.runner.logTest("GET", "/api/users/me", "FAIL", {}, error.message, error.status || 400);
      return false;
    }
  }

  async updateUserProfile() {
    if (!this.runner.token) {
      this.runner.logTest("PATCH", "/api/users/me", "SKIP", {}, "sin token");
      this.runner.skippedTests += 1;
      return false;
    }

    try {
      const result = await api.updateUserProfile({ full_name: "Updated Test User" });
      return true;
    } catch (error) {
      this.runner.logTest("PATCH", "/api/users/me", "FAIL", {}, error.message, error.status || 400);
      return false;
    }
  }
}

// Channel Test Classes
export class ChannelTestHealth {
  async testHealth() {
    console.log("     📡 Checking channel service health endpoint...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/channels/health`);
      const data = await response.json();
      
      if (response.ok) {
        console.log("  ✓ GET /api/channels/health");
        return true;
      } else {
        console.log(`  ✗ GET /api/channels/health (Status: ${response.status})`, data);
        return false;
      }
    } catch (error) {
      console.error(`  ✗ GET /api/channels/health - ${error.message}`);
      return false;
    }
  }
}

export class TestChannelCRUD {
  constructor() {
    this.channelId = null;
  }

  async testCreateChannel() {
    console.log(`     ➕ Creando canal: test-channel-${Date.now()}`);
    
    try {
      const result = await api.createChannel({
        name: `test-channel-${Date.now()}`,
        owner_id: `owner-${Date.now()}`,
        channel_type: "public"
      });
      
      if (result._id) {
        this.channelId = result._id;
        console.log(`     ✓ Canal ID obtenido: ${this.channelId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`  ✗ POST /api/channels - ${error.message}`);
      return false;
    }
  }

  async testReadChannel() {
    if (!this.channelId) {
      console.log("  ⊘ GET /api/channels/{channel_id} - Saltado (sin canal ID)");
      return false;
    }

    console.log(`     👁️ Leyendo canal: ${this.channelId}`);
    try {
      const result = await api.getChannel(this.channelId);
      return true;
    } catch (error) {
      console.error(`  ✗ GET /api/channels/${this.channelId} - ${error.message}`);
      return false;
    }
  }

  async testListChannels() {
    console.log("     📚 Listando canales...");
    try {
      const result = await api.listChannels(1, 10);
      return true;
    } catch (error) {
      console.error(`  ✗ GET /api/channels - ${error.message}`);
      return false;
    }
  }

  async testUpdateChannel() {
    if (!this.channelId) {
      console.log("  ⊘ PUT /api/channels/{channel_id} - Saltado (sin canal ID)");
      return false;
    }

    console.log(`     ✏️ Actualizando canal: ${this.channelId}`);
    try {
      const result = await api.updateChannel(this.channelId, {
        name: `updated-test-channel-${Date.now()}`,
        channel_type: "private"
      });
      return true;
    } catch (error) {
      console.error(`  ✗ PUT /api/channels/${this.channelId} - ${error.message}`);
      return false;
    }
  }

  async testRemoveChannel() {
    if (!this.channelId) {
      console.log("  ⊘ DELETE /api/channels/{channel_id} - Saltado (sin canal ID)");
      return false;
    }

    console.log(`     ❌ Removiendo canal: ${this.channelId}`);
    try {
      const result = await api.deleteChannel(this.channelId);
      return true;
    } catch (error) {
      console.error(`  ✗ DELETE /api/channels/${this.channelId} - ${error.message}`);
      return false;
    }
  }
}

// Threads Test Classes
export class ThreadsTestHealth {
  async testHealth() {
    console.log("     📡 Checking threads service health endpoint...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/threads/health`);
      const data = await response.json();
      
      if (response.ok) {
        console.log("  ✓ GET /api/threads/health");
        return true;
      } else {
        console.log(`  ✗ GET /api/threads/health (Status: ${response.status})`, data);
        return false;
      }
    } catch (error) {
      console.error(`  ✗ GET /api/threads/health - ${error.message}`);
      return false;
    }
  }
}

export class TestThreadsCRUD {
  constructor() {
    this.threadId = null;
  }

  async testCreateThread() {
    console.log("     ➕ Creando hilo...");
    try {
      const result = await api.createThread({
        channel_id: "test-channel",
        title: `test-thread-${Date.now()}`,
        created_by: "test-user"
      });
      
      if (result.id || result._id) {
        this.threadId = result.id || result._id;
        console.log(`     ✓ Hilo ID obtenido: ${this.threadId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`  ✗ POST /api/threads - ${error.message}`);
      return false;
    }
  }

  async testReadThread() {
    if (!this.threadId) {
      console.log("  ⊘ GET /api/threads/{thread_id} - Saltado (sin hilo ID)");
      return false;
    }

    console.log(`     👁️ Leyendo hilo: ${this.threadId}`);
    try {
      const result = await api.getThread(this.threadId);
      return true;
    } catch (error) {
      console.error(`  ✗ GET /api/threads/${this.threadId} - ${error.message}`);
      return false;
    }
  }

  async testUpdateThread() {
    if (!this.threadId) {
      console.log("  ⊘ PUT /api/threads/{thread_id}/edit - Saltado (sin hilo ID)");
      return false;
    }

    console.log(`     ✏️ Actualizando hilo: ${this.threadId}`);
    try {
      const result = await api.updateThread(this.threadId, {
        title: `updated-test-thread-${Date.now()}`
      });
      return true;
    } catch (error) {
      console.error(`  ✗ PUT /api/threads/${this.threadId}/edit - ${error.message}`);
      return false;
    }
  }
}

// Messages Test Classes
export class MessagesTestHealth {
  async testHealth() {
    console.log("     📡 Checking messages service health endpoint...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/health`);
      const data = await response.json();
      
      if (response.ok) {
        console.log("  ✓ GET /api/messages/health");
        return true;
      } else {
        console.log(`  ✗ GET /api/messages/health (Status: ${response.status})`, data);
        return false;
      }
    } catch (error) {
      console.error(`  ✗ GET /api/messages/health - ${error.message}`);
      return false;
    }
  }
}

export class TestMessagesCRUD {
  constructor() {
    this.messageId = null;
    this.threadId = "test-thread"; // Using a placeholder for testing
  }

  async testListMessages() {
    console.log(`     📚 Listando mensajes del hilo: ${this.threadId}`);
    try {
      const result = await api.getMessages(this.threadId);
      return true;
    } catch (error) {
      console.error(`  ✗ GET /api/messages/threads/${this.threadId}/messages - ${error.message}`);
      return false;
    }
  }

  async testCreateMessage() {
    console.log("     ➕ Creando mensaje...");
    try {
      const result = await api.createMessage(this.threadId, "test-user", "Test message content");
      
      if (result.id || result._id) {
        this.messageId = result.id || result._id;
        console.log(`     ✓ Mensaje ID obtenido: ${this.messageId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`  ✗ POST /api/messages/threads/${this.threadId}/messages - ${error.message}`);
      return false;
    }
  }

  async testUpdateMessage() {
    if (!this.messageId) {
      console.log("  ⊘ PUT /api/messages/threads/{thread_id}/messages/{message_id} - Saltado (sin mensaje ID)");
      return false;
    }

    console.log(`     ✏️ Actualizando mensaje: ${this.messageId}`);
    try {
      const result = await api.updateMessage(this.threadId, this.messageId, "test-user", "Updated message content");
      return true;
    } catch (error) {
      console.error(`  ✗ PUT /api/messages/threads/${this.threadId}/messages/${this.messageId} - ${error.message}`);
      return false;
    }
  }

  async testDeleteMessage() {
    if (!this.messageId) {
      console.log("  ⊘ DELETE /api/messages/threads/{thread_id}/messages/{message_id} - Saltado (sin mensaje ID)");
      return false;
    }

    console.log(`     ❌ Eliminando mensaje: ${this.messageId}`);
    try {
      const result = await api.deleteMessage(this.threadId, this.messageId, "test-user");
      return true;
    } catch (error) {
      console.error(`  ✗ DELETE /api/messages/threads/${this.threadId}/messages/${this.messageId} - ${error.message}`);
      return false;
    }
  }
}

// Presence Test Classes
export class PresenceTestHealth {
  async testHealth() {
    console.log("     📡 Checking presence service health endpoint...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/presence/health`);
      const data = await response.json();
      
      if (response.ok) {
        console.log("  ✓ GET /api/presence/health");
        return true;
      } else {
        console.log(`  ✗ GET /api/presence/health (Status: ${response.status})`, data);
        return false;
      }
    } catch (error) {
      console.error(`  ✗ GET /api/presence/health - ${error.message}`);
      return false;
    }
  }
}

export class TestPresenceCRUD {
  constructor() {
    this.userId = `test-user-${Date.now()}`;
  }

  async testCreatePresence() {
    console.log(`     👤 Creando presencia para usuario: ${this.userId}`);
    try {
      const result = await api.createPresence({
        userId: this.userId,
        status: 'online',
        device: 'web'
      });
      return true;
    } catch (error) {
      console.error(`  ✗ POST /api/presence - ${error.message}`);
      return false;
    }
  }

  async testGetUserPresence() {
    console.log(`     👁️ Leyendo presencia del usuario: ${this.userId}`);
    try {
      const result = await api.getUserPresence(this.userId);
      return true;
    } catch (error) {
      console.error(`  ✗ GET /api/presence/${this.userId} - ${error.message}`);
      return false;
    }
  }

  async testUpdatePresence() {
    console.log(`     ✏️ Actualizando presencia del usuario: ${this.userId}`);
    try {
      const result = await api.updatePresence(this.userId, { status: 'away' });
      return true;
    } catch (error) {
      console.error(`  ✗ PATCH /api/presence/${this.userId} - ${error.message}`);
      return false;
    }
  }

  async testDeletePresence() {
    console.log(`     ❌ Eliminando presencia del usuario: ${this.userId}`);
    try {
      const result = await api.deletePresence(this.userId);
      return true;
    } catch (error) {
      console.error(`  ✗ DELETE /api/presence/${this.userId} - ${error.message}`);
      return false;
    }
  }
}

// Search Test Classes
export class SearchTestHealth {
  async testHealth() {
    console.log("     📡 Checking search service health endpoint...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/search/health`);
      const data = await response.json();
      
      if (response.ok) {
        console.log("  ✓ GET /api/search/health");
        return true;
      } else {
        console.log(`  ✗ GET /api/search/health (Status: ${response.status})`, data);
        return false;
      }
    } catch (error) {
      console.error(`  ✗ GET /api/search/health - ${error.message}`);
      return false;
    }
  }
}

export class TestSearchFunctionalities {
  async testSearchMessages() {
    console.log("     🔍 Buscando mensajes...");
    try {
      const result = await api.searchMessages("test");
      return true;
    } catch (error) {
      console.error(`  ✗ GET /api/search/messages - ${error.message}`);
      return false;
    }
  }

  async testSearchChannels() {
    console.log("     🔍 Buscando canales...");
    try {
      const result = await api.searchContent("test", null, null, null, 0, 10, 0);
      return true;
    } catch (error) {
      console.error(`  ✗ GET /api/search/channels - ${error.message}`);
      return false;
    }
  }
}

// Files Test Classes
export class FilesTestHealth {
  async testHealth() {
    console.log("     📡 Checking files service health endpoint...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/files/health`);
      const data = await response.json();
      
      if (response.ok) {
        console.log("  ✓ GET /api/files/health");
        return true;
      } else {
        console.log(`  ✗ GET /api/files/health (Status: ${response.status})`, data);
        return false;
      }
    } catch (error) {
      console.error(`  ✗ GET /api/files/health - ${error.message}`);
      return false;
    }
  }
}

// Chatbot Test Classes
export class ChatbotTestHealth {
  async testHealth() {
    console.log("     📡 Checking chatbot service health endpoint...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot/health`);
      const data = await response.json();
      
      if (response.ok) {
        console.log("  ✓ GET /api/chatbot/health");
        return true;
      } else {
        console.log(`  ✗ GET /api/chatbot/health (Status: ${response.status})`, data);
        return false;
      }
    } catch (error) {
      console.error(`  ✗ GET /api/chatbot/health - ${error.message}`);
      return false;
    }
  }
}

export class TestChatbotFunctionalities {
  async testChatWithBot() {
    console.log("     🤖 Probando chat con bot...");
    try {
      const result = await api.chatWithBot("Hello, how are you?");
      return true;
    } catch (error) {
      console.error(`  ✗ POST /api/chatbot/chat - ${error.message}`);
      return false;
    }
  }
}