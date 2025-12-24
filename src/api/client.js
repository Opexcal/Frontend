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
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const hasToken = !!localStorage.getItem("authToken");

      // Only logout if a token existed and was rejected
      if (status === 401 && hasToken) {
        localStorage.removeItem("authToken");

        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }

      return Promise.reject(data);
    }

    return Promise.reject({
      success: false,
      message: "Network error. Please check your connection."
    });
  }
);


export default apiClient;