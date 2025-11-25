import { useState } from 'react';
import { chatWithCode } from '../api/codeApi';

export const useCode = () => {
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (message) => {
    setLoading(true);
    setError(null);
    try {
      const response = await chatWithCode(message);
      setConversation([
        ...conversation,
        { role: 'user', content: message },
        { role: 'assistant', content: response.reply },
      ]);
      return response;
    } catch (err) {
      console.error('Code chat error:', err);
      setError(err);
      throw err;
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

export default useCode;
