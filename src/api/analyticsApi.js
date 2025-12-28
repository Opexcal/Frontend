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
},

getTeamProductivity: (range = 'quarter', departmentFilter = 'all') => 
  apiClient.get('/analytics/team-productivity', { 
    params: { range, department: departmentFilter !== 'all' ? departmentFilter : undefined } 
  }),

getTeamMetricsTrend: (range = 'quarter') => 
  apiClient.get('/analytics/team-metrics-trend', { params: { range } }),

getProductivityByDepartment: () => 
  apiClient.get('/analytics/productivity-by-department'),

exportTeamProductivityReport: async (range = 'quarter', departmentFilter = 'all') => {
  try {
    const response = await apiClient.get('/analytics/team-productivity/export', {
      params: { range, department: departmentFilter !== 'all' ? departmentFilter : undefined },
      responseType: 'blob',
      headers: {
        'Accept': 'text/csv'
      }
    });
    
    if (!(response.data instanceof Blob)) {
      throw new Error('Response is not a Blob');
    }
    
    return response;
  } catch (error) {
    console.error('Export team productivity error:', error);
    throw error;
  }
}

};