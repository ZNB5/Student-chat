import React, { createContext, useContext, useState } from 'react';
import { getMessages } from '../api/messagesApi';

const MessagesContext = createContext();

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within MessagesProvider');
  }
  return context;
};

export const MessagesProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = async (threadId, limit = 50) => {
    setLoading(true);
    try {
      const data = await getMessages(threadId, limit);
      // API returns 'items' not 'messages'
      setMessages(data.items || data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const addMessage = (message) => {
    setMessages([...messages, message]);
  };

  const updateMessageInList = (messageId, updatedMessage) => {
    setMessages(messages.map((msg) => (msg.id === messageId ? updatedMessage : msg)));
  };

  const removeMessage = (messageId) => {
    setMessages(messages.filter((msg) => msg.id !== messageId));
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const value = {
    messages,
    loading,
    fetchMessages,
    addMessage,
    updateMessageInList,
    removeMessage,
    clearMessages,
  };

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
};

export default MessagesProvider;
