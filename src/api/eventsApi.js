// src/api/eventsApi.js - CORRECTED VERSION
import apiClient from './client';

export const eventsApi = {
  getEvents: (filters = {}) => apiClient.get('/events', { params: filters }),
  
  // ✅ FIX: Use parentheses (), not template literals ``
  getEvent: (eventId) => apiClient.get(`/events/${eventId}`),
  
  createEvent: (data) => apiClient.post('/events', data),
  
  // ✅ FIX: Use parentheses ()
  updateEvent: (eventId, updates) => apiClient.patch(`/events/${eventId}`, updates),
  
  // ✅ FIX: Use parentheses ()
  deleteEvent: (eventId) => apiClient.delete(`/events/${eventId}`),
  
  getEventsInRange: (startDate, endDate) => {
    return apiClient.get('/events', {
      params: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    });
  },

  // ✅ FIX: Use parentheses ()
  updateRSVP: (eventId, status) => 
    apiClient.patch(`/events/${eventId}/rsvp`, { status }),

  // Attendance tracking
  // ✅ FIX: Use parentheses ()
  markAttendance: (eventId, userId = null, attended = true) => 
    apiClient.post(`/events/${eventId}/attendance`, { userId, attended }),

  // ✅ FIX: Use parentheses ()
  bulkCheckIn: (eventId, userIds) => 
    apiClient.post(`/events/${eventId}/bulk-checkin`, { userIds }),

  // ✅ FIX: Use parentheses ()
  getAttendanceSummary: (eventId) => 
    apiClient.get(`/events/${eventId}/attendance-summary`),

  // RSVP Management
  // ✅ FIX: Use parentheses ()
  getRSVPManagement: (eventId) => 
    apiClient.get(`/events/${eventId}/rsvp-management`),

  // ✅ FIX: Use parentheses ()
  updateAttendeeRSVP: (eventId, userId, status, notes = null) => 
    apiClient.patch(`/events/${eventId}/attendees/${userId}/rsvp`, { status, notes }),

  // ✅ FIX: Use parentheses ()
  exportRSVPList: async (eventId) => {
    try {
      const response = await apiClient.get(`/events/${eventId}/export-rsvp`, {
        responseType: 'blob',
        headers: { 'Accept': 'text/csv' }
      });
      return response;
    } catch (error) {
      console.error('Export RSVP error:', error);
      throw error;
    }
  },
};

export default eventsApi;