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
  getTaskReports: (range = 'month', groupId = null) => 
    apiClient.get('/analytics/task-reports', { 
      params: { range, ...(groupId && { groupId }) } 
    }),
  
  getTasksByStatus: (range = 'month') => 
    apiClient.get('/analytics/tasks/status', { params: { range } }),
  
  getTasksByPriority: (range = 'month') => 
    apiClient.get('/analytics/tasks/priority', { params: { range } }),
  
  getTaskCompletionTrend: (range = 'month') => 
    apiClient.get('/analytics/tasks/completion-trend', { params: { range } }),
  
  getAverageCompletionTime: (range = 'month') => 
    apiClient.get('/analytics/tasks/avg-completion-time', { params: { range } }),
  
  getOverdueTasks: () => 
    apiClient.get('/analytics/tasks/overdue'),

  exportTaskReport: async (range = 'month', groupId = null) => {
  try {
    const response = await apiClient.get('/analytics/tasks/export', {
      params: { range, groupId: groupId || 'all' },
      responseType: 'blob', // ✅ Keep this
      headers: {
        'Accept': 'text/csv' // ✅ Add this
      }
    });
    
    // ✅ Ensure it's a Blob
    if (!(response.data instanceof Blob)) {
      throw new Error('Response is not a Blob');
    }
    
    return response;
  } catch (error) {
    console.error('Export API error:', error);
    throw error;
  }
}


};