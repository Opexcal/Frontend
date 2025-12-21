import axios from "axios";

const API_BASE =
  import.meta.env.VITE_APP_API_URL || "http://localhost:5000/api";

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

export const teamApi = {
  // Get team dashboard overview
  getDashboard: (teamId) => api.get(`/team/dashboard/${teamId}`),

  // Get team members with stats
  getMembers: (teamId) => api.get(`/team/members/${teamId}`),

  // Get filtered team tasks
  getTasks: (teamId, filters) =>
    api.get(`/team/tasks/${teamId}`, { params: filters }),

  // Get team calendar events and tasks
  getCalendar: (teamId, startDate, endDate) =>
    api.get(`/team/calendar/${teamId}`, {
      params: { startDate, endDate },
    }),

  // Get team reports and analytics
  getReports: (teamId, filters) =>
    api.get(`/team/reports/${teamId}`, { params: filters }),

  // Create a new team task
  createTask: (taskData) => api.post(`/team/tasks`, taskData),

  // Update existing task
  updateTask: (taskId, updates) => api.put(`/team/tasks/${taskId}`, updates),

  // Delete task
  deleteTask: (taskId) => api.delete(`/team/tasks/${taskId}`),

  // Bulk update tasks
  bulkUpdateTasks: (taskIds, updates) =>
    api.patch(`/team/tasks/bulk`, { taskIds, updates }),

  // Create team event
  createTeamEvent: (eventData) => api.post(`/team/events`, eventData),

  // Export report
  exportReport: (teamId, format = "csv") =>
    api.get(`/team/reports/export/${teamId}`, {
      params: { format },
      responseType: "blob",
    }),
};

export default api;
