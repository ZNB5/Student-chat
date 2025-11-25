import apiService from './apiService';

// Chat with Code documentation service
export const chatWithCode = async (message) => {
  try {
    const response = await apiService.code.chat({
      message: message,
    });
    return response.data;
  } catch (error) {
    console.error('Error chatting with Code service:', error);
    throw error.response?.data || error;
  }
};

export default {
  chatWithCode,
};
