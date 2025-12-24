// src/api/notificationsApi.js
import apiClient from './client';

export const notificationsApi = {
  /**
   * Get user notifications
   * @returns {Promise} { notifications, unreadCount }
   */
  getNotifications: () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    return Promise.reject({
      success: false,
      message: "No auth token available"
    });
  }
  return apiClient.get("/notifications");
},

  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   * @returns {Promise}
   */
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),

  /**
   * Mark all notifications as read
   * @returns {Promise}
   */
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),

  /**
   * Delete notification
   * @param {string} id - Notification ID
   * @returns {Promise}
   */
  deleteNotification: (id) => apiClient.delete(`/notifications/${id}`),
};

export default notificationsApi;