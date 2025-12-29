// src/api/groupsApi.js - Fix template literal syntax
import apiClient from './client';

// src/api/groupsApi.js - CORRECTED
export const groupsApi = {
  getGroups: () => apiClient.get('/groups'),
  
  getGroup: (id) => apiClient.get(`/groups/${id}`),
  
  createGroup: (data) => apiClient.post('/groups', data),
  
  updateGroup: (id, data) => apiClient.patch(`/groups/${id}`, data),
  
  manageMembers: (groupId, action, userIds) => 
    apiClient.patch(`/groups/${groupId}/members`, { action, userIds }),
  
  deleteGroup: (id) => apiClient.delete(`/groups/${id}`),
};