import apiClient from './client';

export const authApi = {
  /**
   * Register new user or organization
   * @param {Object} data - { name, email, password, orgName?, orgSlug? }
   * @returns {Promise} { token, user }
   */
  register: (data) => apiClient.post('/auth/register', data),
  
  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise} { token, user }
   */
  login: (credentials) => apiClient.post('/auth/login', credentials),
  
  /**
   * Get current user profile
   * @returns {Promise} { user }
   */
  getMe: () => apiClient.get('/auth/me'),
  
  /**
   * Request password reset link
   * @param {Object} data - { email }
   * @returns {Promise}
   */
  forgotPassword: (data) => apiClient.post('/auth/forgot-password', data),
  
  /**
   * Reset password with token
   * @param {string} resetToken - Token from email link
   * @param {Object} data - { password }
   * @returns {Promise}
   */
  resetPassword: (resetToken, data) => 
    apiClient.put(`/auth/reset-password/${resetToken}`, data),  // ✅ Fixed: Changed template literal from backticks to regular string
  
  /**
   * Logout user
   * @returns {Promise}
   */
  logout: async () => {
    return await apiClient.post('/auth/logout');
  },
};