import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AddUserModal from "./users/AddUserModal";
import CreateGroupModal from "./groups/CreateGroupModal";

const statsData = {
  totalUsers: 142,
  userChange: "+12%",
  activeGroups: 8,
  eventsThisMonth: 156,
  totalTasks: 89,
  completionRate: 73,
  pendingInvites: 5,
};

const recentActivities = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  timestamp: new Date().toISOString(),
  user: { name: "John Doe", avatar: "" },
  action: "user_added",
  description: `Added sample user #${i + 1}`,
}));

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

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Organization overview and quick actions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate("/admin/audit-logs")}>View Audit Logs</Button>
          <Button onClick={() => navigate("/admin/settings")}>Org Settings</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={statsData.totalUsers} subtitle={statsData.userChange} />
        <StatCard title="Active Groups" value={statsData.activeGroups} />
        <StatCard title="Events This Month" value={statsData.eventsThisMonth} />
        <StatCard title="Total Tasks" value={statsData.totalTasks} subtitle={`${statsData.completionRate}% completion`} />
        <StatCard title="Pending Invites" value={statsData.pendingInvites} />
        <StatCard title="System Health" value="Good" subtitle="All services nominal" />
      </div>

      <div className="flex items-start gap-6">
        <div className="flex-1">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Recent Activity</h2>
            </div>
            <div className="mt-4 space-y-3">
              {recentActivities.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{a.user.name}</div>
                    <div className="text-xs text-muted-foreground">{a.description}</div>
                    <div className="text-2xs text-muted-foreground mt-1">{new Date(a.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="w-80">
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-medium">Quick Actions</h3>
            <div className="space-y-2">
              <Button onClick={() => setShowAddUser(true)}>Add User</Button>
              <Button variant="outline" onClick={() => setShowCreateGroup(true)}>Create Group</Button>
              <Button variant="ghost" onClick={() => navigate("/admin/audit-logs")}>View Audit Logs</Button>
              <Button variant="ghost" onClick={() => navigate("/admin/settings")}>Org Settings</Button>
            </div>
          </Card>
        </div>
      </div>

      <AddUserModal open={showAddUser} onOpenChange={setShowAddUser} onSuccess={() => setShowAddUser(false)} />
      <CreateGroupModal open={showCreateGroup} onOpenChange={setShowCreateGroup} onSuccess={() => setShowCreateGroup(false)} />
    </div>
  );
};

export default AdminDashboard;
