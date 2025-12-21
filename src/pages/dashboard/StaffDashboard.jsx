import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CheckSquare, Calendar, TrendingUp, AlertCircle, 
  ArrowRight, Plus, CheckCircle2, XCircle, Clock, Users,
  Filter, TrendingDown
} from "lucide-react";
import { Link } from "react-router-dom";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import StatusBadge from "@/components/common/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

// Mock data
const mockData = {
  stats: {
    myTasks: { total: 12, completed: 9 },
    teamEvents: 7,
    completionRate: 78,
    overdueItems: 2
  },
  todaysFocus: {
    tasksDueToday: [
      { id: 1, title: "Review Q4 report", priority: "high", status: "in-progress" },
      { id: 2, title: "Client presentation prep", priority: "medium", status: "not-started" },
    ],
    eventsToday: [
      { id: 1, title: "Team Standup", time: "9:00 AM", type: "meeting" },
      { id: 2, title: "Client Call", time: "2:00 PM", type: "meeting" },
    ],
    teamUpdates: [
      { id: 1, user: "Sarah", action: "completed", item: "Design mockups" },
      { id: 2, user: "Mike", action: "created", item: "New project proposal" },
    ]
  },
  tasks: {
    personal: [
      { id: 1, title: "Update documentation", priority: "medium", status: "in-progress", dueDate: "2025-12-23" },
      { id: 2, title: "Code review", priority: "high", status: "not-started", dueDate: "2025-12-24" },
      { id: 3, title: "Write blog post", priority: "low", status: "not-started", dueDate: "2025-12-30" },
    ],
    assignedToMe: [
      { 
        id: 101, 
        title: "Review PR #234", 
        priority: "high", 
        status: "pending",
        assignedBy: { name: "John Doe", avatar: "" },
        dueDate: "2025-12-23"
      },
    ],
    overdue: [
      { id: 201, title: "Update API docs", priority: "medium", status: "in-progress", dueDate: "2025-12-20" },
      { id: 202, title: "Fix bug #123", priority: "high", status: "in-progress", dueDate: "2025-12-21" },
    ]
  },
  groups: [
    { id: 1, name: "Engineering", memberCount: 24, role: "Member" },
    { id: 2, name: "Product Team", memberCount: 8, role: "Lead" },
  ],
  teamActivity: [
    {
      id: 1,
      actor: { name: "Sarah Johnson", avatar: "" },
      type: "task_completed",
      description: "completed task 'Design mockups'",
      timestamp: "2 hours ago",
      group: "Engineering"
    },
    {
      id: 2,
      actor: { name: "Mike Chen", avatar: "" },
      type: "event_created",
      description: "created event 'Sprint Planning'",
      timestamp: "4 hours ago",
      group: "Engineering"
    },
    {
      id: 3,
      actor: { name: "Alex Rivera", avatar: "" },
      type: "task_assigned",
      description: "assigned task to you",
      timestamp: "1 day ago",
      group: "Product Team"
    },
  ],
  upcomingEvents: [
    { id: 1, title: "Sprint Planning", date: "2025-12-23", time: "10:00 AM", rsvp: "accepted" },
    { id: 2, title: "Team Lunch", date: "2025-12-24", time: "12:00 PM", rsvp: "pending" },
    { id: 3, title: "Quarterly Review", date: "2025-12-28", time: "2:00 PM", rsvp: "accepted" },
  ],
  productivityInsights: {
    weeklyScore: 82,
    completionTrend: [
      { day: "Mon", completed: 65 },
      { day: "Tue", completed: 70 },
      { day: "Wed", completed: 75 },
      { day: "Thu", completed: 78 },
      { day: "Fri", completed: 82 },
    ]
  }
};

const StaffDashboard = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState("today");
  const [selectedGroup, setSelectedGroup] = useState("all");

  const handleAcceptTask = (taskId) => {
    console.log("Accept task", taskId);
  };

  const handleDeclineTask = (taskId) => {
    console.log("Decline task", taskId);
  };

  const filteredActivity = selectedGroup === "all" 
    ? mockData.teamActivity 
    : mockData.teamActivity.filter(activity => activity.group === selectedGroup);

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
                  {mockData.stats.myTasks.completed}/{mockData.stats.myTasks.total}
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
                <p className="text-2xl font-semibold mt-1">{mockData.stats.teamEvents}</p>
                <p className="text-xs text-muted-foreground mt-1">This week</p>
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
                <p className="text-2xl font-semibold mt-1">{mockData.stats.completionRate}%</p>
                <p className="text-xs text-success mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5% from last week
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`card-hover ${mockData.stats.overdueItems > 0 ? "border-red-500" : ""}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue Items</p>
                <p className={`text-2xl font-semibold mt-1 ${mockData.stats.overdueItems > 0 ? "text-red-600" : ""}`}>
                  {mockData.stats.overdueItems}
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

      {/* Today's Focus - Full Width Gradient Card */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Today's Focus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tasks Due Today */}
            <div>
              <h3 className="font-medium mb-3 flex items-center">
                <CheckSquare className="h-4 w-4 mr-2" />
                Tasks Due Today ({mockData.todaysFocus.tasksDueToday.length})
              </h3>
              <div className="space-y-2">
                {mockData.todaysFocus.tasksDueToday.map((task) => (
                  <div key={task.id} className="p-2 rounded bg-background/50">
                    <p className="text-sm font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Events Today */}
            <div>
              <h3 className="font-medium mb-3 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Events Today ({mockData.todaysFocus.eventsToday.length})
              </h3>
              <div className="space-y-2">
                {mockData.todaysFocus.eventsToday.map((event) => (
                  <div key={event.id} className="p-2 rounded bg-background/50">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{event.time}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Updates */}
            <div>
              <h3 className="font-medium mb-3 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Team Updates
              </h3>
              <div className="space-y-2">
                {mockData.todaysFocus.teamUpdates.map((update) => (
                  <div key={update.id} className="p-2 rounded bg-background/50">
                    <p className="text-sm">
                      <span className="font-medium">{update.user}</span>{" "}
                      {update.action} {update.item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* My Tasks & Assignments - Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">My Tasks & Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="my-tasks" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
                  <TabsTrigger value="assigned-to-me">Assigned to Me</TabsTrigger>
                  <TabsTrigger value="overdue">Overdue</TabsTrigger>
                </TabsList>

                <TabsContent value="my-tasks" className="mt-4">
                  <div className="space-y-3">
                    {mockData.tasks.personal.map((task) => (
                      <div
                        key={task.id}
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
                            <Badge variant="outline" className="text-xs">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="assigned-to-me" className="mt-4">
                  <div className="space-y-3">
                    {mockData.tasks.assignedToMe.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No tasks assigned to you</p>
                      </div>
                    ) : (
                      mockData.tasks.assignedToMe.map((task) => (
                        <div
                          key={task.id}
                          className="flex flex-col gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                              <Clock className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{task.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Assigned by {task.assignedBy.name}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <PriorityBadge priority={task.priority} />
                                <Badge variant="outline" className="text-xs">
                                  Due: {new Date(task.dueDate).toLocaleDateString()}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-13">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleAcceptTask(task.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleDeclineTask(task.id)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="overdue" className="mt-4">
                  <div className="space-y-3">
                    {mockData.tasks.overdue.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No overdue tasks! Great job!</p>
                      </div>
                    ) : (
                      mockData.tasks.overdue.map((task) => (
                        <div
                          key={task.id}
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
                                Overdue: {new Date(task.dueDate).toLocaleDateString()}
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

          {/* Team Activity Feed */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Team Activity Feed</CardTitle>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {mockData.groups.map((group) => (
                    <SelectItem key={group.id} value={group.name}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex gap-3 p-3 hover:bg-accent/50 rounded-lg transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.actor.avatar} />
                      <AvatarFallback>{activity.actor.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.actor.name}</span>{" "}
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                        <Badge variant="outline" className="text-xs">
                          {activity.group}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-7 gap-1 text-xs text-center mb-4">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <div key={i} className="p-2 font-medium">{day}</div>
                ))}
              </div>
              <div className="space-y-3">
                {mockData.upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-2 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </p>
                    </div>
                    <Badge 
                      variant={event.rsvp === "accepted" ? "default" : "outline"}
                      className="text-xs"
                    >
                      {event.rsvp}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/calendar">
                  View All Events <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* My Groups */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">My Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockData.groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{group.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {group.memberCount} members • {group.role}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/calendar/group/${group.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
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
                  Create Event
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/calendar/day">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Team Calendar
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Productivity Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Productivity Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-2xl font-semibold">{mockData.productivityInsights.weeklyScore}</p>
                <p className="text-sm text-muted-foreground">Weekly Score</p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={mockData.productivityInsights.completionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;