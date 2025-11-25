import { useState } from 'react';
import {
  createPresence,
  getUserPresence,
  updatePresence,
  deletePresence,
  getPresenceStats,
  listPresences,
} from '../api/presenceApi';

export const usePresence = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const create = async (userId, status = 'online') => {
    setLoading(true);
    setError(null);
    try {
      const result = await createPresence(userId, status);
      setData(result);
      return result;
    } catch (err) {
      console.error('Create presence error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const getUser = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getUserPresence(userId);
      setData(result);
      return result;
    } catch (err) {
      console.error('Get user presence error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const update = async (userId, status) => {
    setLoading(true);
    setError(null);
    try {
      const result = await updatePresence(userId, status);
      setData(result);
      return result;
    } catch (err) {
      console.error('Update presence error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await deletePresence(userId);
      setData(result);
      return result;
    } catch (err) {
      console.error('Delete presence error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const getStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getPresenceStats();
      setData(result);
      return result;
    } catch (err) {
      console.error('Get stats error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const list = async (status = null) => {
    setLoading(true);
    setError(null);
    try {
      const result = await listPresences(status);
      setData(result);
      return result;
    } catch (err) {
      console.error('List presences error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    create,
    getUser,
    update,
    remove,
    getStats,
    list,
  };
};

export default usePresence;
