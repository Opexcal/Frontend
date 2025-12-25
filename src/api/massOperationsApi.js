import apiClient from "./client";

// Mass operations API wrapper. Backend currently exposes /api/mass/task for bulk group tasks.
// Messaging and event bulk endpoints are pending; keep helpers stubbed for forward compatibility.

export const massOpsApi = {
  // Bulk tasks (implemented in backend)
    createMassTasks: (data) => apiClient.post("/mass/task", data),

  // ✅ Mass messaging (NEW - now working)
  sendMessage: (data) => apiClient.post("/mass/message", data),

  // ✅ Mass events (NEW - now working)
  createMassEvent: (data) => apiClient.post("/mass/event", data),
  // --- Pending backend endpoints below ---
  // Messaging (not yet implemented server-side)
  getRecipients: () => apiClient.get("/mass/recipients"),
  scheduleMessage: (data) => apiClient.post("/mass/message/schedule", data),
  getMessageHistory: () => apiClient.get("/mass/message/history"),

  // Bulk events (not yet implemented server-side)
  getEventRSVP: (eventId) => apiClient.get(`/mass/event/${eventId}/rsvp`),
  sendEventReminder: (eventId) =>
    apiClient.post(`/mass/event/${eventId}/reminder`),
  getEventHistory: () => apiClient.get("/mass/event/history"),
};

export default massOpsApi;


