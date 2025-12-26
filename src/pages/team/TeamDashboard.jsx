import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TeamMemberCard from "@/components/team/TeamMemberCard";
import AssignmentModal from "@/components/team/AssignmentModal";
import { format } from "date-fns";
import { teamApi } from '@/api/teamApi';
import { toast } from "sonner";


/**
 * TeamDashboard - Overview of team workload and performance
 */
const TeamDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  // 🔥 Extract fetch logic into reusable function
// 🔥 FIXED fetch logic - proper task status counting
const fetchDashboard = async () => {
  setLoading(true);
  try {
    const response = await teamApi.getDashboard();
    const teams = response.data?.teams || response.teams || [];
    
    // Fetch ALL tasks (not just pending)
    const tasksResponse = await teamApi.getTasks();
    const allTasks = tasksResponse.data?.tasks || tasksResponse.tasks || [];
    
    // Calculate stats from ACTUAL task statuses
    const now = new Date();
    const stats = {
      totalTasks: allTasks.length,
      notStarted: allTasks.filter(t => t.status === 'Not Started').length,
      inProgress: allTasks.filter(t => t.status === 'In Progress').length,
      completed: allTasks.filter(t => t.status === 'Completed').length,
      overdue: allTasks.filter(t => {
        if (!t.dueDate || t.status === 'Completed') return false;
        return new Date(t.dueDate) < now;
      }).length,
      completionRate: allTasks.length > 0 
        ? Math.round((allTasks.filter(t => t.status === 'Completed').length / allTasks.length) * 100)
        : 0
    };
    
    // Get members with proper task counts
    const membersResponse = await teamApi.getMembers();
    const members = (membersResponse.data?.members || membersResponse.members || []).map(m => {
      const memberTasks = allTasks.filter(t => 
        t.assignees?.some(a => (a.id || a._id) === (m.id || m._id))
      );
      
      return {
        id: m.id || m._id,
        name: m.name,
        email: m.email,
        role: m.role,
        teams: m.teams || [],
        taskCount: memberTasks.length,
        completedCount: memberTasks.filter(t => t.status === 'Completed').length,
        overdueCount: memberTasks.filter(t => {
          if (!t.dueDate || t.status === 'Completed') return false;
          return new Date(t.dueDate) < now;
        }).length,
      };
    });
    
    // Get upcoming deadlines (non-completed tasks with future due dates)
    const upcomingDeadlines = allTasks
      .filter(t => {
        if (!t.dueDate || t.status === 'Completed') return false;
        return new Date(t.dueDate) > now;
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5)
      .map(t => ({
        id: t._id || t.id,
        title: t.title,
        dueDate: t.dueDate,
        assigneeName: t.assignees?.[0]?.name || 'Unassigned',
        status: t.status
      }));
    
    setDashboardData({
      stats,
      members,
      upcomingDeadlines
    });
    
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    toast.error("Failed to load dashboard", {
      description: error?.response?.data?.message || error?.message || "Please try again"
    });
    setDashboardData(null);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchDashboard();
  }, []);

  // 🔥 Updated assignment handler
  const handleAssignTask = async (data) => {
    try {
      const { tasksApi } = await import('../../api/taskApi');
      
      await tasksApi.createTask(data);

      toast.success("Task assigned successfully", {
        description: `Task "${data.title}" has been assigned`,
      });
      
      setShowAssignmentModal(false);
      
      // Refresh dashboard
      await fetchDashboard();
      
    } catch (error) {
      console.error("Error assigning task:", error);
      toast.error("Failed to assign task", {
        description: error?.response?.data?.message || error?.message
      });
    }
  };

  // ... rest of component

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Failed to load team dashboard
          </p>
        </div>
      </div>
    );
  }

  const stats = dashboardData.stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of team workload and performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate("/team/calendar")}
            variant="outline"
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            View Calendar
          </Button>
          <Button
            onClick={() => setShowAssignmentModal(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Assign Task
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon="📊"
          color="blue"
        />
        <StatCard
          title="Not Started"
          value={stats.notStarted}
          icon="⭕"
          color="gray"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon="🔵"
          color="blue"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Overdue"
          value={stats.overdue}
          icon="🔴"
          color="red"
          highlight
        />
      </div>

      {/* Completion Rate */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Team Completion Rate</h2>
          <Badge className="text-lg px-3 py-1 bg-green-100 text-green-700">
            {stats.completionRate}%
          </Badge>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full transition-all"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
      </Card>

      {/* Team Members Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Team Members ({dashboardData.members.length})
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardData.members.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              taskCount={member.taskCount}
              completedCount={member.completedCount}
              overdueCount={member.overdueCount}
            />
          ))}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Upcoming Deadlines</h2>
          <Badge variant="outline">{dashboardData.upcomingDeadlines.length}</Badge>
        </div>

        <Card className="divide-y">
          {dashboardData.upcomingDeadlines.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">No upcoming deadlines</p>
            </div>
          ) : (
            dashboardData.upcomingDeadlines.map((task) => (
              <div
                key={task.id}
                className="p-4 hover:bg-accent transition-colors cursor-pointer flex items-center justify-between"
                onClick={() => navigate(`/team/tasks?filter=task-${task.id}`)}
              >
                <div className="flex-1">
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Assigned to: {task.assigneeName}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge
                    variant={
                      new Date(task.dueDate) < new Date()
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {format(new Date(task.dueDate), "MMM dd")}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* Assignment Modal */}
<AssignmentModal
  isOpen={showAssignmentModal}
  onClose={() => setShowAssignmentModal(false)}
  teamMembers={dashboardData?.members || []}  // ✅ Use real members
  onSubmit={handleAssignTask}
  mode="create"
/>
    </div>
  );
};

/**
 * StatCard - Reusable statistics card
 */
const StatCard = ({ title, value, icon, color = "gray", highlight = false }) => {
  const colorConfig = {
    blue: "bg-blue-50 text-blue-600",
    gray: "bg-gray-50 text-gray-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <Card
      className={`p-4 ${
        highlight ? "ring-2 ring-red-300" : ""
      } hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${colorConfig[color]}`}>{value}</p>
    </Card>
  );
};

export default TeamDashboard;
