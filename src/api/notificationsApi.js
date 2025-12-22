import apiClient from './client';

export const notificationsApi = {
  /**
   * Get user's notifications (last 20)
   * @returns {Promise} { count, unreadCount, data: notifications[] }
   */
  getNotifications: () => apiClient.get('/notifications'),

  /**
   * Mark single notification as read
   * @param {String} notificationId
   * @returns {Promise} { data: notification }
   */
  markAsRead: (notificationId) => 
    apiClient.patch(`/notifications/${notificationId}/read`),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: () => apiClient.patch('/notifications/mark-all-read'),

  /**
   * Delete notification
   * @param {String} notificationId
   */
  deleteNotification: (notificationId) => 
    apiClient.delete(`/notifications/${notificationId}`)
};

