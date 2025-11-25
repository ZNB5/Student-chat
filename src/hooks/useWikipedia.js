import { useState } from 'react';
import { chatWithWikipedia } from '../api/wikipediaApi';

export const useWikipedia = () => {
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (message) => {
    setLoading(true);
    setError(null);
    try {
      const response = await chatWithWikipedia(message);
      setConversation([
        ...conversation,
        { role: 'user', content: message },
        { role: 'assistant', content: response.reply },
      ]);
      return response;
    } catch (err) {
      console.error('Wikipedia chat error:', err);
      setError(err);
      throw err; // Re-throw the error so the caller can handle it
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

export default useWikipedia;
