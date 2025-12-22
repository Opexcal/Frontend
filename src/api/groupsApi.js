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
   * Add members to group (admin only)
   * @param {String} groupId
   * @param {Array} members - Array of user IDs
   * @returns {Promise} { data: group }
   */
  addMembers: (groupId, members) => 
    apiClient.patch(`/groups/${groupId}/members/add`, { members }),

  /**
   * Remove members from group (admin only)
   * @param {String} groupId
   * @param {Array} members - Array of user IDs
   * @returns {Promise} { data: group }
   */
  removeMembers: (groupId, members) => 
    apiClient.patch(`/groups/${groupId}/members/remove`, { members }),

  /**
   * Delete group (admin only)
   * @param {String} groupId
   */
  deleteGroup: (groupId) => apiClient.delete(`/groups/${groupId}`)
};
