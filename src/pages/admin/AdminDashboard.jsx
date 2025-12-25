import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AddUserModal from "./users/AddUserModal";
import CreateGroupModal from "./groups/CreateGroupModal";
import { useDashboard } from '@/hooks/useDashboard';
import { Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const StatCard = ({ title, value, subtitle }) => (
  <Card className="p-4">
    <div className="text-sm text-muted-foreground">{title}</div>
    <div className="mt-2 text-2xl font-semibold">{value}</div>
    {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
  </Card>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [showAddUser, setShowAddUser] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const { data, loading, error } = useDashboard();

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md">
          <div className="p-6">
            <div className="text-center space-y-3">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
              <h3 className="font-semibold">Failed to load dashboard</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Calculate stats safely with fallbacks
  const statsData = {
    totalUsers: data.stats.totalTasksAssigned || 0,
    userChange: "+12%", // TODO: Calculate from historical data or fetch from admin endpoint
    activeGroups: 8, // TODO: Fetch from groups API
    eventsThisMonth: data.upcomingEvents.count || 0,
    totalTasks: data.activeTasks.count || 0,
    completionRate: data.stats.totalTasksAssigned > 0 
      ? Math.round((data.stats.totalTasksCompleted / data.stats.totalTasksAssigned) * 100)
      : 0,
    pendingInvites: 5, // TODO: Fetch from separate endpoint
  };

  // Map notifications to activity format
  const recentActivities = (data.recentActivity.notifications || []).slice(0, 8).map((notification, index) => ({
    id: notification._id || index,
    timestamp: notification.createdAt,
    message: notification.message || "Activity notification",
    // Backend doesn't provide user/description in current structure
    // You may need to enhance the notification model or use a different endpoint
  }));

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Organization overview and quick actions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate("/admin/audit-logs")}>
            View Audit Logs
          </Button>
          <Button onClick={() => navigate("/admin/settings")}>
            Org Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
          title="Total Users" 
          value={statsData.totalUsers} 
          subtitle={statsData.userChange} 
        />
        <StatCard 
          title="Active Groups" 
          value={statsData.activeGroups} 
        />
        <StatCard 
          title="Events This Month" 
          value={statsData.eventsThisMonth} 
        />
        <StatCard 
          title="Total Tasks" 
          value={statsData.totalTasks} 
          subtitle={`${statsData.completionRate}% completion`} 
        />
        <StatCard 
          title="Pending Invites" 
          value={statsData.pendingInvites} 
        />
        <StatCard 
          title="System Health" 
          value="Good" 
          subtitle="All services nominal" 
        />
      </div>

      <div className="flex items-start gap-6">
        <div className="flex-1">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Recent Activity</h2>
            </div>
            <div className="mt-4 space-y-3">
              {recentActivities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No recent activity</p>
                </div>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{activity.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(activity.timestamp), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="w-80">
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-medium">Quick Actions</h3>
            <div className="space-y-2">
              <Button 
                className="w-full" 
                onClick={() => setShowAddUser(true)}
              >
                Add User
              </Button>
              <Button 
                className="w-full" 
                variant="outline" 
                onClick={() => setShowCreateGroup(true)}
              >
                Create Group
              </Button>
              <Button 
                className="w-full" 
                variant="ghost" 
                onClick={() => navigate("/admin/audit-logs")}
              >
                View Audit Logs
              </Button>
              <Button 
                className="w-full" 
                variant="ghost" 
                onClick={() => navigate("/admin/settings")}
              >
                Org Settings
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <AddUserModal 
        open={showAddUser} 
        onOpenChange={setShowAddUser} 
        onSuccess={() => setShowAddUser(false)} 
      />
      <CreateGroupModal 
        open={showCreateGroup} 
        onOpenChange={setShowCreateGroup} 
        onSuccess={() => setShowCreateGroup(false)} 
      />
    </div>
  );
};

export default AdminDashboard;