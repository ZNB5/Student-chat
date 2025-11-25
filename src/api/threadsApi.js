import axios from 'axios';
import setupAxiosInterceptors from './axiosConfig';

// Use the gateway URL from environment variables
const GATEWAY_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8000';
const threadsClient = axios.create({
  baseURL: GATEWAY_BASE_URL
});

// Setup interceptors for authentication
setupAxiosInterceptors(threadsClient);

export const listThreads = async (channelId) => {
  try {
    if (!channelId) {
      console.warn('No channelId provided to listThreads');
      return [];
    }

    console.log('Fetching threads for channel:', channelId);

    // Use gateway endpoint: GET /api/channels/{channel_id}/threads
    const response = await threadsClient.get(`/api/channels/${channelId}/threads`);

    console.log('Threads fetched successfully:', response.data);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching threads:', error);
    console.error('Error details:', error.response?.data || error.message);
    return [];
  }
};

export const getThread = async (threadId) => {
  try {
    // Gateway catch-all adds /threads/ prefix: /api/threads/{threadId} -> /threads/{threadId}
    const response = await threadsClient.get(`/api/threads/${threadId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createThread = async (threadData) => {
  try {
    // POST /api/threads with query params (gateway will forward to /threads/)
    const params = {
      channel_id: threadData.channel_id,
      user_id: threadData.created_by || threadData.user_id,
      thread_name: threadData.title || threadData.threadName || threadData.thread_name,
    };

    console.log('Creating thread with params:', params);

    const response = await threadsClient.post('/api/threads', null, {
      params
    });

    console.log('Thread created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Thread creation error:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const updateThread = async (threadId, threadData) => {
  try {
    // Gateway catch-all: /api/threads/{threadId}/edit -> /threads/{threadId}/edit
    const response = await threadsClient.put(`/api/threads/${threadId}/edit`, threadData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteThread = async (threadId) => {
  try {
    // Gateway catch-all: /api/threads/{threadId} -> /threads/{threadId}
    console.log('Deleting thread:', threadId);
    const response = await threadsClient.delete(`/api/threads/${threadId}`);
    console.log('Thread deleted successfully');
    return response?.data;
  } catch (error) {
    console.error('Error deleting thread:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

export const archiveThread = async (threadId) => {
  try {
    // Gateway catch-all: /api/threads/{threadId}/edit -> /threads/{threadId}/edit
    const response = await threadsClient.put(`/api/threads/${threadId}/edit`, { archived: true });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getThreadsInChannel = async (channelId) => {
  // Use the same logic as listThreads
  return listThreads(channelId);
};

export default {
  listThreads,
  getThread,
  createThread,
  updateThread,
  deleteThread,
  archiveThread,
  getThreadsInChannel,
};
