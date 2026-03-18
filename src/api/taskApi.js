import apiClient from './client';

export const tasksApi = {
  getTasks: (filters = {}) => apiClient.get('/tasks', { params: filters }),
  
  // ✅ FIXED: Use parentheses, not backticks
  getTask: (taskId) => apiClient.get(`/tasks/${taskId}`),
  
  createTask: (data) => apiClient.post('/tasks', data),
  
  // ✅ FIXED: All methods now use parentheses
  acceptTask: (taskId) => 
    apiClient.patch(`/tasks/${taskId}/respond`, { status: 'In-Progress' }),
  
  rejectTask: (taskId, rejectionReason) => 
    apiClient.patch(`/tasks/${taskId}/respond`, { 
      status: 'Rejected',
      rejectionReason 
    }),
  
  completeTask: (taskId) => 
    apiClient.patch(`/tasks/${taskId}/respond`, { status: 'Completed' }),
  
  updateTask: (taskId, updates) => apiClient.patch(`/tasks/${taskId}`, updates),
  
  deleteTask: (taskId) => apiClient.delete(`/tasks/${taskId}`),
  // Add this method
setTaskReminder: (taskId, type, minutesBefore) =>
  apiClient.post(`/tasks/${taskId}/reminder`, { type, minutesBefore }),

removeTaskReminder: (taskId, reminderIndex) =>
  apiClient.delete(`/tasks/${taskId}/reminder/${reminderIndex}`),
};