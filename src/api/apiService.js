import axios from 'axios';
import setupAxiosInterceptors from './axiosConfig';

// Use the API Gateway URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8000';

// Create the base API client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup interceptors
setupAxiosInterceptors(apiClient);

// API Service for the Gateway
const apiService = {
  // Health checks for all services
  health: {
    getGatewayHealth: () => apiClient.get('/health'),
    getUsersHealth: () => apiClient.get('/api/users/health'),
    getChannelsHealth: () => apiClient.get('/api/channels/health'),
    getThreadsHealth: () => apiClient.get('/api/threads/health'),
    getMessagesHealth: () => apiClient.get('/api/messages/health'),
    getPresenceHealth: () => apiClient.get('/api/presence/health'),
    getSearchHealth: () => apiClient.get('/api/search/health'),
    getFilesHealth: () => apiClient.get('/api/files/health'),
    getChatbotHealth: () => apiClient.get('/api/chatbot/health'),
  },

  // Users service
  users: {
    register: (userData) => apiClient.post('/api/users/register', userData),
    login: (loginData) => apiClient.post('/api/users/login', loginData),
    getCurrentUser: () => apiClient.get('/api/users/me'),
    updateCurrentUser: (userData) => apiClient.patch('/api/users/me', userData),
  },

  // Channels service
  channels: {
    list: (params) => apiClient.get('/api/channels', { params }),
    create: (channelData) => apiClient.post('/api/channels', channelData),
    get: (channelId) => apiClient.get(`/api/channels/${channelId}`),
    update: (channelId, channelData) => apiClient.put(`/api/channels/${channelId}`, channelData),
    delete: (channelId) => apiClient.delete(`/api/channels/${channelId}`),
    getMembers: (channelId) => apiClient.get(`/v1/members/${channelId}`),
    addMember: (channelId, userId) => apiClient.post('/v1/members', { channel_id: channelId, user_id: userId }),
  },

  // Threads service
  threads: {
    list: (channelId) => apiClient.get(`/api/channels/${channelId}/threads`),
    get: (threadId) => apiClient.get(`/api/threads/${threadId}`),
    create: (params) => apiClient.post('/api/threads', null, { params }),
    getMyThreads: (userId) => apiClient.get(`/api/threads/mine/${userId}`),
    edit: (threadId, threadData) => apiClient.put(`/api/threads/${threadId}/edit`, threadData),
    delete: (threadId) => apiClient.delete(`/api/threads/${threadId}`),
  },

  // Messages service
  messages: {
    list: (threadId, params, headers) => {
      const config = { params };
      if (headers) {
        config.headers = headers;
      }
      return apiClient.get(`/api/messages/threads/${threadId}/messages`, config);
    },
    create: (threadId, messageData) => apiClient.post(`/api/messages/threads/${threadId}/messages`, messageData),
    update: (threadId, messageId, messageData) => apiClient.put(`/api/messages/threads/${threadId}/messages/${messageId}`, messageData),
    delete: (threadId, messageId) => apiClient.delete(`/api/messages/threads/${threadId}/messages/${messageId}`),
  },

  // Presence service
  presence: {
    create: (presenceData) => apiClient.post('/api/presence', presenceData),
    list: (params) => apiClient.get('/api/presence', { params }),
    get: (userId) => apiClient.get(`/api/presence/${userId}`),
    update: (userId, presenceData) => apiClient.patch(`/api/presence/${userId}`, presenceData),
    delete: (userId) => apiClient.delete(`/api/presence/${userId}`),
    getStats: () => apiClient.get('/api/presence/stats'),
  },

  // Search service
  search: {
    messages: (params) => apiClient.get('/api/search/messages', { params }),
    files: (params) => apiClient.get('/api/search/files', { params }),
    channels: (params) => apiClient.get('/api/search/channels', { params }),
    threadsById: (threadId) => apiClient.get(`/api/search/threads/id/${threadId}`),
    threadsByAuthor: (author) => apiClient.get(`/api/search/threads/author/${author}`),
    search: (params) => apiClient.get('/api/search/messages', { params }), // General search
  },

  // Files service
  files: {
    list: (params) => apiClient.get('/api/files', { params }),
    upload: (fileData) => apiClient.post('/api/files', fileData),
  },

  // Chatbot service
  chatbot: {
    chat: (chatData) => apiClient.post('/api/chatbot/chat', chatData),
  },

  // Wikipedia Command service
  wikipedia: {
    chat: (chatData) => apiClient.post('/api/commands/wikipedia', chatData),
  },

  // Programming Command service
  programming: {
    chat: (chatData) => apiClient.post('/api/commands/programming', chatData),
  },

  // Code Documentation Command service
  code: {
    chat: (chatData) => apiClient.post('/api/commands/code', chatData),
  },
};

export default apiService;