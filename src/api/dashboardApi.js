import apiClient from './client';

export const dashboardApi = {
  /**
   * Get dashboard data (concurrent fetch of 5 data sources)
   * @returns {Promise} { upcomingEvents, activeTasks, stats, recentActivity }
   */
  getDashboard: () => apiClient.get('/dashboard')
};