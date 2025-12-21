import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users, Building2, CheckSquare, Calendar, Activity,
  TrendingUp, Download, Settings, FileText, AlertTriangle,
  Link as LinkIcon, Plus, Send, BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

// Mock data
const mockData = {
  kpis: {
    totalUsers: { count: 142, growth: "+12%" },
    activeProjects: { count: 28, growth: "+3" },
    taskCompletionRate: { percentage: 87, trend: "+5%" },
    eventAttendanceRate: { percentage: 92, trend: "+2%" },
    systemHealth: { uptime: 99.8, status: "healthy" }
  },
  charts: {
    userGrowth: [
      { month: "Aug", users: 98 },
      { month: "Sep", users: 105 },
      { month: "Oct", users: 118 },
      { month: "Nov", users: 132 },
      { month: "Dec", users: 142 },
    ],
    taskCompletion: [
      { week: "Week 1", completed: 450, total: 520 },
      { week: "Week 2", completed: 480, total: 540 },
      { week: "Week 3", completed: 510, total: 560 },
      { week: "Week 4", completed: 530, total: 570 },
    ],
    eventAttendance: [
      { month: "Aug", attendance: 85 },
      { month: "Sep", attendance: 88 },
      { month: "Oct", attendance: 90 },
      { month: "Nov", attendance: 91 },
      { month: "Dec", attendance: 92 },
    ]
  },
  topPerformers: [
    { id: 1, name: "Sarah Johnson", completion: 95, attendance: 98, avatar: "" },
    { id: 2, name: "Mike Chen", completion: 92, attendance: 95, avatar: "" },
    { id: 3, name: "Alex Rivera", completion: 90, attendance: 92, avatar: "" },
    { id: 4, name: "Emma Wilson", completion: 88, attendance: 90, avatar: "" },
    { id: 5, name: "David Kim", completion: 87, attendance: 89, avatar: "" },
  ],
  pendingActions: {
    userApprovals: 3,
    unassignedGroups: 1,
    systemAlerts: 2
  },
  groups: [
    {
      id: 1,
      name: "Engineering",
      memberCount: 24,
      activeTasks: 45,
      events: 12,
      healthScore: 92
    },
    {
      id: 2,
      name: "Product",
      memberCount: 12,
      activeTasks: 28,
      events: 8,
      healthScore: 88
    },
    {
      id: 3,
      name: "Marketing",
      memberCount: 18,
      activeTasks: 32,
      events: 15,
      healthScore: 85
    },
    {
      id: 4,
      name: "Sales",
      memberCount: 22,
      activeTasks: 38,
      events: 10,
      healthScore: 78
    },
  ],
  recentActivity: [
    {
      id: 1,
      type: "user_created",
      description: "New user 'John Doe' registered",
      timestamp: "2 hours ago",
      severity: "info"
    },
    {
      id: 2,
      type: "group_created",
      description: "New group 'Customer Success' created",
      timestamp: "5 hours ago",
      severity: "info"
    },
    {
      id: 3,
      type: "system_alert",
      description: "High task load detected in Engineering team",
      timestamp: "1 day ago",
      severity: "warning"
    },
  ],
  systemAlerts: [
    {
      id: 1,
      type: "storage",
      message: "Storage usage at 78%",
      severity: "warning",
      action: "Upgrade plan"
    },
    {
      id: 2,
      type: "update",
      message: "New version available (v2.1.0)",
      severity: "info",
      action: "Update now"
    },
  ],
  upcomingOrgEvents: [
    { id: 1, title: "All-Hands Meeting", date: "2025-12-28", time: "10:00 AM" },
    { id: 2, title: "Quarterly Planning", date: "2026-01-05", time: "2:00 PM" },
  ]
};

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState("month");

  const getHealthColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthBg = (score) => {
    if (score >= 80) return "bg-green-500/10";
    if (score >= 60) return "bg-yellow-500/10";
    return "bg-red-500/10";
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "error":
        return "text-red-600 bg-red-500/10 border-red-500/20";
      case "warning":
        return "text-orange-600 bg-orange-500/10 border-orange-500/20";
      default:
        return "text-blue-600 bg-blue-500/10 border-blue-500/20";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold text-foreground">
            Organization Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive view of your organization's metrics and performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin">
              <Settings className="h-4 w-4 mr-2" />
              Admin Console
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-semibold mt-1">{mockData.kpis.totalUsers.count}</p>
                <p className="text-xs text-success mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {mockData.kpis.totalUsers.growth} growth
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-semibold mt-1">{mockData.kpis.activeProjects.count}</p>
                <p className="text-xs text-success mt-1">+{mockData.kpis.activeProjects.growth} this month</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Task Completion</p>
                <p className="text-2xl font-semibold mt-1">{mockData.kpis.taskCompletionRate.percentage}%</p>
                <p className="text-xs text-success mt-1">{mockData.kpis.taskCompletionRate.trend}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckSquare className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Event Attendance</p>
                <p className="text-2xl font-semibold mt-1">{mockData.kpis.eventAttendanceRate.percentage}%</p>
                <p className="text-xs text-success mt-1">{mockData.kpis.eventAttendanceRate.trend}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Health</p>
                <p className="text-2xl font-semibold mt-1">{mockData.kpis.systemHealth.uptime}%</p>
                <p className="text-xs text-success mt-1">Uptime</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[40%_35%_25%] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Organization Metrics Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Organization Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="user-growth" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="user-growth">User Growth</TabsTrigger>
                  <TabsTrigger value="task-completion">Tasks</TabsTrigger>
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                </TabsList>

                <TabsContent value="user-growth" className="mt-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockData.charts.userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="task-completion" className="mt-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={mockData.charts.taskCompletion}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stackId="1"
                        stroke="#10b981"
                        fill="#10b981"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="attendance" className="mt-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockData.charts.eventAttendance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="attendance" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockData.topPerformers.map((performer, index) => (
                  <div
                    key={performer.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={performer.avatar} />
                      <AvatarFallback>{performer.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{performer.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {performer.completion}% tasks
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {performer.attendance}% attendance
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Pending Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockData.pendingActions.userApprovals > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-sm">User Approvals</p>
                        <p className="text-xs text-muted-foreground">
                          {mockData.pendingActions.userApprovals} pending
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/admin/users">Review</Link>
                    </Button>
                  </div>
                )}
                {mockData.pendingActions.unassignedGroups > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Unassigned Groups</p>
                        <p className="text-xs text-muted-foreground">
                          {mockData.pendingActions.unassignedGroups} needs assignment
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/admin/groups">Review</Link>
                    </Button>
                  </div>
                )}
                {mockData.pendingActions.systemAlerts > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-yellow-500/50 bg-yellow-500/5">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-sm">System Alerts</p>
                        <p className="text-xs text-muted-foreground">
                          {mockData.pendingActions.systemAlerts} require attention
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column */}
        <div className="space-y-6">
          {/* Team Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Team Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockData.groups.map((group) => (
                  <div
                    key={group.id}
                    className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{group.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {group.memberCount} members
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded ${getHealthBg(group.healthScore)}`}>
                        <span className={`text-xs font-semibold ${getHealthColor(group.healthScore)}`}>
                          {group.healthScore}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Tasks:</span>{" "}
                        <span className="font-medium">{group.activeTasks}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Events:</span>{" "}
                        <span className="font-medium">{group.events}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockData.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className={`p-3 rounded-lg border ${getSeverityColor(activity.severity)}`}
                  >
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/users/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/groups/create">
                  <Building2 className="h-4 w-4 mr-2" />
                  Create Group
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Send className="h-4 w-4 mr-2" />
                Send Announcement
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Org Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Upcoming Org Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockData.upcomingOrgEvents.map((event) => (
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockData.systemAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2 w-full">
                      {alert.action}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Performance Report
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Users className="h-4 w-4 mr-2" />
                User Activity Report
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Event Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom - Department Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Department Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-sm font-medium">Department</th>
                  <th className="text-right p-3 text-sm font-medium">Members</th>
                  <th className="text-right p-3 text-sm font-medium">Active Tasks</th>
                  <th className="text-right p-3 text-sm font-medium">Events</th>
                  <th className="text-right p-3 text-sm font-medium">Health Score</th>
                </tr>
              </thead>
              <tbody>
                {mockData.groups.map((group) => (
                  <tr key={group.id} className="border-b hover:bg-accent/50 transition-colors">
                    <td className="p-3">
                      <p className="font-medium text-sm">{group.name}</p>
                    </td>
                    <td className="p-3 text-right text-sm">{group.memberCount}</td>
                    <td className="p-3 text-right text-sm">{group.activeTasks}</td>
                    <td className="p-3 text-right text-sm">{group.events}</td>
                    <td className="p-3 text-right">
                      <Badge
                        variant="outline"
                        className={getHealthColor(group.healthScore)}
                      >
                        {group.healthScore}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerDashboard;