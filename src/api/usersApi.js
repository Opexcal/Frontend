// src/api/usersApi.js - Update with all methods
import apiClient from './client';

export const usersApi = {
  // Get all users
  getUsers: (includeInactive = false) => 
    apiClient.get('/users', { params: { includeInactive } }),
  
  // Aliases for consistency
  list: (includeInactive = false) => 
    apiClient.get('/users', { params: { includeInactive } }),
  
  // Get single user
  get: (id) => apiClient.get(`/users/${id}`),
  
  getUser: (id) => apiClient.get(`/users/${id}`),
  
  // Create user
  create: (data) => apiClient.post('/users', data),
  
  createUser: (data) => apiClient.post('/users', data),
  
  // Update user
  update: (id, data) => apiClient.patch(`/users/${id}`, data),
  
  updateUser: (id, data) => apiClient.patch(`/users/${id}`, data),
  
  // Deactivate user
  deactivate: (id) => apiClient.delete(`/users/${id}`),
  
  deactivateUser: (id) => apiClient.delete(`/users/${id}`),
  
  // Reactivate user
  reactivate: (id) => apiClient.patch(`/users/${id}/reactivate`),
  
  reactivateUser: (id) => apiClient.patch(`/users/${id}/reactivate`),
};

export default usersApi;