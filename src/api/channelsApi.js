import apiService from './apiService';

export const getChannelsByUser = async (userId) => {
  try {
    // Note: This endpoint may not exist in the new gateway, using list channels as alternative
    const response = await apiService.channels.list({ page: 1, page_size: 50 });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getChannelBasicInfo = async (channelId) => {
  try {
    // Note: Basic info endpoint may not exist in the new gateway, using get channel as alternative
    const response = await apiService.channels.get(channelId);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createChannel = async (channelData) => {
  try {
    const response = await apiService.channels.create(channelData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateChannel = async (channelId, channelData) => {
  try {
    const response = await apiService.channels.update(channelId, channelData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteChannel = async (channelId) => {
  try {
    const response = await apiService.channels.delete(channelId);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const reactivateChannel = async (channelId) => {
  try {
    // Note: Reactivate endpoint may not exist in the new gateway
    // Implementing as a potential update call or placeholder
    const response = await apiService.channels.update(channelId, { active: true });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getChannelMembers = async (channelId, page = 1, pageSize = 100) => {
  // Note: This endpoint may not exist directly in the gateway
  // This would require a custom implementation or using search
  try {
    const response = await apiService.search.channels({ q: channelId, page, page_size: pageSize });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addChannelMember = async (channelId, userId) => {
  // Note: Adding members might be a search or custom endpoint
  // This is a placeholder implementation
  throw new Error('addChannelMember not implemented in gateway');
};

export const removeChannelMember = async (channelId, userId) => {
  // Note: Removing members might be a search or custom endpoint
  // This is a placeholder implementation
  throw new Error('removeChannelMember not implemented in gateway');
};

/**
 * List all channels with pagination
 * @param {number} [page=1] - Page number
 * @param {number} [pageSize=10] - Page size
 * @returns {Promise<Array>} Array of channels with basic info
 */
export const listChannels = async (page = 1, pageSize = 10) => {
  try {
    const params = { page, page_size: pageSize };
    const response = await apiService.channels.list(params);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get full channel details
 * @param {string} channelId - Channel ID
 * @returns {Promise<Object>} Channel data
 */
export const getChannel = async (channelId) => {
  try {
    const response = await apiService.channels.get(channelId);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get channels where user is a member
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of channels where user is member
 */
export const getUserChannels = async (userId) => {
  try {
    // Using search as alternative since direct endpoint may not exist
    const response = await apiService.search.channels({ member_id: userId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get channels owned by a user
 * @param {string} ownerId - Owner ID
 * @returns {Promise<Array>} Array of channels owned by user
 */
export const getOwnedChannels = async (ownerId) => {
  try {
    // Using search as alternative since direct endpoint may not exist
    const response = await apiService.search.channels({ owner_id: ownerId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  listChannels,
  getChannel,
  getChannelsByUser,
  getUserChannels,
  getOwnedChannels,
  getChannelBasicInfo,
  createChannel,
  updateChannel,
  deleteChannel,
  reactivateChannel,
  getChannelMembers,
  addChannelMember,
  removeChannelMember,
};
