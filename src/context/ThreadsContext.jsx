import React, { createContext, useContext, useState, useEffect } from 'react';
import { listThreads, getThread } from '../api/threadsApi';
import { getUUIDForThread } from '../utils/threadIdMapper';

const ThreadsContext = createContext(null);

export const ThreadsProvider = ({ children }) => {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentChannelId, setCurrentChannelId] = useState(null);

  const fetchThreads = async (channelId) => {
    setLoading(true);
    setError(null);
    setCurrentChannelId(channelId);
    try {
      const data = await listThreads(channelId);
      const normalizedThreads = Array.isArray(data) ? data.map(th => {
        const mongoId = th.thread_id || th._id || th.id;
        const uuidId = getUUIDForThread(mongoId);
        return {
          ...th,
          id: mongoId,
          _mongoId: mongoId,
          _uuidId: uuidId
        };
      }) : [];
      setThreads(normalizedThreads);
      if (normalizedThreads.length > 0) {
        setSelectedThread(normalizedThreads[0]);
      } else {
        setSelectedThread(null);
      }
    } catch (err) {
      setError(err.detail || err.message || 'Failed to fetch threads');
      setThreads([]);
      setSelectedThread(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchThreadDetail = async (threadId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getThread(threadId);
      const normalized = { ...data, id: data._id || data.id };
      setSelectedThread(normalized);
      return normalized;
    } catch (err) {
      setError(err.detail || err.message || 'Failed to fetch thread');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const selectThread = (thread) => {
    setSelectedThread(thread);
  };

  const addThread = (thread) => {
    const normalized = { ...thread, id: thread._id || thread.id };
    setThreads(prev => [...prev, normalized]);
  };

  const updateThreadInList = (threadId, updatedThread) => {
    const normalized = { ...updatedThread, id: updatedThread._id || updatedThread.id };
    setThreads(prev => prev.map(th => th.id === threadId ? normalized : th));
    if (selectedThread?.id === threadId) {
      setSelectedThread(normalized);
    }
  };

  const removeThread = (threadId) => {
    setThreads(prev => prev.filter(th => th.id !== threadId));
    if (selectedThread?.id === threadId) {
      setSelectedThread(null);
    }
  };

  const clearThreads = () => {
    setThreads([]);
    setSelectedThread(null);
    setCurrentChannelId(null);
  };

  const value = {
    threads,
    selectedThread,
    loading,
    error,
    currentChannelId,
    fetchThreads,
    fetchThreadDetail,
    selectThread,
    addThread,
    updateThreadInList,
    removeThread,
    clearThreads,
  };

  return <ThreadsContext.Provider value={value}>{children}</ThreadsContext.Provider>;
};

export const useThreads = () => {
  const context = useContext(ThreadsContext);
  if (!context) {
    throw new Error('useThreads must be used within ThreadsProvider');
  }
  return context;
};
