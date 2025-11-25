import apiService from './apiService';

export const createPresence = async (presenceData) => {
  try {
    const response = await apiService.presence.create(presenceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const listPresences = async (params = null) => {
  try {
    const response = await apiService.presence.list(params);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPresenceStats = async () => {
  try {
    const response = await apiService.presence.getStats();
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUserPresence = async (userId) => {
  try {
    const response = await apiService.presence.get(userId);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updatePresence = async (userId, presenceData) => {
  try {
    const response = await apiService.presence.update(userId, presenceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deletePresence = async (userId) => {
  try {
    const response = await apiService.presence.delete(userId);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Aliases for backward compatibility with old function names
export const connectUser = createPresence;
export const disconnectUser = deletePresence;
