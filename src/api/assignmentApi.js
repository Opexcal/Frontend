import axios from "axios";

const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const assignmentApi = {
  // Get pending assignments for current user
  getPending: () => api.get(`/assignments/pending`),

  // Get all assignments for current user
  getAll: (filters) => api.get(`/assignments`, { params: filters }),

  // Accept an assignment
  accept: (assignmentId) =>
    api.post(`/assignments/${assignmentId}/accept`),

  // Decline an assignment with reason
  decline: (assignmentId, reason, suggestedReassignee) =>
    api.post(`/assignments/${assignmentId}/decline`, {
      reason,
      suggestedReassignee,
    }),

  // Reassign a task to another team member
  reassign: (assignmentId, newAssigneeId, note) =>
    api.post(`/assignments/${assignmentId}/reassign`, {
      newAssigneeId,
      note,
    }),

  // Mark assignments as reviewed (dismiss from pending view)
  markReviewed: (assignmentIds) =>
    api.post(`/assignments/mark-reviewed`, { assignmentIds }),

  // Get urgent assignments (due within 24 hours)
  getUrgent: () => api.get(`/assignments/pending/urgent`),
};

export default api;
