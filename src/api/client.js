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
// ✅ Response interceptor - handle responses and errors
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    if (response.config.responseType === 'blob') {
      return response; // Return full response object for blobs
    }
    return response.data;
  },
  (error) => {
    // ✅ Check if we're on a public route
    const publicRoutes = ['/login', '/register', '/forgot-password', '/signup', '/reset-password'];
    const isPublicRoute = publicRoutes.some(route => 
      window.location.pathname.startsWith(route)
    );

    if (import.meta.env.DEV) {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`);
    }
    
    if (error.response) {
      const { status, data } = error.response;
      
      if (import.meta.env.DEV) {
        // ✅ Only log 401 errors if not on public route
        if (status === 401 && !isPublicRoute) {
          console.error('🔒 Unauthorized - Token may be invalid or expired');
          console.error('🍪 Cookies:', document.cookie);
          console.error('🔑 LocalStorage token:', !!localStorage.getItem('authToken'));
        } else if (status === 401 && isPublicRoute) {
          console.log('ℹ️ 401 on public route (expected, ignoring)');
        }
        if (status === 403) console.error('🚫 Forbidden');
        if (status >= 500) console.error('🔥 Server Error');
      }
      
      // ✅ Only clear token on 401 if not on public route
      if (status === 401 && !isPublicRoute) {
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