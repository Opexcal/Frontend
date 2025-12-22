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
   * Logout (client-side only - clear token)
   */
  logout: () => {
    localStorage.removeItem('authToken');
  }
};


