import apiClient from "./client";

// User management API (Admin+)
export const usersApi = {
  // List users
  list: (includeInactive = false) =>
  apiClient.get(`/users${includeInactive ? '?includeInactive=true' : ''}`),
  
  // Get single user
  get: (id) => apiClient.get(`/users/${id}`),
  getUsers: () => apiClient.get('/users'),
  
  // ✅ CREATE USER - This was missing!
  create: (data) => apiClient.post('/users', data),
  
  // Update user
  update: (id, data) => apiClient.patch(`/users/${id}`, data),
  
  // Deactivate user (soft delete)
  deactivate: (id) => apiClient.delete(`/users/${id}`),
  
  // Reactivate user
  reactivate: (id) => apiClient.patch(`/users/${id}/reactivate`),
};

export default usersApi;