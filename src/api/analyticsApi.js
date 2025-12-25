import apiClient from './client';

export const analyticsApi = {
  getUserGrowth: (period = 'month') => 
    apiClient.get('/analytics/user-growth', { params: { period } }),
  
  getTaskCompletion: (period = 'month') => 
    apiClient.get('/analytics/task-completion', { params: { period } }),
  
  getEventAttendance: (period = 'month') => 
    apiClient.get('/analytics/event-attendance', { params: { period } }),
  
  getTopPerformers: (limit = 5) => 
    apiClient.get('/analytics/top-performers', { params: { limit } }),
  
  getDepartmentPerformance: () => 
    apiClient.get('/analytics/department-performance'),
};