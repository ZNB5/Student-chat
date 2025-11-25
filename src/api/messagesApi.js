import apiService from './apiService';

// Create a new message
export const createMessage = async (threadId, userId, content) => {
  try {
    // Store userId in localStorage so the interceptor can use it
    localStorage.setItem('userId', String(userId));

    // Match the test format: content, type, and paths
    const messageData = {
      content: content,
      type: "text",
      paths: []
    };

    const response = await apiService.messages.create(threadId, messageData);
    return response.data;
  } catch (error) {
    console.error('Error creating message:', error);
    console.error('Response data:', error.response?.data);
    throw error.response?.data || error;
  }
};

// Get messages in a thread with pagination and cursor
export const getMessages = async (threadId, limit = 50, cursor = null) => {
  try {
    const params = { limit };
    if (cursor) {
      params.cursor = cursor;
    }

    // Get user ID from localStorage like other operations
    const userId = localStorage.getItem('userId');

    // Prepare headers with X-User-Id if available
    let headers = {};
    if (userId) {
      headers['X-User-Id'] = String(userId);
    }

    const response = await apiService.messages.list(threadId, params, headers);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    // Make sure to throw the error properly so it can be caught by the caller
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      throw error.response.data;
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request:', error.request);
      throw new Error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      throw new Error(`Error setting up request: ${error.message}`);
    }
  }
};

// Update a message
export const updateMessage = async (threadId, messageId, userId, content) => {
  try {
    localStorage.setItem('userId', String(userId));
    const response = await apiService.messages.update(threadId, messageId, { content });
    return response.data;
  } catch (error) {
    console.error('Error updating message:', error);
    throw error.response?.data || error;
  }
};

// Delete a message
export const deleteMessage = async (threadId, messageId, userId) => {
  try {
    localStorage.setItem('userId', String(userId));
    const response = await apiService.messages.delete(threadId, messageId);
    return response.data;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error.response?.data || error;
  }
};

export default {
  createMessage,
  getMessages,
  updateMessage,
  deleteMessage,
};
