import { useState } from 'react';
import {
  checkMessage,
  analyzeText,
  getModerationStatus,
  getBannedUsers,
  getUserViolations,
  getUserStatus,
  unbanUser,
  resetUserStrikes,
  getChannelStats,
} from '../api/moderationApi';

export const useModeration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const checkMsg = async (text) => {
    setLoading(true);
    setError(null);
    try {
      const result = await checkMessage(text);
      setData(result);
      return result;
    } catch (err) {
      console.error('Moderation check error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const analyze = async (text) => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeText(text);
      setData(result);
      return result;
    } catch (err) {
      console.error('Text analysis error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = async (userId, channelId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getModerationStatus(userId, channelId);
      setData(result);
      return result;
    } catch (err) {
      console.error('Status fetch error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const getBanned = async (channelId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getBannedUsers(channelId);
      setData(result);
      return result;
    } catch (err) {
      console.error('Banned users fetch error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const getViolations = async (userId, channelId, limit = 50) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getUserViolations(userId, channelId, limit);
      setData(result);
      return result;
    } catch (err) {
      console.error('Violations fetch error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const getUserModerationStatus = async (userId, channelId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getUserStatus(userId, channelId);
      setData(result);
      return result;
    } catch (err) {
      console.error('User status fetch error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const unban = async (userId, channelId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await unbanUser(userId, channelId);
      setData(result);
      return result;
    } catch (err) {
      console.error('Unban error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const resetStrikes = async (userId, channelId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await resetUserStrikes(userId, channelId);
      setData(result);
      return result;
    } catch (err) {
      console.error('Reset strikes error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const getStats = async (channelId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getChannelStats(channelId);
      setData(result);
      return result;
    } catch (err) {
      console.error('Stats fetch error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    checkMsg,
    analyze,
    getStatus,
    getBanned,
    getViolations,
    getUserModerationStatus,
    unban,
    resetStrikes,
    getStats,
  };
};

export default useModeration;
