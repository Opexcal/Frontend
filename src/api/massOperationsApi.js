import apiClient from "./client";

export const massOpsApi = {
  createMassTasks: (data) => apiClient.post("/mass/task", data),
  
  sendMessage: (data) => apiClient.post("/mass/message", data),
  
  createMassEvent: (data) => apiClient.post("/mass/event", data),
  
  getEventRSVP: (eventId) => apiClient.get(`/mass/event/${eventId}/rsvp`),
  
  sendEventReminder: (eventId) => apiClient.post(`/mass/event/${eventId}/reminder`),
  
  getEventHistory: () => apiClient.get("/mass/event/history"),
};