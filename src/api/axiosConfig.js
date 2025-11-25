import axios from 'axios';

export const setupAxiosInterceptors = (apiInstance) => {
  apiInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    console.log('Axios interceptor - Token from localStorage:', token ? 'FOUND' : 'NOT FOUND');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set to:', `Bearer ${token.substring(0, 20)}...`);
    }

    // Always set X-User-Id from localStorage if available
    const userId = localStorage.getItem('userId');
    if (userId) {
      config.headers['X-User-Id'] = String(userId);
    }

    console.log('Final config headers:', Object.keys(config.headers));
    return config;
  });

  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return apiInstance;
};

export default setupAxiosInterceptors;
