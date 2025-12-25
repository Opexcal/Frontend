import { useState, useEffect } from 'react';
import { dashboardApi } from '../api/dashboardApi';

/**
 * Shared hook for dashboard data fetching
 * Used by all role-based dashboards (Admin, Manager, Staff, Wanderer)
 * Backend handles permission-based filtering automatically
 */
export const useDashboard = () => {
  const [data, setData] = useState({
    upcomingEvents: { count: 0, events: [] },
    activeTasks: { count: 0, tasks: [] },
    stats: {
      totalTasksAssigned: 0,
      totalTasksCompleted: 0,
      totalTasksPending: 0,
      totalTasksInProgress: 0,
      totalTasksRejected: 0,
      unreadNotifications: 0
    },
    recentActivity: { count: 0, notifications: [] }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardApi.getDashboard();
      
      // Handle different response wrapper patterns
      const responseData = response.data?.data || response.data || response;
      
      console.log("Dashboard API Response:", response);
      console.log("Extracted Dashboard Data:", responseData);
      
      if (responseData) {
        setData(responseData);
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard
  };
};