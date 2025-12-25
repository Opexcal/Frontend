import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Info, CheckSquare, Calendar, ArrowRight, Plus, 
  CheckCircle2, XCircle, Clock, Loader2, AlertCircle  // <- Add these
} from "lucide-react";
import { Link } from "react-router-dom";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import StatusBadge from "@/components/common/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useDashboard } from '@/hooks/useDashboard';
import { format } from "date-fns";


// Mock data
const mockData = {
  stats: {
    personalTasks: { total: 8, completed: 3, percentage: 37.5 },
    assignedTasks: { total: 5, pending: 2 },
    personalEvents: { thisWeek: 3, nextEvent: "Team Intro Call" }
  },
  personalTasks: [
    { id: 1, title: "Set up profile", priority: "medium", status: "completed", dueDate: "2025-12-20" },
    { id: 2, title: "Read onboarding docs", priority: "high", status: "in-progress", dueDate: "2025-12-22" },
    { id: 3, title: "Complete skills assessment", priority: "low", status: "not-started", dueDate: "2025-12-25" },
    { id: 4, title: "Schedule intro call", priority: "medium", status: "not-started", dueDate: "2025-12-23" },
    { id: 5, title: "Review company policies", priority: "low", status: "not-started", dueDate: "2025-12-30" },
  ],
  assignedTasks: [
    { 
      id: 101, 
      title: "Review marketing proposal", 
      priority: "high", 
      status: "pending",
      assignedBy: { name: "Sarah Johnson", avatar: "" },
      dueDate: "2025-12-24"
    },
    { 
      id: 102, 
      title: "Update design assets", 
      priority: "medium", 
      status: "pending",
      assignedBy: { name: "Mike Chen", avatar: "" },
      dueDate: "2025-12-26"
    },
  ],
  upcomingEvents: [
    { id: 1, title: "Team Intro Call", time: "10:00 AM", date: "2025-12-23", type: "meeting" },
    { id: 2, title: "Company Overview", time: "2:00 PM", date: "2025-12-24", type: "event" },
  ]
};

const WandererDashboard = () => {
  const { user } = useAuth();
   const { data, loading, error } = useDashboard();

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
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
              <h3 className="font-semibold">Failed to load dashboard</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }


 const stats = {
  personalTasks: {
    total: data.activeTasks.count || 0,
    completed: data.stats.totalTasksCompleted || 0,
    percentage: data.activeTasks.count > 0 
      ? Math.round((data.stats.totalTasksCompleted / data.activeTasks.count) * 100)
      : 0
  },
  assignedTasks: {
    total: data.stats.totalTasksPending || 0,
    pending: data.stats.totalTasksPending || 0
  },
  personalEvents: {
    thisWeek: data.upcomingEvents.count || 0,
    nextEvent: data.upcomingEvents.events?.[0]?.title || "No events"
  }
};

const personalTasks = data.activeTasks.tasks || [];
const assignedTasks = (data.activeTasks.tasks || []).filter(t => t.status === 'Pending');
const upcomingEvents = data.upcomingEvents.events || [];



  const handleAcceptTask = (taskId) => {
    console.log("Accept task", taskId);
    // API call here
  };

  const handleDeclineTask = (taskId) => {
    console.log("Decline task", taskId);
    // API call here
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-semibold text-foreground">
          Welcome, {user?.name || "User"}!
        </h1>
        <p className="text-muted-foreground mt-1">
          You're not assigned to any group yet. Contact your admin to get started.
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          You're not assigned to any group. Contact your admin to access team features.
        </AlertDescription>
      </Alert>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
       <Card className="card-hover opacity-90">
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">Personal Tasks</p>
        <p className="text-2xl font-semibold mt-1">
          {stats.personalTasks.completed}/{stats.personalTasks.total}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {stats.personalTasks.percentage}% complete
        </p>
      </div>
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
        <CheckSquare className="h-6 w-6 text-primary" />
      </div>
    </div>
  </CardContent>
</Card>

<Card className="card-hover opacity-90">
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">Tasks Assigned to Me</p>
        <p className="text-2xl font-semibold mt-1">{stats.assignedTasks.total}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {stats.assignedTasks.pending} pending response
        </p>
      </div>
      <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
        <Clock className="h-6 w-6 text-orange-600" />
      </div>
    </div>
  </CardContent>
</Card>

<Card className="card-hover opacity-90">
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">Personal Events</p>
        <p className="text-2xl font-semibold mt-1">{stats.personalEvents.thisWeek}</p>
        <p className="text-xs text-muted-foreground mt-1 truncate">
          Next: {stats.personalEvents.nextEvent}
        </p>
      </div>
      <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
        <Calendar className="h-6 w-6 text-green-600" />
      </div>
    </div>
  </CardContent>
</Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Tasks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">My Personal Tasks</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/tasks">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
         <CardContent>
  {personalTasks.length === 0 ? (
    <div className="text-center py-8 text-muted-foreground">
      <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
      <p>No personal tasks yet</p>
      <Button variant="outline" size="sm" className="mt-4" asChild>
        <Link to="/tasks/create">
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Link>
      </Button>
    </div>
  ) : (
    <div className="space-y-3">
      {personalTasks.slice(0, 5).map((task) => (
        <div
          key={task._id}
          className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
        >
          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
            {task.status === "Completed" ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <CheckSquare className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{task.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</CardContent>
        </Card>

        {/* Tasks Assigned to Me */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Tasks Assigned to Me</CardTitle>
          </CardHeader>
<CardContent>
  {assignedTasks.length === 0 ? (
    <div className="text-center py-8 text-muted-foreground">
      <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
      <p>No tasks assigned to you yet</p>
    </div>
  ) : (
    <div className="space-y-3">
      {assignedTasks.map((task) => (
        <div
          key={task._id}
          className="flex flex-col gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{task.title}</p>
              {task.createdBy && (
                <p className="text-xs text-muted-foreground mt-1">
                  Assigned by {task.createdBy.name}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <PriorityBadge priority={task.priority} />
                {task.dueDate && (
                  <Badge variant="outline" className="text-xs">
                    Due: {format(new Date(task.dueDate), "MMM d")}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 ml-13">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handleAcceptTask(task._id)}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => handleDeclineTask(task._id)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Decline
            </Button>
          </div>
        </div>
      ))}
    </div>
  )}
</CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Upcoming Personal Events</CardTitle>
        </CardHeader>
        <CardContent>
  {upcomingEvents.length === 0 ? (
    <div className="text-center py-8 text-muted-foreground">
      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
      <p>No upcoming events</p>
      <Button variant="outline" size="sm" className="mt-4" asChild>
        <Link to="/calendar/personal">
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Link>
      </Button>
    </div>
  ) : (
    <div className="space-y-3">
      {upcomingEvents.map((event) => (
        <div
          key={event._id}
          className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
        >
          <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{event.title}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(event.startDate), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
      ))}
    </div>
  )}
</CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4" asChild>
              <Link to="/tasks/create">
                <Plus className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Create Task</div>
                  <div className="text-xs text-muted-foreground">Add a personal task</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4" asChild>
              <Link to="/calendar/personal">
                <Calendar className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Create Event</div>
                  <div className="text-xs text-muted-foreground">Schedule personal event</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4" asChild>
              <Link to="/calendar/personal">
                <Calendar className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-medium">View Calendar</div>
                  <div className="text-xs text-muted-foreground">See your schedule</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium">Contact Your Admin</p>
                <p className="text-sm text-muted-foreground">
                  Reach out to your administrator to be assigned to a group or department.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium">Create Personal Tasks</p>
                <p className="text-sm text-muted-foreground">
                  Start organizing your work by creating personal tasks and events.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium">Accept Task Assignments</p>
                <p className="text-sm text-muted-foreground">
                  Review and accept tasks that have been assigned to you by team members.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WandererDashboard;