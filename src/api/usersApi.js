import apiService from './apiService';

export const registerUser = async (userData) => {
  try {
    const response = await apiService.users.register(userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const loginUser = async (usernameOrEmail, password) => {
  try {
    const response = await apiService.users.login({
      username_or_email: usernameOrEmail,
      password,
    });

    // Handle case where response.data might be a string
    const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    return data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await apiService.users.getCurrentUser();
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const response = await apiService.users.updateCurrentUser(userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('accessToken', token);
  }
};

export const removeAuthToken = () => {
  localStorage.removeItem('accessToken');
};

export default {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile,
  setAuthToken,
  removeAuthToken,
};
