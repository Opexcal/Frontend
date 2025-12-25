import client from './client'; // Your existing axios/fetch client

/**
 * Audit Logs API Service
 * Handles all audit log-related API calls
 */

/**
 * Get paginated audit logs with filtering
 * @param {Object} params - Query parameters
 * @param {string} params.actor - Filter by user ID
 * @param {string} params.action - Filter by action type
 * @param {string} params.startDate - ISO date string
 * @param {string} params.endDate - ISO date string
 * @param {number} params.limit - Records per page (default: 50, max: 200)
 * @param {number} params.page - Page number (default: 1)
 * @returns {Promise<Object>} Logs and pagination metadata
 */
export const getAuditLogs = async (params = {}) => {
  try {
    const response = await client.get('/audit-logs', { params });
    // Return the entire response - let the component handle the structure
    return response;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }
};

/**
 * Get audit log statistics for dashboard
 * @param {number} days - Number of days to look back (default: 30)
 * @returns {Promise<Object>} Statistics including action counts and top actors
 */
export const getAuditStats = async (days = 30) => {
  try {
    const response = await client.get('/audit-logs/stats', {
      params: { days }
    });
    return response;
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    throw error;
  }
};

/**
 * Export audit logs as CSV
 * @param {Object} params - Filter parameters
 * @param {string} params.startDate - ISO date string
 * @param {string} params.endDate - ISO date string
 * @param {string} params.action - Filter by action type
 * @param {string} params.actor - Filter by user ID
 * @returns {Promise<Blob>} CSV file blob
 */
export const exportAuditLogs = async (params = {}) => {
  try {
    const response = await client.get('/audit-logs/export', {
      params,
      responseType: 'blob' // Important for file download
    });
    
    // Create download link
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return response.data;
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    throw error;
  }
};