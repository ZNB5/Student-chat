import React, { createContext, useContext, useState, useEffect } from 'react';
import { getChannelsByUser, getChannelBasicInfo } from '../api/channelsApi';
import { useAuth } from './AuthContext';

const ChannelsContext = createContext(null);

export const ChannelsProvider = ({ children }) => {
  const { user } = useAuth();
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChannels = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getChannelsByUser(userId);
      const normalizedChannels = Array.isArray(data) ? data.map(ch => ({
        ...ch,
        id: ch._id || ch.id
      })) : [];
      setChannels(normalizedChannels);
      if (normalizedChannels.length > 0) {
        setSelectedChannel(normalizedChannels[0]);
      }
    } catch (err) {
      setError(err.detail || err.message || 'Failed to fetch channels');
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchChannelInfo = async (channelId) => {
    try {
      const data = await getChannelBasicInfo(channelId);
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
    } catch (err) {
      setMessages([]);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchChannels(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    if (selectedChannel) {
      fetchChannelInfo(selectedChannel.id);
    }
  }, [selectedChannel]);

  const selectChannel = (channel) => {
    setSelectedChannel(channel);
  };

  const addMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const removeMessage = (messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const addChannel = (channel) => {
    const normalized = { ...channel, id: channel._id || channel.id };
    setChannels(prev => [...prev, normalized]);
  };

  const updateChannelInList = (channelId, updatedChannel) => {
    const normalized = { ...updatedChannel, id: updatedChannel._id || updatedChannel.id };
    setChannels(prev => prev.map(ch => ch.id === channelId ? normalized : ch));
  };

  const removeChannel = (channelId) => {
    setChannels(prev => prev.filter(ch => ch.id !== channelId));
    if (selectedChannel?.id === channelId) {
      setSelectedChannel(null);
    }
  };

  const value = {
    channels,
    selectedChannel,
    messages,
    loading,
    error,
    fetchChannels,
    selectChannel,
    addMessage,
    removeMessage,
    addChannel,
    updateChannelInList,
    removeChannel,
  };

  return <ChannelsContext.Provider value={value}>{children}</ChannelsContext.Provider>;
};

export const useChannels = () => {
  const context = useContext(ChannelsContext);
  if (!context) {
    throw new Error('useChannels must be used within ChannelsProvider');
  }
  return context;
};
