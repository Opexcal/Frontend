import apiClient from "./client";

// Mass operations API wrapper used by MassMessaging, MassTaskCreation, and MassEventCreation
// All routes are expected to be mounted under /api/mass on the backend.

export const massOpsApi = {
  // Messaging
  getRecipients: () => apiClient.get("/mass/recipients"),
  sendMessage: (data) => apiClient.post("/mass/message", data),
  scheduleMessage: (data) => apiClient.post("/mass/message/schedule", data),
  getMessageHistory: () => apiClient.get("/mass/message/history"),

  // Tasks
  createMassTasks: (data) => apiClient.post("/mass/task/create", data),
  getTaskBatchStatus: (batchId) =>
    apiClient.get(`/mass/task/${batchId}/status`),
  getTaskHistory: () => apiClient.get("/mass/task/history"),

  // Events
  createMassEvent: (data) => apiClient.post("/mass/event/create", data),
  getEventRSVP: (eventId) => apiClient.get(`/mass/event/${eventId}/rsvp`),
  sendEventReminder: (eventId) =>
    apiClient.post(`/mass/event/${eventId}/reminder`),
  getEventHistory: () => apiClient.get("/mass/event/history"),
};

export default massOpsApi;


