import apiClient from './client';

export const groupsApi = {
  /**
   * Get all groups in organization
   * @returns {Promise} { count, data: groups[] }
   */
  getGroups: () => apiClient.get('/groups'),

  /**
   * Get single group by ID
   * @param {String} groupId
   * @returns {Promise} { data: group }
   */
  getGroup: (groupId) => apiClient.get(`/groups/${groupId}`),

  /**
   * Create new group (admin only)
   * @param {Object} data - { name, members[] }
   * @returns {Promise} { data: group }
   */
  createGroup: (data) => apiClient.post('/groups', data),

  /**
   * Update group name (admin only)
   * @param {String} groupId
   * @param {Object} data - { name }
   * @returns {Promise} { data: group }
   */
  updateGroup: (groupId, data) => apiClient.patch(`/groups/${groupId}`, data),

  /**
   * Manage group members - add or remove (admin only)
   * @param {String} groupId
   * @param {String} action - "add" or "remove"
   * @param {Array} userIds - Array of user IDs
   * @returns {Promise} { data: { group, updatedCount } }
   */
  manageMembers: (groupId, action, userIds) => 
    apiClient.patch(`/groups/${groupId}/members`, { action, userIds }),

  /**
   * Delete group (admin only)
   * @param {String} groupId
   */
  deleteGroup: (groupId) => apiClient.delete(`/groups/${groupId}`)
};