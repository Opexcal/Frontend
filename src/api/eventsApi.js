import apiClient from './client';

export const eventsApi = {
  getEvents: (filters = {}) => apiClient.get('/events', { params: filters }),
  
  getEvent: (eventId) => apiClient.get(`/events/${eventId}`),
  
  createEvent: (data) => apiClient.post('/events', data),
  
  updateEvent: (eventId, updates) => apiClient.patch(`/events/${eventId}`, updates),
  
  deleteEvent: (eventId) => apiClient.delete(`/events/${eventId}`),
  
  getEventsInRange: (startDate, endDate) => {
    return apiClient.get('/events', {
      params: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      }
    });
  },

   updateRSVP: (eventId, status) => 
    apiClient.patch(`/events/${eventId}/rsvp`, { status }),

  // Attendance tracking
  markAttendance: (eventId, userId = null, attended = true) => 
    apiClient.post(`/events/${eventId}/attendance`, { userId, attended }),

  bulkCheckIn: (eventId, userIds) => 
    apiClient.post(`/events/${eventId}/bulk-checkin`, { userIds }),

  getAttendanceSummary: (eventId) => 
    apiClient.get(`/events/${eventId}/attendance-summary`),


  // RSVP Management
getRSVPManagement: (eventId) => 
  apiClient.get(`/events/${eventId}/rsvp-management`),

updateAttendeeRSVP: (eventId, userId, status, notes = null) => 
  apiClient.patch(`/events/${eventId}/attendees/${userId}/rsvp`, { status, notes }),

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