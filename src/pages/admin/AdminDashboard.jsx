import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import AddUserModal from "./users/AddUserModal";
import CreateGroupModal from "./groups/CreateGroupModal";
import { useDashboard } from '@/hooks/useDashboard';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { Loader2, AlertCircle,Users, CheckSquare, MessageSquare, Calendar, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { dashboardApi } from '@/api/dashboardApi';
import { groupsApi } from '@/api/groupsApi';
import { usersApi } from '@/api/usersApi';
import {useAuth} from "@/context/AuthContext"



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
  const { data, loading: dashboardLoading, error } = useDashboard();
  const { adminStats, groupsOverview, loading: adminLoading } = useAdminDashboard();
  // Loading state

  const isSuperAdmin = useAuth().user?.role === "manager";

  if (dashboardLoading || adminLoading)  {
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

  // Add null check for data
  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Calculate stats safely with fallbacks
const statsData = {
  totalUsers: adminStats?.totalUsers || 0,
    userChange: adminStats?.userGrowth || "+0%",
    activeGroups: groupsOverview.length || 0,
    eventsThisMonth: data?.upcomingEvents?.count || 0,
    totalTasks: data?.activeTasks?.count || 0,
    completionRate: data?.stats?.totalTasksAssigned > 0 
      ? Math.round((data.stats.totalTasksCompleted / data.stats.totalTasksAssigned) * 100)
      : 0,
    pendingInvites: adminStats?.pendingInvites || 0,
  };

  // Map notifications to activity format
  const recentActivities = (data?.recentActivity?.notifications || []).slice(0, 8).map((notification, index) => ({
    id: notification._id || index,
    timestamp: notification.createdAt,
    message: notification.message || "Activity notification",
  }));

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Organization overview and quick actions</p>
        </div>
        {isSuperAdmin && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/admin/audit-logs")}>
              View Audit Logs
            </Button>
            <Button onClick={() => navigate("/admin/settings")}>
              Org Settings
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard title="Total Users" value={adminStats?.totalUsers || 0} subtitle={adminStats?.userGrowth} />
<StatCard title="Active Groups" value={adminStats?.totalGroups || 0} />
<StatCard title="Pending Invites" value={adminStats?.pendingInvites || 0} />
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
          title="System Health" 
          value="Good" 
          subtitle="All services nominal" 
        />
      </div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Team Management Quick Actions */}
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        Team Management
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <Button asChild variant="outline" className="w-full justify-start">
        <Link to="/team/dashboard">
          <Users className="h-4 w-4 mr-2" />
          Team Dashboard
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full justify-start">
        <Link to="/team/tasks">
          <CheckSquare className="h-4 w-4 mr-2" />
          Manage Team Tasks
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full justify-start">
        <Link to="/team/calendar">
          <Calendar className="h-4 w-4 mr-2" />
          Team Calendar
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full justify-start">
        <Link to="/team/reports">
          <BarChart3 className="h-4 w-4 mr-2" />
          View Team Reports
        </Link>
      </Button>
    </CardContent>
  </Card>

  {/* Mass Operations Quick Actions */}
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Mass Operations
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <Button asChild variant="outline" className="w-full justify-start">
        <Link to="/mass/task">
          <CheckSquare className="h-4 w-4 mr-2" />
          Assign Mass Tasks
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full justify-start">
        <Link to="/mass/message">
          <MessageSquare className="h-4 w-4 mr-2" />
          Send Mass Message
        </Link>
      </Button>
      <Button asChild variant="outline" className="w-full justify-start">
        <Link to="/mass/event">
          <Calendar className="h-4 w-4 mr-2" />
          Create Mass Event
        </Link>
      </Button>
    </CardContent>
  </Card>
</div>

{/* Recent Activity and Quick Actions sidebar continue below... */}
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
              {isSuperAdmin && (
                <>
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
                </>
              )}
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