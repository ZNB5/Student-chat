import { useState } from 'react';
import { registerUser } from '../api/usersApi';

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await registerUser(userData);
      return result;
    } catch (err) {
      const errorMessage = err.detail || err.message || 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { handleRegister, loading, error };
};
