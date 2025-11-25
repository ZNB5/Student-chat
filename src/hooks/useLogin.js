import { useState } from 'react';
import { loginUser, getCurrentUser, setAuthToken } from '../api/usersApi';
import { useAuth } from '../context/AuthContext';

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const handleLogin = async (usernameOrEmail, password) => {
    setLoading(true);
    setError(null);
    try {
      const tokenData = await loginUser(usernameOrEmail, password);
      console.log('Login response:', tokenData);
      console.log('Type of tokenData:', typeof tokenData);
      console.log('Keys in tokenData:', Object.keys(tokenData));

      // Extract the actual token - it might be nested
      const token = tokenData.access_token || (tokenData.data && tokenData.data.access_token);
      console.log('Extracted token:', token ? 'FOUND' : 'NOT FOUND');

      if (!token) {
        throw new Error('No access token received from login');
      }

      setAuthToken(token);
      console.log('Token saved to localStorage:', localStorage.getItem('accessToken'));

      const userData = await getCurrentUser();
      console.log('User data retrieved:', userData);
      await login(userData, token);
      return userData;
    } catch (err) {
      const errorMessage = err.detail || err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading, error };
};
