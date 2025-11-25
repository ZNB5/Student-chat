import { useState, useCallback } from 'react';
import {
  listChannels,
  getChannel,
  createChannel,
  updateChannel,
  deleteChannel,
  reactivateChannel,
  getChannelMembers,
  addChannelMember,
  removeChannelMember,
  getUserChannels,
  getOwnedChannels,
} from '../api/channelsApi';

export const useChannels = () => {
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChannels = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listChannels(page, pageSize);
      setChannels(data);
      return data;
    } catch (err) {
      const errorMessage = err.detail || err.message || 'Failed to fetch channels';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchChannel = useCallback(async (channelId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getChannel(channelId);
      setCurrentChannel(data);
      return data;
    } catch (err) {
      const errorMessage = err.detail || err.message || 'Failed to fetch channel';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserChannels = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserChannels(userId);
      setChannels(data);
      return data;
    } catch (err) {
      const errorMessage = err.detail || err.message || 'Failed to fetch user channels';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOwnedChannels = useCallback(async (ownerId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOwnedChannels(ownerId);
      setChannels(data);
      return data;
    } catch (err) {
      const errorMessage = err.detail || err.message || 'Failed to fetch owned channels';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createNewChannel = useCallback(async (channelData) => {
    setLoading(true);
    setError(null);
    try {
      const newChannel = await createChannel(channelData);
      setChannels((prev) => [...prev, newChannel]);
      return newChannel;
    } catch (err) {
      const errorMessage = err.detail || err.message || 'Failed to create channel';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCurrentChannel = useCallback(async (channelId, channelData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateChannel(channelId, channelData);
      setChannels((prev) =>
        prev.map((c) => (c.id === channelId ? updated : c))
      );
      if (currentChannel?.id === channelId) {
        setCurrentChannel(updated);
      }
      return updated;
    } catch (err) {
      const errorMessage = err.detail || err.message || 'Failed to update channel';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentChannel]);

  const removeChannel = useCallback(async (channelId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteChannel(channelId);
      setChannels((prev) => prev.filter((c) => c.id !== channelId));
      if (currentChannel?.id === channelId) {
        setCurrentChannel(null);
      }
      return true;
    } catch (err) {
      const errorMessage = err.detail || err.message || 'Failed to delete channel';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentChannel]);

  const reactivateCurrentChannel = useCallback(async (channelId) => {
    setLoading(true);
    setError(null);
    try {
      const reactivated = await reactivateChannel(channelId);
      setChannels((prev) =>
        prev.map((c) => (c.id === channelId ? reactivated : c))
      );
      if (currentChannel?.id === channelId) {
        setCurrentChannel(reactivated);
      }
      return reactivated;
    } catch (err) {
      const errorMessage = err.detail || err.message || 'Failed to reactivate channel';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentChannel]);

  const fetchChannelMembers = useCallback(async (channelId, page = 1, pageSize = 100) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getChannelMembers(channelId, page, pageSize);
      setMembers(data);
      return data;
    } catch (err) {
      const errorMessage = err.detail || err.message || 'Failed to fetch members';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addMember = useCallback(async (channelId, userId) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await addChannelMember(channelId, userId);
      setChannels((prev) =>
        prev.map((c) => (c.id === channelId ? updated : c))
      );
      if (currentChannel?.id === channelId) {
        setCurrentChannel(updated);
      }
      return updated;
    } catch (err) {
      const errorMessage = err.detail || err.message || 'Failed to add member';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentChannel]);

  const removeMember = useCallback(async (channelId, userId) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await removeChannelMember(channelId, userId);
      setChannels((prev) =>
        prev.map((c) => (c.id === channelId ? updated : c))
      );
      if (currentChannel?.id === channelId) {
        setCurrentChannel(updated);
      }
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
      return updated;
    } catch (err) {
      const errorMessage = err.detail || err.message || 'Failed to remove member';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentChannel]);

  const clearError = useCallback(() => setError(null), []);

  return {
    channels,
    currentChannel,
    members,
    loading,
    error,
    clearError,
    fetchChannels,
    fetchChannel,
    fetchUserChannels,
    fetchOwnedChannels,
    createNewChannel,
    updateCurrentChannel,
    removeChannel,
    reactivateCurrentChannel,
    fetchChannelMembers,
    addMember,
    removeMember,
  };
};
