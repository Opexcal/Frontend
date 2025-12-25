import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CheckSquare, Calendar, TrendingUp, AlertCircle, 
  ArrowRight, Plus, Clock, Users, Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import StatusBadge from "@/components/common/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { useDashboard } from "../../hooks/useDashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, isToday, isPast } from "date-fns";

const StaffDashboard = () => {
  const { user } = useAuth();
  const { data, loading, error } = useDashboard();
  const [dateRange, setDateRange] = useState("today");

  // Calculate derived stats from API data
  const stats = {
    myTasks: {
      total: data.stats.totalTasksAssigned || 0,
      completed: data.stats.totalTasksCompleted || 0,
      pending: data.stats.totalTasksPending || 0,
      inProgress: data.stats.totalTasksInProgress || 0
    },
    teamEvents: data.upcomingEvents.count || 0,
    completionRate: data.stats.totalTasksAssigned > 0 
      ? Math.round((data.stats.totalTasksCompleted / data.stats.totalTasksAssigned) * 100)
      : 0,
    unreadNotifications: data.stats.unreadNotifications || 0
  };

  // Filter tasks by status
  const activeTasks = data.activeTasks.tasks || [];
  const myTasks = activeTasks.filter(t => t.status !== 'Rejected');
  const assignedToMe = activeTasks.filter(t => t.status === 'Pending');
  const overdueTasks = activeTasks.filter(t => 
    t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'Completed'
  );

  // Filter events happening today
  const todaysEvents = (data.upcomingEvents.events || []).filter(event => 
    isToday(new Date(event.startDate))
  );

  // Recent activity (last 5 notifications)
  const recentActivity = data.recentActivity.notifications || [];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-semibold text-foreground">
            Welcome back, {user?.name || "User"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your overview for {dateRange === "today" ? "today" : dateRange === "week" ? "this week" : "this month"}.
          </p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">My Tasks</p>
                <p className="text-2xl font-semibold mt-1">
                  {stats.myTasks.completed}/{stats.myTasks.total}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Completed</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <CheckSquare className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Events</p>
                <p className="text-2xl font-semibold mt-1">{stats.teamEvents}</p>
                <p className="text-xs text-muted-foreground mt-1">Upcoming</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-semibold mt-1">{stats.completionRate}%</p>
                <p className="text-xs text-success mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Overall progress
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`card-hover ${overdueTasks.length > 0 ? "border-red-500" : ""}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue Items</p>
                <p className={`text-2xl font-semibold mt-1 ${overdueTasks.length > 0 ? "text-red-600" : ""}`}>
                  {overdueTasks.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Focus */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Today's Focus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Events Today */}
            <div>
              <h3 className="font-medium mb-3 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Events Today ({todaysEvents.length})
              </h3>
              <div className="space-y-2">
                {todaysEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No events scheduled</p>
                ) : (
                  todaysEvents.slice(0, 3).map((event) => (
                    <div key={event._id} className="p-2 rounded bg-background/50">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(event.startDate), "h:mm a")}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tasks In Progress */}
            <div>
              <h3 className="font-medium mb-3 flex items-center">
                <CheckSquare className="h-4 w-4 mr-2" />
                In Progress ({stats.myTasks.inProgress})
              </h3>
              <div className="space-y-2">
                {activeTasks
                  .filter(t => t.status === 'In-Progress')
                  .slice(0, 3)
                  .map((task) => (
                    <div key={task._id} className="p-2 rounded bg-background/50">
                      <p className="text-sm font-medium">{task.title}</p>
                      <StatusBadge status={task.status} className="mt-1" />
                    </div>
                  ))}
                {stats.myTasks.inProgress === 0 && (
                  <p className="text-sm text-muted-foreground">No tasks in progress</p>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="font-medium mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Recent Activity
              </h3>
              <div className="space-y-2">
                {recentActivity.slice(0, 3).map((notification) => (
                  <div key={notification._id} className="p-2 rounded bg-background/50">
                    <p className="text-sm truncate">{notification.message || "Notification"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6">
        {/* Left Column - Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">My Tasks & Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all-tasks" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all-tasks">All Tasks ({myTasks.length})</TabsTrigger>
                <TabsTrigger value="assigned">Assigned ({assignedToMe.length})</TabsTrigger>
                <TabsTrigger value="overdue">Overdue ({overdueTasks.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all-tasks" className="mt-4">
                <div className="space-y-3">
                  {myTasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No tasks found</p>
                    </div>
                  ) : (
                    myTasks.map((task) => (
                      <div
                        key={task._id}
                        className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                      >
                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                          <CheckSquare className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <PriorityBadge priority={task.priority} />
                            <StatusBadge status={task.status} />
                            {task.dueDate && (
                              <Badge variant="outline" className="text-xs">
                                Due: {format(new Date(task.dueDate), "MMM d")}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="assigned" className="mt-4">
                <div className="space-y-3">
                  {assignedToMe.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No pending assignments</p>
                    </div>
                  ) : (
                    assignedToMe.map((task) => (
                      <div
                        key={task._id}
                        className="p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
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
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="overdue" className="mt-4">
                <div className="space-y-3">
                  {overdueTasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-50 text-green-600" />
                      <p>No overdue tasks! 🎉</p>
                    </div>
                  ) : (
                    overdueTasks.map((task) => (
                      <div
                        key={task._id}
                        className="flex items-center gap-4 p-3 rounded-lg border border-red-500/50 bg-red-500/5 hover:bg-red-500/10 transition-colors"
                      >
                        <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <PriorityBadge priority={task.priority} />
                            <StatusBadge status={task.status} />
                            <Badge variant="destructive" className="text-xs">
                              Overdue: {format(new Date(task.dueDate), "MMM d")}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.upcomingEvents.events.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No upcoming events</p>
                  </div>
                ) : (
                  data.upcomingEvents.events.slice(0, 5).map((event) => (
                    <div
                      key={event._id}
                      className="flex items-center gap-3 p-2 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.startDate), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                <Link to="/calendar">
                  View All Events <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/tasks/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/calendar">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Calendar
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/notifications">
                  <Badge className="mr-2">{stats.unreadNotifications}</Badge>
                  Notifications
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;