import apiClient from './client';

export const teamApi = {
  /**
   * Get team dashboard overview
   * @returns {Promise} { teams: [...] }
   */
  getDashboard: () => apiClient.get('/team/dashboard'),

  /**
   * Get team members with task stats
   * @param {string} groupId - Optional group filter
   * @returns {Promise} { count, members: [...] }
   */
  getMembers: (groupId) => 
    apiClient.get('/team/members', { params: groupId ? { groupId } : {} }),

  /**
   * Get team tasks with filtering
   * @param {Object} filters - { groupId?, status?, priority? }
   * @returns {Promise} { count, tasks: [...] }
   */
  getTasks: (filters = {}) => 
    apiClient.get('/team/tasks', { params: filters }),

  /**
   * Get team reports/analytics
   * @param {Object} params - { groupId?, period? }
   * @returns {Promise} { period, taskBreakdown, totalEvents, topPerformers }
   */
  getReports: (params = {}) => 
    apiClient.get('/team/reports', { params }),

  /**
   * Get team events/calendar items
   * @param {Object} params - { startDate?, endDate?, groupId?, type?, memberId? }
   * @returns {Promise} { count, events: [...] }
   */
  getEvents: (params = {}) => 
    apiClient.get('/team/events', { params }),

  /**
   * Create new team event
   * @param {Object} eventData - { title, description, startDate, endDate, attendees, conferenceLink? }
   * @returns {Promise} { event: {...} }
   */
  createEvent: (eventData) => 
    apiClient.post('/team/events', eventData),

  /**
   * Update team event
   * @param {string} eventId
   * @param {Object} eventData
   * @returns {Promise} { event: {...} }
   */
  updateEvent: (eventId, eventData) => 
  apiClient.put(`/team/events/${eventId}`, eventData),

deleteEvent: (eventId) => 
  apiClient.delete(`/team/events/${eventId}`)
};



export default teamApi;