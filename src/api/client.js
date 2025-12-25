// src/api/client.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR - Attach token to every request
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

// apiClient.interceptors.response.use(
//   (response) => {
//     // Check if response has async status
//     const data = response.data;
//     if (data.status && ['pending', 'in_progress'].includes(data.status)) {
//       console.warn('Request still processing:', data.status);
//       // You could implement retry logic here
//     }
//     return response;
//   },
//   (error) => {
//     console.error('API Error:', error);
//     return Promise.reject(error);
//   }
// );

// RESPONSE INTERCEPTOR - Handle responses and errors
apiClient.interceptors.response.use(
  (response) => response.data, // Return only the data
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