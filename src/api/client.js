// src/api/client.js
import axios from 'axios';

// ✅ Fix: Use environment variable correctly
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


// Request Interceptor: Add auth token

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ REQUEST INTERCEPTOR - Attach token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// ✅ RESPONSE INTERCEPTOR - Handle responses and errors
apiClient.interceptors.response.use(
  (response) => response.data, // Return only the data
  (error) => {
    // Handle 401 Unauthorized - token expired/invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    // Return a consistent error object
    return Promise.reject(
      error.response?.data || { message: 'Network error' }
    );
  }
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