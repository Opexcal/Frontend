import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Users, Building2, CheckSquare, Calendar, Activity,
  TrendingUp, Download, Settings, FileText, AlertTriangle,
  Plus, Send, BarChart3, Loader2, AlertCircle,MessageSquare, UserPlus  // <- Add these two
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

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
import { useDashboard } from '@/hooks/useDashboard';
import { format } from "date-fns";
import { analyticsApi } from '@/api/analyticsApi';
import AddUserModal from '../admin/users/AddUserModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
// Mock data for charts (TODO: Replace with real analytics endpoint)
// Mock data for fallback when API data is empty

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState("month");
  const [showAddUser, setShowAddUser] = useState(false);
  const { user } = useAuth();
  const { data, loading, error } = useDashboard();
  const [dateRange, setDateRange] = useState("month");

    const [chartData, setChartData] = useState({
    userGrowth: [],
    taskCompletion: [],
    eventAttendance: []
  });
  const [topPerformers, setTopPerformers] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [kpisData, setKpisData] = useState(null);

  // Fetch analytics data
useEffect(() => {
  const fetchAnalytics = async () => {
    try {
      const [userGrowth, taskComp, eventAtt, performers, deptPerf, kpis] = await Promise.all([
        analyticsApi.getUserGrowth(dateRange).catch(() => ({ data: [] })),
        analyticsApi.getTaskCompletion(dateRange).catch(() => ({ data: [] })),
        analyticsApi.getEventAttendance(dateRange).catch(() => ({ data: [] })),
        analyticsApi.getTopPerformers().catch(() => ({ data: [] })),
        analyticsApi.getDepartmentPerformance().catch(() => ({ data: [] })),
        analyticsApi.getKPIs().catch(() => ({ data: null }))
      ]);

      // Debug logging
      console.log('📊 KPIs Raw Response:', kpis);
      console.log('📊 KPIs Data:', kpis.data);
      
      setChartData({
        userGrowth: userGrowth.data || [],
        taskCompletion: taskComp.data || [],
        eventAttendance: eventAtt.data || []
      });
      setTopPerformers(performers.data || []);
      setDepartmentData(deptPerf.data || []);
      setKpisData(kpis.data);
      
      // Debug what was set
      console.log('✅ KPIs Data Set:', kpis.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  if (!loading && !error) {
    fetchAnalytics();
  }
}, [loading, error, dateRange]);

  const handleFilterChange = (filter) => {
    setTimeFilter(filter);
    toast.success(`Viewing data for: This ${filter.charAt(0).toUpperCase() + filter.slice(1)}`);
    // TODO: Fetch filtered data based on timeFilter
  };

  // Export PDF handler
const handleExportReport = () => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text("Manager Dashboard Report", 14, 20);
  
  // Subtitle with date and filter
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 28);
  doc.text(`Time Period: This ${timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)}`, 14, 34);
  
  // Organization Overview
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Organization Overview", 14, 45);
  
  const overviewData = [
    ["Total Users", String(kpis.totalUsers), kpis.totalUsersGrowth],
    ["Active Projects", String(kpis.activeProjects), "+3 this month"],
    ["Task Completion", `${kpis.taskCompletionRate.percentage}%`, kpis.taskCompletionRate.trend],
    ["Event Attendance", `${kpis.eventAttendanceRate.percentage}%`, kpis.eventAttendanceRate.trend],
    ["System Health", `${kpis.systemHealth.uptime}%`, "Uptime"]
  ];
  
  autoTable(doc, {
    startY: 50,
    head: [["Metric", "Value", "Change"]],
    body: overviewData,
    theme: "striped"
  });
  
  // Team Management
  let finalY = doc.lastAutoTable.finalY + 10;
  doc.text("Team Management", 14, finalY);
  
  const teamData = [
    ["Team Dashboard", "Overview of team performance"],
    ["Manage Team Tasks", "Current team assignments"],
    ["Team Calendar", "Scheduled events and meetings"],
    ["View Team Reports", "Detailed analytics"]
  ];
  
  autoTable(doc, {
    startY: finalY + 5,
    head: [["Section", "Description"]],
    body: teamData,
    theme: "grid"
  });
  
  // Add Top Performers if available
  if (topPerformers.length > 0) {
    finalY = doc.lastAutoTable.finalY + 10;
    doc.text("Top Performers", 14, finalY);
    
    const performerData = topPerformers.map((p, i) => [
      `#${i + 1}`,
      p.name,
      `${p.completion}%`,
      `${p.attendance}%`
    ]);
    
    autoTable(doc, {
      startY: finalY + 5,
      head: [["Rank", "Name", "Task Completion", "Attendance"]],
      body: performerData,
      theme: "striped"
    });
  }
  
  // Add Department Performance if available
  if (departmentData.length > 0) {
    finalY = doc.lastAutoTable.finalY + 10;
    doc.text("Department Performance", 14, finalY);
    
    const deptData = departmentData.map(d => [
      d.name,
      String(d.memberCount),
      String(d.activeTasks),
      String(d.events),
      String(d.healthScore)
    ]);
    
    autoTable(doc, {
      startY: finalY + 5,
      head: [["Department", "Members", "Active Tasks", "Events", "Health Score"]],
      body: deptData,
      theme: "grid"
    });
  }
  
  // Save PDF
  doc.save(`Manager-Dashboard-Report-${new Date().toISOString().split('T')[0]}.pdf`);
  toast.success("Report exported successfully!");
};

  // Quick Actions handlers
  const handleAddUser = () => {
    setShowAddUser(true);
  };

  const handleCreateGroup = () => {
    navigate("/admin/groups");
  };

  const handleSendAnnouncement = () => {
    navigate("/mass/message");
  };

  // Report handlers
  const handlePerformanceReport = () => {
    navigate("/reports/productivity");
  };

  const handleUserActivityReport = () => {
    navigate("/reports/tasks");
  };

  const handleEventAnalysis = () => {
    navigate("/reports/attendance");
  };

  const handleUserCreated = (newUser) => {
    toast.success(`${newUser.name} has been added successfully!`);
    setShowAddUser(false);
    // TODO: Refresh dashboard data
  };

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


const kpis = kpisData ? {
  totalUsers: kpisData.totalUsers || 0,
  totalUsersGrowth: kpisData.totalUsersGrowth || "+0%",
  activeProjects: kpisData.activeProjects || 0,
  taskCompletionRate: {
    percentage: kpisData.taskCompletionRate?.percentage || 0,
    trend: kpisData.taskCompletionRate?.trend || "+0%"
  },
  eventAttendanceRate: {
    percentage: kpisData.eventAttendanceRate?.percentage || 0,
    trend: kpisData.eventAttendanceRate?.trend || "+0%"
  },
  systemHealth: {
    uptime: kpisData.systemHealth?.uptime || 0,
    status: kpisData.systemHealth?.status || "unknown"
  }
} : {
  totalUsers: 0,
  totalUsersGrowth: "+0%",
  activeProjects: 0,
  taskCompletionRate: {
    percentage: 0,
    trend: "+0%"
  },
  eventAttendanceRate: {
    percentage: 0,
    trend: "+0%"
  },
  systemHealth: {
    uptime: 0,
    status: "unknown"
  }
};

// Add this logging
console.log('🎯 Final KPIs Object:', kpis);
console.log('📌 kpisData state:', kpisData);

const upcomingOrgEvents = (data.upcomingEvents.events || []).slice(0, 10);
const recentActivity = (data.recentActivity.notifications || []).slice(0, 10);

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

  // Loading state

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
         <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" className="gap-2">
      <Calendar className="h-4 w-4" />
      This {timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)}
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={() => handleFilterChange("week")}>
      This Week
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => handleFilterChange("month")}>
      This Month
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => handleFilterChange("quarter")}>
      This Quarter
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
          <Button variant="outline" className="gap-2" onClick={handleExportReport}>
  <Download className="h-4 w-4" />
  Export Report
</Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/dashboard">
              <Settings className="h-4 w-4 mr-2" />
              Admin Console
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
{/* KPI Cards - Keep these 5 only */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
  <Card className="card-hover">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total Users</p>
          <p className="text-2xl font-semibold mt-1">{kpis.totalUsers}</p>
          <p className="text-xs text-success mt-1 flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            {kpis.totalUsersGrowth} growth
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
          <p className="text-2xl font-semibold mt-1">{kpis.activeProjects}</p>
          <p className="text-xs text-success mt-1">+3 this month</p>
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
          <p className="text-2xl font-semibold mt-1">{kpis.taskCompletionRate.percentage}%</p>
          <p className="text-xs text-success mt-1">{kpis.taskCompletionRate.trend}</p>
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
          <p className="text-2xl font-semibold mt-1">{kpis.eventAttendanceRate.percentage}%</p>
          <p className="text-xs text-success mt-1">{kpis.eventAttendanceRate.trend}</p>
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
          <p className="text-2xl font-semibold mt-1">{kpis.systemHealth.uptime}%</p>
          <p className="text-xs text-success mt-1">Uptime</p>
        </div>
        <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
          <Activity className="h-6 w-6 text-green-600" />
        </div>
      </div>
    </CardContent>
  </Card>
</div>

{/* Quick Actions - NEW SECTION AFTER KPI CARDS */}
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

{/* Three Column Layout continues below... */}
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
                    <LineChart data={chartData.userGrowth}>
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
                    <AreaChart data={chartData.taskCompletion}>
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
                    <BarChart data={chartData.eventAttendance}>
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
                {topPerformers.map((performer, index) => (
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
    {/* This section uses mockData - you'll need a real API endpoint for pending actions */}
    <p className="text-sm text-muted-foreground text-center py-4">
      No pending actions
    </p>
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
                {departmentData.map((group) => (
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
    {recentActivity.length === 0 ? (
      <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
    ) : (
      recentActivity.map((notification) => (
        <div
          key={notification._id}
          className="p-3 rounded-lg border border-border"
        >
          <p className="text-sm">{notification.message || "Notification"}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(notification.createdAt), "MMM d, h:mm a")}
          </p>
        </div>
      ))
    )}
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
              {/* In Quick Actions section */}
<Button variant="outline" className="w-full justify-start gap-2" onClick={handleAddUser}>
  <UserPlus className="h-4 w-4" />
  Add User
</Button>

<Button variant="outline" className="w-full justify-start gap-2" onClick={handleCreateGroup}>
  <Users className="h-4 w-4" />
  Create Group
</Button>

<Button variant="outline" className="w-full justify-start gap-2" onClick={handleSendAnnouncement}>
  <MessageSquare className="h-4 w-4" />
  Send Announcement
</Button>

<Button variant="outline" className="w-full justify-start gap-2" onClick={handleExportReport}>
  <FileText className="h-4 w-4" />
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
    {upcomingOrgEvents.length === 0 ? (
      <p className="text-sm text-muted-foreground text-center py-4">No upcoming events</p>
    ) : (
      upcomingOrgEvents.map((event) => (
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
              {format(new Date(event.startDate), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
      ))
    )}
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
    <p className="text-sm text-muted-foreground text-center py-4">
      No system alerts
    </p>
  </div>
</CardContent>
          </Card>

          {/* Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
             {/* In Reports section */}
<Button variant="outline" className="w-full justify-start gap-2" onClick={handlePerformanceReport}>
  <TrendingUp className="h-4 w-4" />
  Performance Report
</Button>

<Button variant="outline" className="w-full justify-start gap-2" onClick={handleUserActivityReport}>
  <Activity className="h-4 w-4" />
  User Activity Report
</Button>

<Button variant="outline" className="w-full justify-start gap-2" onClick={handleEventAnalysis}>
  <BarChart3 className="h-4 w-4" />
  Event Analysis
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
                {departmentData.map((group) => (
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

      <AddUserModal 
  open={showAddUser} 
  onOpenChange={setShowAddUser} 
  onSuccess={handleUserCreated} 
/>
    </div>
  );
};

export default ManagerDashboard;


