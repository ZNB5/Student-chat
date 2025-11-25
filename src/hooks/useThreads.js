import { useState, useCallback } from 'react';
import {
  createThread,
  listThreads,
  getThread,
  updateThread,
  deleteThread,
  archiveThread,
} from '../api/threadsApi';

export const useThreads = () => {
  const [threads, setThreads] = useState([]);
  const [currentThread, setCurrentThread] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchThreads = useCallback(async (channelId = null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listThreads(channelId);
      setThreads(data);
      return data;
    } catch (err) {
      const errorMessage = err.detail || err.message || 'Failed to fetch threads';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchThread = useCallback(async (threadId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getThread(threadId);
      setCurrentThread(data);
      return data;
    } catch (err) {
      const errorMessage = err.detail || err.message || 'Failed to fetch thread';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createNewThread = useCallback(async (threadData) => {
    setLoading(true);
    setError(null);
    try {
      const newThread = await createThread(threadData);
      setThreads((prev) => [...prev, newThread]);
      return newThread;
    } catch (err) {
      const errorMessage = err.detail || err.message || 'Failed to create thread';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCurrentThread = useCallback(async (threadId, threadData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateThread(threadId, threadData);
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? updated : t))
      );
      if (currentThread?.id === threadId) {
        setCurrentThread(updated);
      }
      return updated;
    } catch (err) {
      const errorMessage = err.detail || err.message || 'Failed to update thread';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentThread]);

  const removeThread = useCallback(async (threadId) => {
    setLoading(true);
    setError(null);
    try {
      await deleteThread(threadId);
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      if (currentThread?.id === threadId) {
        setCurrentThread(null);
      }
      return true;
    } catch (err) {
      const errorMessage = err.detail || err.message || 'Failed to delete thread';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentThread]);

  const archiveCurrentThread = useCallback(async (threadId) => {
    setLoading(true);
    setError(null);
    try {
      const archived = await archiveThread(threadId);
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? archived : t))
      );
      if (currentThread?.id === threadId) {
        setCurrentThread(archived);
      }
      return archived;
    } catch (err) {
      const errorMessage = err.detail || err.message || 'Failed to archive thread';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentThread]);

  const clearError = useCallback(() => setError(null), []);

  return {
    threads,
    currentThread,
    loading,
    error,
    clearError,
    fetchThreads,
    fetchThread,
    createNewThread,
    updateCurrentThread,
    removeThread,
    archiveCurrentThread,
  };
};
