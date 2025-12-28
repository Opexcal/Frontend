import { useState, useEffect } from "react";
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
import { analyticsApi } from '@/api';
import { toast } from 'sonner';


const TaskReports = () => {
   const [dateRange, setDateRange] = useState("month");
  const [groupFilter, setGroupFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Fetch all report data
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const [
          taskReports,
          tasksByStatus,
          tasksByPriority,
          completionTrend,
          avgCompletionTime,
          overdueTasks
        ] = await Promise.all([
          analyticsApi.getTaskReports(dateRange, groupFilter !== 'all' ? groupFilter : null),
          analyticsApi.getTasksByStatus(dateRange),
          analyticsApi.getTasksByPriority(dateRange),
          analyticsApi.getTaskCompletionTrend(dateRange),
          analyticsApi.getAverageCompletionTime(dateRange),
          analyticsApi.getOverdueTasks()
        ]);

        setData({
          completionRate: taskReports.data.completionRate || { thisWeek: 0, lastWeek: 0, change: 0 },
          tasksByStatus: tasksByStatus.data || [],
          tasksByPriority: tasksByPriority.data || [],
          completionTrend: completionTrend.data || [],
          averageCompletionTime: avgCompletionTime.data || { high: 0, medium: 0, low: 0 },
          overdueTasks: overdueTasks.data.count || 0,
          tasksDueThisWeek: taskReports.data.tasksDueThisWeek || 0,
        });
      } catch (error) {
        console.error('Error fetching task reports:', error);
        toast.error("Failed to Load Reports", {
  description: "Failed to load task reports. Please try again.",
});
      } finally {
        setLoading(false);
      }
      const tasksByStatus = await analyticsApi.getTasksByStatus(dateRange);
console.log('Frontend received tasksByStatus:', tasksByStatus);
console.log('Frontend data:', tasksByStatus.data);
    };

    fetchReportData();
    
  }, [dateRange, groupFilter, toast]);
  
  // Handle export
  const handleExport = async () => {
  try {
    toast.info("Exporting...", {
      description: "Preparing your report for download.",
    });
    
    // Call export API endpoint
    const response = await analyticsApi.exportTaskReport(dateRange, groupFilter);
    
    // ✅ FIXED: Don't wrap response.data in Blob - it's already a Blob
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `task-report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link); // ✅ Add to DOM for Firefox support
    link.click();
    document.body.removeChild(link); // ✅ Clean up
    window.URL.revokeObjectURL(url);
    
    toast.success("Export Successful", {
      description: "Report exported successfully.",
    });
  } catch (error) {
    console.error('Error exporting report:', error);
    toast.error("Export Failed", {
      description: error.response?.data?.message || "Failed to export report. Please try again.",
    });
  }
};

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading report data...</p>
        </div>
      </div>
    );
  }

  // Show error state if no data
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

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
          <Button onClick={handleExport}>
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
                <p className="text-2xl font-semibold mt-1">{data.completionRate.thisWeek}%</p>
                <p className="text-xs text-success mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{data.completionRate.change}% from last week
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
                <p className="text-2xl font-semibold mt-1">{data.tasksDueThisWeek}</p>
                <p className="text-xs text-muted-foreground mt-1">Need attention</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className={data.overdueTasks > 0 ? "border-red-500" : ""}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue Tasks</p>
                <p className={`text-2xl font-semibold mt-1 ${data.overdueTasks > 0 ? "text-red-600" : ""}`}>
                  {data.overdueTasks}
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
                <p className="text-2xl font-semibold mt-1">
  {data.averageCompletionTime.medium < 1 
    ? `${(data.averageCompletionTime.medium * 24).toFixed(1)} hrs`
    : `${data.averageCompletionTime.medium} days`
  }
</p>
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
        {/* Tasks by Status */}
<Card>
  <CardHeader>
    <CardTitle>Tasks by Status</CardTitle>
  </CardHeader>
  <CardContent>
    {data.tasksByStatus && data.tasksByStatus.length > 0 ? (
      <>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data.tasksByStatus}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.tasksByStatus.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        {/* Optional: Show legend below chart */}
        <div className="mt-4 space-y-2">
          {data.tasksByStatus.map(item => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
              </div>
              <Badge variant="outline">{item.value}</Badge>
            </div>
          ))}
        </div>
      </>
    ) : (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        <div className="text-center">
          <CheckSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No task data available</p>
        </div>
      </div>
    )}
  </CardContent>
</Card>

        {/* Completion by Priority */}
        <Card>
          <CardHeader>
            <CardTitle>Completion Rate by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.tasksByPriority}>
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
              {data.tasksByPriority.map(item => (
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
            <LineChart data={data.completionTrend}>
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
              { priority: "High", days: data.averageCompletionTime.high },
              { priority: "Medium", days: data.averageCompletionTime.medium },
              { priority: "Low", days: data.averageCompletionTime.low },
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

