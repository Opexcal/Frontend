import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ Keep for cookie support
});

// ✅ Request interceptor - Add Authorization header + log requests
apiClient.interceptors.request.use(
  (config) => {
    // ✅ Add Authorization header if token exists (fallback for mobile)
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method.toUpperCase()} ${config.url}`);
      console.log('🍪 Has token:', !!token);
      console.log('🔑 withCredentials:', config.withCredentials);
    }
    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// ✅ Response interceptor - handle responses and errors
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response.data;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`);
    }
    
    if (error.response) {
      const { status, data } = error.response;
      
      if (import.meta.env.DEV) {
        if (status === 401) {
          console.error('🔒 Unauthorized - Token may be invalid or expired');
          console.error('🍪 Cookies:', document.cookie);
          console.error('🔑 LocalStorage token:', !!localStorage.getItem('authToken'));
        }
        if (status === 403) console.error('🚫 Forbidden');
        if (status >= 500) console.error('🔥 Server Error');
      }
      
      // ✅ Clear token on 401 to force re-login
      if (status === 401) {
        localStorage.removeItem('authToken');
      }
      
      return Promise.reject(data);
    } else if (error.request) {
      return Promise.reject({
        success: false,
        message: 'No response from server. Please check your connection.',
      });
    } else {
      return Promise.reject({
        success: false,
        message: error.message,
      });
    }
  }
);

export default apiClient;