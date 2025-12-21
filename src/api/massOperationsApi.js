import api from "./teamApi";

export const massOpsApi = {
  // Messaging
  getRecipients: () => api.get("/mass/recipients"),
  sendMessage: (data) => api.post("/mass/message", data),
  scheduleMessage: (data) => api.post("/mass/message/schedule", data),
  getMessageHistory: () => api.get("/mass/message/history"),

  // Tasks
  createMassTasks: (data) => api.post("/mass/task/create", data),
  getTaskBatchStatus: (batchId) => api.get(`/mass/task/${batchId}/status`),
  getTaskHistory: () => api.get("/mass/task/history"),

  // Events
  createMassEvent: (data) => api.post("/mass/event/create", data),
  getEventRSVP: (eventId) => api.get(`/mass/event/${eventId}/rsvp`),
  sendEventReminder: (eventId) => api.post(`/mass/event/${eventId}/reminder`),
  getEventHistory: () => api.get("/mass/event/history"),
};
