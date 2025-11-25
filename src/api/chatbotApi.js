import apiService from './apiService';

// Chat with the chatbot
export const chatWithBot = async (message, conversationHistory = []) => {
  try {
    const response = await apiService.chatbot.chat({
      message,
      history: conversationHistory,
    });
    return response.data;
  } catch (error) {
    console.error('Error chatting with bot:', error);
    throw error.response?.data || error;
  }
};

export default {
  chatWithBot,
};
