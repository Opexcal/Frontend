import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// console.log('🔧 API URL:', API_URL); // This will tell you what's actually set

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ✅ Request interceptor - log outgoing requests (dev only)
apiClient.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method.toUpperCase()} ${config.url}`);
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
// ✅ Response interceptor - handle responses and errors (dev only logging)
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
        if (status === 401) console.error('🔒 Unauthorized');
        if (status === 403) console.error('🚫 Forbidden');
        if (status >= 500) console.error('🔥 Server Error');
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