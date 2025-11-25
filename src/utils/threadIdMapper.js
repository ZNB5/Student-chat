/**
 * Maps MongoDB ObjectIds to UUIDs and caches them
 * This ensures consistent UUID generation for each ObjectId
 */

const THREAD_UUID_MAP_KEY = 'threadUuidMap';

/**
 * Generate a UUID v4 format string
 */
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Get or create a UUID for a MongoDB ObjectId
 * @param {string} mongoId - The MongoDB ObjectId
 * @returns {string} A consistent UUID for this ObjectId
 */
export const getUUIDForThread = (mongoId) => {
  if (!mongoId) return null;

  // If it's already a UUID, return as-is
  if (mongoId.includes('-') && mongoId.length === 36) {
    return mongoId;
  }

  // Get the cache from localStorage
  let cache = {};
  try {
    const cached = localStorage.getItem(THREAD_UUID_MAP_KEY);
    if (cached) {
      cache = JSON.parse(cached);
    }
  } catch (e) {
    console.warn('Failed to parse thread UUID cache:', e);
  }

  // If we already have a UUID for this ObjectId, return it
  if (cache[mongoId]) {
    return cache[mongoId];
  }

  // Generate a new UUID and cache it
  const newUUID = generateUUID();
  cache[mongoId] = newUUID;

  // Save the cache
  try {
    localStorage.setItem(THREAD_UUID_MAP_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Failed to save thread UUID cache:', e);
  }

  return newUUID;
};

/**
 * Clear the UUID cache
 */
export const clearThreadUUIDCache = () => {
  try {
    localStorage.removeItem(THREAD_UUID_MAP_KEY);
  } catch (e) {
    console.warn('Failed to clear thread UUID cache:', e);
  }
};

export default {
  getUUIDForThread,
  clearThreadUUIDCache,
};
