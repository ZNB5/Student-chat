import { useState } from 'react';
import { chatWithBot } from '../api/chatbotApi';

export const useChatbot = () => {
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (message) => {
    setLoading(true);
    setError(null);
    try {
      const response = await chatWithBot(message, conversation);
      setConversation([
        ...conversation,
        { role: 'user', content: message },
        { role: 'assistant', content: response.reply },
      ]);
      return response;
    } catch (err) {
      console.error('Chatbot error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = () => {
    setConversation([]);
    setError(null);
  };

  return {
    conversation,
    loading,
    error,
    sendMessage,
    clearConversation,
  };
};

export default useChatbot;
