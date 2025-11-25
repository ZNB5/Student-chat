import apiService from './apiService';

// Chat with Wikipedia integration
export const chatWithWikipedia = async (message) => {
  try {
    const response = await apiService.wikipedia.chat({
      message: message,
    });
    return response.data;
  } catch (error) {
    console.error('Error chatting with Wikipedia:', error);
    throw error.response?.data || error;
  }
};

export default {
  chatWithWikipedia,
};
