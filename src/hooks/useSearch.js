import { useState } from 'react';
import { searchContent, searchMessages, searchFiles } from '../api/searchApi';

export const useSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async (query, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchContent(
        query,
        options.channelId,
        options.threadId,
        options.authorId,
        options.index,
        options.limit,
        options.offset
      );
      setResults(data.results || []);
    } catch (err) {
      console.error('Search error:', err);
      setError(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const searchMessagesByQuery = async (query, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchMessages(
        query,
        options.authorId,
        options.threadId,
        options.messageId,
        options.limit,
        options.offset
      );
      setResults(data.results || []);
    } catch (err) {
      console.error('Search error:', err);
      setError(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const searchFilesByQuery = async (query, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchFiles(
        query,
        options.threadId,
        options.messageId,
        options.pagesMin,
        options.pagesMax,
        options.limit,
        options.offset
      );
      setResults(data.results || []);
    } catch (err) {
      console.error('Search error:', err);
      setError(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  return {
    results,
    loading,
    error,
    search,
    searchMessagesByQuery,
    searchFilesByQuery,
    clearResults,
  };
};

export default useSearch;
