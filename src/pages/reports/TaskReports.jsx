import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  Download, Calendar, TrendingUp, CheckSquare, Clock, AlertCircle
} from "lucide-react";
import { format, subDays, subMonths, startOfWeek, endOfWeek } from "date-fns";

// Mock data
const mockData = {
  completionRate: {
    thisWeek: 78,
    lastWeek: 72,
    change: 6
  },
  tasksByStatus: [
    { name: "Completed", value: 245, color: "#10b981" },
    { name: "In Progress", value: 89, color: "#3b82f6" },
    { name: "Not Started", value: 34, color: "#6b7280" },
    { name: "On Hold", value: 12, color: "#f59e0b" },
  ],
  tasksByPriority: [
    { priority: "High", completed: 120, total: 150, percentage: 80 },
    { priority: "Medium", completed: 95, total: 120, percentage: 79 },
    { priority: "Low", completed: 30, total: 50, percentage: 60 },
  ],
  completionTrend: [
    { week: "Week 1", completed: 45, created: 52 },
    { week: "Week 2", completed: 52, created: 58 },
    { week: "Week 3", completed: 48, created: 55 },
    { week: "Week 4", completed: 55, created: 60 },
    { week: "Week 5", completed: 60, created: 65 },
  ],
  averageCompletionTime: {
    high: 2.5, // days
    medium: 4.2,
    low: 7.8,
  },
  overdueTasks: 23,
  tasksDueThisWeek: 45,
};

const TaskReports = () => {
  const [dateRange, setDateRange] = useState("month");
  const [groupFilter, setGroupFilter] = useState("all");

  const COLORS = ["#10b981", "#3b82f6", "#6b7280", "#f59e0b", "#ef4444"];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-semibold text-foreground">Task Reports</h1>
          <p className="text-muted-foreground mt-1">Task completion analytics and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-semibold mt-1">{mockData.completionRate.thisWeek}%</p>
                <p className="text-xs text-success mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{mockData.completionRate.change}% from last week
                </p>
              </div>
              <CheckSquare className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasks Due This Week</p>
                <p className="text-2xl font-semibold mt-1">{mockData.tasksDueThisWeek}</p>
                <p className="text-xs text-muted-foreground mt-1">Need attention</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className={mockData.overdueTasks > 0 ? "border-red-500" : ""}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue Tasks</p>
                <p className={`text-2xl font-semibold mt-1 ${mockData.overdueTasks > 0 ? "text-red-600" : ""}`}>
                  {mockData.overdueTasks}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Requires action</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Completion Time</p>
                <p className="text-2xl font-semibold mt-1">{mockData.averageCompletionTime.medium} days</p>
                <p className="text-xs text-muted-foreground mt-1">Medium priority</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockData.tasksByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockData.tasksByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Completion by Priority */}
        <Card>
          <CardHeader>
            <CardTitle>Completion Rate by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockData.tasksByPriority}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                <Bar dataKey="total" fill="#e5e7eb" name="Total" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {mockData.tasksByPriority.map(item => (
                <div key={item.priority} className="flex items-center justify-between text-sm">
                  <span>{item.priority} Priority</span>
                  <Badge variant="outline">{item.percentage}% complete</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completion Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Completion Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={mockData.completionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} name="Completed" />
              <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} name="Created" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Average Completion Time */}
      <Card>
        <CardHeader>
          <CardTitle>Average Completion Time by Priority</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { priority: "High", days: mockData.averageCompletionTime.high },
              { priority: "Medium", days: mockData.averageCompletionTime.medium },
              { priority: "Low", days: mockData.averageCompletionTime.low },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="priority" />
              <YAxis label={{ value: "Days", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Bar dataKey="days" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskReports;

