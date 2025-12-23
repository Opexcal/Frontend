import apiClient from "./client";

// User management API (Admin+)
export const usersApi = {
  list: (includeInactive = false) =>
    apiClient.get(`/users${includeInactive ? '?includeInactive=true' : ''}`),
  get: (id) => apiClient.get(`/users/${id}`),
  update: (id, data) => apiClient.patch(`/users/${id}`, data),
  deactivate: (id) => apiClient.delete(`/users/${id}`),
  reactivate: (id) => apiClient.patch(`/users/${id}/reactivate`),
};

export default usersApi;

