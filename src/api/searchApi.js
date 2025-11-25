import apiService from './apiService';

// General search across messages, threads, and files
export const searchContent = async (query, channelId = null, threadId = null, authorId = null, index = 0, limit = 20, offset = 0) => {
  try {
    const params = {
      q: query,
      channel_id: channelId,
      thread_id: threadId,
      author_id: authorId,
      index,
      limit,
      offset,
    };
    // Using the messages search as general search endpoint
    const response = await apiService.search.messages(params);
    return response.data;
  } catch (error) {
    console.error('Error searching content:', error);
    throw error.response?.data || error;
  }
};

// Search messages
export const searchMessages = async (query, authorId = null, threadId = null, messageId = null, limit = 20, offset = 0) => {
  try {
    const params = {
      q: query,
      author_id: authorId,
      thread_id: threadId,
      message_id: messageId,
      limit,
      offset,
    };
    const response = await apiService.search.messages(params);
    return response.data;
  } catch (error) {
    console.error('Error searching messages:', error);
    throw error.response?.data || error;
  }
};

// Search files
export const searchFiles = async (query, threadId = null, messageId = null, pagesMin = null, pagesMax = null, limit = 20, offset = 0) => {
  try {
    const params = {
      q: query,
      thread_id: threadId,
      message_id: messageId,
      pages_min: pagesMin,
      pages_max: pagesMax,
      limit,
      offset,
    };
    const response = await apiService.search.files(params);
    return response.data;
  } catch (error) {
    console.error('Error searching files:', error);
    throw error.response?.data || error;
  }
};

// Search threads by ID
export const searchThreadById = async (threadId) => {
  try {
    const response = await apiService.search.threadsById(threadId);
    return response.data;
  } catch (error) {
    console.error('Error searching thread by ID:', error);
    throw error.response?.data || error;
  }
};

// Search threads by category (mapping to author for now since there's no category endpoint)
export const searchThreadByCategory = async (category) => {
  try {
    // Using author search as category is not directly supported
    const response = await apiService.search.threadsByAuthor(category);
    return response.data;
  } catch (error) {
    console.error('Error searching threads by category:', error);
    throw error.response?.data || error;
  }
};

// Search threads by author
export const searchThreadByAuthor = async (author) => {
  try {
    const response = await apiService.search.threadsByAuthor(author);
    return response.data;
  } catch (error) {
    console.error('Error searching threads by author:', error);
    throw error.response?.data || error;
  }
};

// Search threads by date range
export const searchThreadByDateRange = async (startDate, endDate) => {
  try {
    // Date range search is not directly supported, using a general search
    const params = {
      start_date: startDate,
      end_date: endDate,
    };
    const response = await apiService.search.messages(params);
    return response.data;
  } catch (error) {
    console.error('Error searching threads by date range:', error);
    throw error.response?.data || error;
  }
};

// Search threads by tag
export const searchThreadByTag = async (tag) => {
  try {
    // Using general search as tag search is not directly supported
    const response = await apiService.search.messages({ q: tag });
    return response.data;
  } catch (error) {
    console.error('Error searching threads by tag:', error);
    throw error.response?.data || error;
  }
};

// Search threads by keyword
export const searchThreadByKeyword = async (keyword) => {
  try {
    // Using general search as keyword search is not directly supported
    const response = await apiService.search.messages({ q: keyword });
    return response.data;
  } catch (error) {
    console.error('Error searching threads by keyword:', error);
    throw error.response?.data || error;
  }
};

export default {
  searchContent,
  searchMessages,
  searchFiles,
  searchThreadById,
  searchThreadByCategory,
  searchThreadByAuthor,
  searchThreadByDateRange,
  searchThreadByTag,
  searchThreadByKeyword,
};
