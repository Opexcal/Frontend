// src/api/client.js
import axios from 'axios';

// ✅ Fix: Use environment variable correctly
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Add auth token
apiClient.interceptors.request.use(
  (config) => {
    console.log('🔍 REQUEST DEBUG:');
    console.log('URL:', config.url);
    console.log('Method:', config.method);
    console.log('Data being sent:', config.data);
    console.log('Headers:', config.headers);
    
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle common errors
apiClient.interceptors.response.use(
  (response) => response.data, // Return only data portion
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        // Token expired or invalid
        localStorage.removeItem('authToken');
        // ✅ Check if we're not already on login page to avoid infinite loop
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      
      return Promise.reject(data);
    }
    
    // Network error or no response
    return Promise.reject({ 
      success: false, 
      message: 'Network error. Please check your connection.' 
    });
  }
);

export default apiClient;