import { useState, useEffect } from 'react';
import { dashboardApi } from '../api/dashboardApi';

export const useAdminDashboard = () => {
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalGroups: 0,
    pendingInvites: 0,
    userGrowth: '+0%',
    recentUsers: 0
  });
  
  const [groupsOverview, setGroupsOverview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both admin endpoints
      const [statsResponse, groupsResponse] = await Promise.all([
        dashboardApi.getAdminStats(),
        dashboardApi.getGroupsOverview()
      ]);
      
      console.log("Admin Stats Response:", statsResponse);
      console.log("Groups Overview Response:", groupsResponse);
      
      setAdminStats(statsResponse.data?.data || statsResponse.data);
      setGroupsOverview(groupsResponse.data?.data || groupsResponse.data);
      
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
      setError(err.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return {
    adminStats,
    groupsOverview,
    loading,
    error,
    refetch: fetchAdminData
  };
};