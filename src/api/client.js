import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ CRITICAL: Send cookies with every request
});

// ✅ Request interceptor - log outgoing requests
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ✅ Response interceptor - handle responses and errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response.data; // Return only the data portion
  },
  (error) => {
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`);
    
    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        console.error('🔒 Unauthorized - Token may be invalid or expired');
      }
      
      if (status === 403) {
        console.error('🚫 Forbidden - Insufficient permissions');
      }
      
      if (status >= 500) {
        console.error('🔥 Server Error');
      }
      
      // Return the error data from backend
      return Promise.reject(data);
    } else if (error.request) {
      // Request made but no response received
      console.error('📡 No response from server');
      return Promise.reject({
        success: false,
        message: 'No response from server. Please check your connection.',
      });
    } else {
      // Something else happened
      console.error('⚠️ Error:', error.message);
      return Promise.reject({
        success: false,
        message: error.message,
      });
    }
  }
);

export default apiClient;