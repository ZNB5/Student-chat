import apiService from './apiService';

// Chat with the programming bot
export const chatWithProgrammingBot = async (message) => {
  try {
    const response = await apiService.programming.chat({
      message,
    });
    return response.data;
  } catch (error) {
    console.error('Error chatting with programming bot:', error);
    throw error.response?.data || error;
  }
};

export default {
  chatWithProgrammingBot,
};
