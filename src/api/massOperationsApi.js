import apiClient from "./client";

// Mass operations API wrapper. Backend currently exposes /api/mass/task for bulk group tasks.
// Messaging and event bulk endpoints are pending; keep helpers stubbed for forward compatibility.

// src/api/massOperationsApi.js - CORRECTED
export const massOpsApi = {
  createMassTasks: (data) => apiClient.post("/mass/task", data),
  
  sendMessage: (data) => apiClient.post("/mass/message", data),
  
  createMassEvent: (data) => apiClient.post("/mass/event", data),
  
  getEventRSVP: (eventId) => apiClient.get(`/mass/event/${eventId}/rsvp`),
  
  sendEventReminder: (eventId) => apiClient.post(`/mass/event/${eventId}/reminder`),
  
  getEventHistory: () => apiClient.get("/mass/event/history"),
};