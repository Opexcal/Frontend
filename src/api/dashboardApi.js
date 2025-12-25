import apiClient from './client';

export const dashboardApi = {
  getDashboard: () => apiClient.get('/dashboard'),
  
  // Add these new methods:
  getAdminStats: () => apiClient.get('/dashboard/admin/stats'),
  getOrganizationMetrics: (params) => apiClient.get('/dashboard/admin/metrics', { params }),
getGroupsOverview: () => apiClient.get('/dashboard/admin/groups/overview'),
  getRecentActivity: (limit = 10) => apiClient.get('/dashboard/admin/activity', { params: { limit } }),
};