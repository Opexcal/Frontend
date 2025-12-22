import apiClient from './client';

export const tasksApi = {
  /**
   * Get all tasks (filtered by permissions)
   * @param {Object} filters - { status?, priority? }
   * @returns {Promise} { count, tasks }
   */
  getTasks: (filters = {}) => apiClient.get('/tasks', { params: filters }),

  /**
   * Get single task by ID
   * @param {String} taskId
   * @returns {Promise} { task }
   */
  getTask: (taskId) => apiClient.get(`/tasks/${taskId}`),

  /**
   * Create new task
   * @param {Object} data - { title, description, priority, assignees[], dueDate }
   * @returns {Promise} { task }
   */
  createTask: (data) => apiClient.post('/tasks', data),

  /**
   * TASK HANDSHAKE: Accept task (assignee only)
   * @param {String} taskId
   * @returns {Promise} { task }
   */
  acceptTask: (taskId) => 
    apiClient.patch(`/tasks/${taskId}/respond`, { status: 'In-Progress' }),

  /**
   * TASK HANDSHAKE: Reject task with reason (assignee only)
   * @param {String} taskId
   * @param {String} rejectionReason - Required, 1-500 chars
   * @returns {Promise} { task }
   */
  rejectTask: (taskId, rejectionReason) => 
    apiClient.patch(`/tasks/${taskId}/respond`, { 
      status: 'Rejected',
      rejectionReason 
    }),

  /**
   * TASK HANDSHAKE: Mark task as completed (assignee only)
   * @param {String} taskId
   * @returns {Promise} { task }
   */
  completeTask: (taskId) => 
    apiClient.patch(`/tasks/${taskId}/respond`, { status: 'Completed' }),

  /**
   * Update task (admin/creator only)
   * @param {String} taskId
   * @param {Object} updates
   * @returns {Promise} { task }
   */
  updateTask: (taskId, updates) => apiClient.patch(`/tasks/${taskId}`, updates),

  /**
   * Delete task (admin/creator only)
   * @param {String} taskId
   */
  deleteTask: (taskId) => apiClient.delete(`/tasks/${taskId}`)
};

