// src/api/eventsApi.js - FIXED
import apiClient from './client';

export const eventsApi = {
  getEvents: (filters = {}) => apiClient.get('/events', { params: filters }),
  
  getEvent: (eventId) => apiClient.get(`/events/${eventId}`), // ✅ Fixed
  
  createEvent: (data) => apiClient.post('/events', data),
  
  updateEvent: (eventId, updates) => apiClient.patch(`/events/${eventId}`, updates), // ✅ Fixed
  
  deleteEvent: (eventId) => apiClient.delete(`/events/${eventId}`), // ✅ Fixed
  
  getEventsInRange: (startDate, endDate) => {
    return apiClient.get('/events', {
      params: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    });
  },
  
  updateRSVP: (eventId, status) => 
    apiClient.patch(`/events/${eventId}/rsvp`, { status }), // ✅ Fixed
  
  markAttendance: (eventId, userId = null, attended = true) => 
    apiClient.post(`/events/${eventId}/attendance`, { userId, attended }), // ✅ Fixed
  
  bulkCheckIn: (eventId, userIds) => 
    apiClient.post(`/events/${eventId}/bulk-checkin`, { userIds }), // ✅ Fixed
  
  getAttendanceSummary: (eventId) => 
    apiClient.get(`/events/${eventId}/attendance-summary`), // ✅ Fixed
  
  getRSVPManagement: (eventId) => 
    apiClient.get(`/events/${eventId}/rsvp-management`), // ✅ Fixed
  
  updateAttendeeRSVP: (eventId, userId, status, notes = null) => 
    apiClient.patch(`/events/${eventId}/attendees/${userId}/rsvp`, { status, notes }), // ✅ Fixed
  
  exportRSVPList: async (eventId) => {
    try {
      const response = await apiClient.get(`/events/${eventId}/export-rsvp`, { // ✅ Fixed
        responseType: 'blob',
        headers: { 'Accept': 'text/csv' }
      });
      return response;
    } catch (error) {
      console.error('Export RSVP error:', error);
      throw error;
    }
  },
  
  // ✅ These are correct
  setEventReminder: (eventId, type, minutesBefore) =>
    apiClient.post(`/events/${eventId}/reminder`, { type, minutesBefore }),
    
  updateEventLocation: (eventId, locationData) =>
    apiClient.patch(`/events/${eventId}/location`, locationData),
};

export default eventsApi;