import axios from 'axios';
import setupAxiosInterceptors from './axiosConfig';

const API_BASE_URL = window.ENV?.VITE_API_GATEWAY_URL || import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8000';
const api = setupAxiosInterceptors(axios.create({
  baseURL: API_BASE_URL,
}));

// Add/invite user to channel
export const addChannelMember = async (channelId, userId) => {
  try {
    const response = await api.post('/canales/members/', {
      channel_id: channelId,
      user_id: userId,
    });
    return response.data;
  } catch (error) {
    console.error('Error adding channel member:', error);
    throw error.response?.data || error;
  }
};

// Remove user from channel
export const removeChannelMember = async (channelId, userId) => {
  try {
    const response = await api.delete('/canales/members/', {
      data: {
        channel_id: channelId,
        user_id: userId,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error removing channel member:', error);
    throw error.response?.data || error;
  }
};

// Get channels for a specific user
export const getUserChannels = async (userId) => {
  try {
    const response = await api.get(`/canales/members/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user channels:', error);
    throw error.response?.data || error;
  }
};

// Get channels owned by a specific user
export const getOwnedChannels = async (ownerId) => {
  try {
    const response = await api.get(`/canales/members/owner/${ownerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching owned channels:', error);
    throw error.response?.data || error;
  }
};

// Get all members of a channel with pagination
export const getChannelMembers = async (channelId, page = 1, pageSize = 20) => {
  try {
    const response = await api.get(`/canales/members/channel/${channelId}`, {
      params: {
        page,
        page_size: pageSize,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching channel members:', error);
    throw error.response?.data || error;
  }
};
