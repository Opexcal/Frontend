// src/api/groupsApi.js - Update with all methods
import apiClient from './client';

export const groupsApi = {
  // Get all groups
  getGroups: () => apiClient.get('/groups'),
  
  // Get single group
  getGroup: (id) => apiClient.get(`/groups/${id}`),
  
  // Create group
  createGroup: (data) => apiClient.post('/groups', data),
  
  // Update group
  updateGroup: (id, data) => apiClient.patch(`/groups/${id}`, data),
  
  // Manage members (add or remove)
  manageMembers: (groupId, action, userIds) => 
    apiClient.patch(`/groups/${groupId}/members`, {
      action, // 'add' or 'remove'
      userIds
    }),
  
  // Alias for consistency
  manageGroupMembers: (groupId, data) => 
    apiClient.patch(`/groups/${groupId}/members`, data),
  
  // Delete group
  deleteGroup: (id) => apiClient.delete(`/groups/${id}`),
};

export default groupsApi;