import apiClient from './client';

export const analyticsApi = {
  getUserGrowth: (range = 'month') => 
    apiClient.get('/analytics/user-growth', { params: { range } }),
  
  getTaskCompletion: (range = 'month') => 
    apiClient.get('/analytics/task-completion', { params: { range } }),
  
  getEventAttendance: (range = 'month') => 
    apiClient.get('/analytics/event-attendance', { params: { range } }),
  
  getTopPerformers: (limit = 5) => 
    apiClient.get('/analytics/top-performers', { params: { limit } }),
  
  getDepartmentPerformance: () => 
    apiClient.get('/analytics/department-performance'),
  
  getKPIs: () => 
    apiClient.get('/analytics/kpis'), // Add this endpoint
};