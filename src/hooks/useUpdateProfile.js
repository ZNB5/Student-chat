import { useState } from 'react';
import { updateUserProfile } from '../api/usersApi';
import { useAuth } from '../context/AuthContext';

export const useUpdateProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { updateUser } = useAuth();

  const handleUpdateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await updateUserProfile(userData);
      updateUser(updatedUser);
      return updatedUser;
    } catch (err) {
      const errorMessage = err.detail || err.message || 'Update failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { handleUpdateProfile, loading, error };
};
