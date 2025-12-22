import apiClient from './client';

export const eventsApi = {
  /**
   * Get events (permission-aware, date-filtered)
   * @param {Object} filters - { start?, end? } - ISO date strings
   * @returns {Promise} { count, data: events[] }
   */
  getEvents: (filters = {}) => apiClient.get('/events', { params: filters }),

  /**
   * Get single event by ID
   * @param {String} eventId
   * @returns {Promise} { data: event }
   */
  getEvent: (eventId) => apiClient.get(`/events/${eventId}`),

  /**
   * Create new event
   * @param {Object} data - { title, description, startDate, endDate, type, visibility, groupId?, attendees[], conferencingLink? }
   * @returns {Promise} { data: event }
   */
  createEvent: (data) => apiClient.post('/events', data),

  /**
   * Update event (admin/creator only)
   * @param {String} eventId
   * @param {Object} updates
   * @returns {Promise} { data: event }
   */
  updateEvent: (eventId, updates) => apiClient.patch(`/events/${eventId}`, updates),

  /**
   * Delete event (admin/creator only)
   * @param {String} eventId
   */
  deleteEvent: (eventId) => apiClient.delete(`/events/${eventId}`),

  /**
   * Get events for date range (helper for calendar views)
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise} { count, data: events[] }
   */
  getEventsInRange: (startDate, endDate) => {
    return apiClient.get('/events', {
      params: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    });
  }
};


