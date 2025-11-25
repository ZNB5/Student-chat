import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, setAuthToken, removeAuthToken } from '../api/usersApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          setAuthToken(token);
          const userData = await getCurrentUser();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('userId', userData.id);
        }
      } catch (err) {
        removeAuthToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (user, token) => {
    try {
      setError(null);
      setAuthToken(token);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userId', String(user.id));
      console.log('User ID saved:', user.id, 'Type:', typeof user.id);
      return user;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    setError(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
