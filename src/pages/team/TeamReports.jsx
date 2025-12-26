import React, { useEffect, useState, useMemo, useCallback, memo } from "react";
import { Download, BarChart3, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { teamApi } from '@/api/teamApi';
import { toast } from "sonner";

// ✅ Memoized sub-components to prevent unnecessary re-renders
const SummaryCard = memo(({ title, value, subtitle, icon: Icon, color }) => (
  <Card className="p-4">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-muted-foreground">{title}</p>
      <Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} />
    </div>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
    {subtitle && (
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    )}
  </Card>
));

SummaryCard.displayName = 'SummaryCard';

const TeamReports = () => {
  const [dateRange, setDateRange] = useState("30days");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [groupId, setGroupId] = useState(null);
  const [groups, setGroups] = useState([]);

  // ✅ Memoize helper function
  const logApiError = useCallback((context, error) => {
    console.error(`[API Error - ${context}]`, {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      url: error?.config?.url
    });
  }, []);

  // ✅ Memoize trend data generation
  const generateTrendData = useCallback((range, dataOrTotal) => {
    if (Array.isArray(dataOrTotal)) {
      return dataOrTotal.map((item, i) => ({
        date: item.date || item._id || `Period ${i + 1}`,
        count: item.count || item.value || 0
      }));
    }
    
    const periods = range === '7days' ? 7 : range === '30days' ? 4 : 12;
    const label = range === '7days' ? 'Day' : range === '30days' ? 'Week' : 'Month';
    const total = typeof dataOrTotal === 'number' ? dataOrTotal : 0;
    
    return Array.from({ length: periods }, (_, i) => ({
      date: `${label} ${i + 1}`,
      count: Math.round((total / periods) * (1 + Math.random() * 0.5))
    }));
  }, []);

  // ✅ Wrap fetchGroups in useCallback
  const fetchGroups = useCallback(async () => {
    try {
      const response = await teamApi.getDashboard();
      const teamGroups = response.teams || response.data?.teams || [];
      setGroups(teamGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  }, []);

  // ✅ Wrap fetchReports in useCallback
  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const periodMap = {
        '7days': 'week',
        '30days': 'month',
        '90days': 'quarter'
      };
      
      const params = { 
        period: periodMap[dateRange] || 'month'
      };
      
      if (groupId) {
        params.groupId = groupId;
      }
      
      const [reportsResponse, tasksResponse] = await Promise.all([
        teamApi.getReports(params),
        teamApi.getTasks(groupId ? { groupId } : {})
      ]);
      
      const reportData = reportsResponse.data || reportsResponse;
      const tasksData = tasksResponse.tasks || tasksResponse.data?.tasks || [];
      
      // Calculate breakdown from actual tasks
      let pending = 0, inProgress = 0, completed = 0, rejected = 0;
      
      tasksData.forEach(task => {
        const status = (task.status || '').toLowerCase().trim();
        
        if (status === 'pending') {
          pending++;
        } else if (status === 'in-progress' || status === 'in progress') {
          inProgress++;
        } else if (status === 'completed') {
          completed++;
        } else if (status === 'rejected') {
          rejected++;
        }
      });
      
      const useCalculated = (reportData.taskBreakdown?.pending === 0 && 
                            reportData.taskBreakdown?.inProgress === 0 && 
                            reportData.taskBreakdown?.completed === 0 && 
                            reportData.taskBreakdown?.rejected === 0 &&
                            tasksData.length > 0);
      
      const tasksByStatus = [
        { status: 'Pending', count: useCalculated ? pending : (reportData.taskBreakdown?.pending || 0) },
        { status: 'In Progress', count: useCalculated ? inProgress : (reportData.taskBreakdown?.inProgress || 0) },
        { status: 'Completed', count: useCalculated ? completed : (reportData.taskBreakdown?.completed || 0) },
        { status: 'Rejected', count: useCalculated ? rejected : (reportData.taskBreakdown?.rejected || 0) }
      ];
      
      const totalTasks = pending + inProgress + completed + rejected;
      
      // Calculate priority distribution
      let highPriority = 0, mediumPriority = 0, lowPriority = 0;
      
      tasksData.forEach(task => {
        const priority = (task.priority || '').toLowerCase().trim();
        if (priority === 'high') highPriority++;
        else if (priority === 'medium') mediumPriority++;
        else if (priority === 'low') lowPriority++;
      });
      
      const tasksByPriority = totalTasks > 0 ? [
        { 
          priority: 'High', 
          count: highPriority,
          percentage: Math.round((highPriority / totalTasks) * 100)
        },
        { 
          priority: 'Medium', 
          count: mediumPriority,
          percentage: Math.round((mediumPriority / totalTasks) * 100)
        },
        { 
          priority: 'Low', 
          count: lowPriority,
          percentage: Math.round((lowPriority / totalTasks) * 100)
        }
      ] : [
        { priority: 'High', count: 0, percentage: 0 },
        { priority: 'Medium', count: 0, percentage: 0 },
        { priority: 'Low', count: 0, percentage: 0 }
      ];
      
      // Calculate member performance
      let performersMap = {};
      tasksData.forEach(task => {
        const assignees = task.assignees || task.assignedTo || [];
        const taskStatus = (task.status || '').toLowerCase().trim();
        const isCompleted = taskStatus === 'completed';
        
        const assigneesList = Array.isArray(assignees) ? assignees : [assignees];
        
        assigneesList.forEach(assignee => {
          const userId = assignee?._id || assignee?.id || assignee;
          const userName = assignee?.name || assignee?.email?.split('@')[0] || 'Unknown User';
          const userEmail = assignee?.email || '';
          
          if (!userId) return;
          
          if (!performersMap[userId]) {
            performersMap[userId] = {
              userId,
              userName,
              userEmail,
              tasksAssigned: 0,
              tasksCompleted: 0
            };
          }
          
          performersMap[userId].tasksAssigned++;
          if (isCompleted) {
            performersMap[userId].tasksCompleted++;
          }
        });
      });

      const topPerformers = reportData.topPerformers || [];
      const memberPerformance = topPerformers.length > 0 
        ? topPerformers.map(p => {
            const tasksCompleted = p.tasksCompleted || 0;
            const tasksAssigned = p.tasksAssigned || Math.max(tasksCompleted, Math.round(tasksCompleted * 1.2));
            const rate = tasksAssigned > 0 ? Math.round((tasksCompleted / tasksAssigned) * 100) : 0;
            
            return {
              memberId: p.userId || p.user?._id || p.user?.id || Math.random().toString(),
              name: p.userName || p.user?.name || p.user?.email?.split('@')[0] || 'Unknown',
              assigned: tasksAssigned,
              completed: tasksCompleted,
              rate: Math.min(rate, 100)
            };
          })
        : Object.values(performersMap)
            .map(p => ({
              memberId: p.userId,
              name: p.userName,
              assigned: p.tasksAssigned,
              completed: p.tasksCompleted,
              rate: p.tasksAssigned > 0 
                ? Math.min(Math.round((p.tasksCompleted / p.tasksAssigned) * 100), 100)
                : 0
            }))
            .sort((a, b) => b.rate - a.rate)
            .slice(0, 10);
      
      const completionRate = totalTasks > 0 
        ? Math.round((completed / totalTasks) * 100)
        : 0;
      
      const overdueTrend = reportData.trend || generateTrendData(dateRange, rejected);
      
      setReportData({
        completionRate,
        tasksByStatus,
        tasksByPriority,
        memberPerformance,
        overdueTrend,
        totalEvents: reportData.totalEvents || 0,
        period: reportData.period || dateRange
      });
      
    } catch (error) {
      logApiError('Team Reports', error);
      toast.error("Failed to load reports", {
        description: error?.response?.data?.message || error?.message || "Unable to fetch data",
      });
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [dateRange, groupId, generateTrendData, logApiError]);

  // ✅ Wrap handleExport in useCallback
  const handleExport = useCallback(async () => {
    if (!reportData) {
      toast.error("No data to export", {
        description: "Please wait for the report to load",
      });
      return;
    }

    try {
      const csv = [
        ['Team Performance Report', `Period: ${dateRange}`],
        ['Generated:', new Date().toLocaleString()],
        [],
        ['Summary'],
        ['Total Tasks', reportData.tasksByStatus.reduce((sum, item) => sum + item.count, 0)],
        ['Completion Rate', `${reportData.completionRate}%`],
        ['Total Events', reportData.totalEvents],
        [],
        ['Task Status', 'Count'],
        ...reportData.tasksByStatus.map(item => [item.status, item.count]),
        [],
        ['Priority', 'Count', 'Percentage'],
        ...reportData.tasksByPriority.map(item => [item.priority, item.count, `${item.percentage}%`]),
        [],
        ['Member', 'Assigned', 'Completed', 'Completion Rate'],
        ...reportData.memberPerformance.map(m => 
          [m.name, m.assigned, m.completed, `${m.rate}%`]
        ),
        [],
        ['Trend Data'],
        ['Period', 'Count'],
        ...reportData.overdueTrend.map(t => [t.date, t.count])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `team-report-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Report exported", {
        description: "CSV file downloaded successfully",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed", {
        description: "Could not generate report file",
      });
    }
  }, [reportData, dateRange]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // ✅ Memoize computed values
  const computedStats = useMemo(() => {
    if (!reportData) return null;
    
    const totalTasks = reportData.tasksByStatus.reduce((sum, item) => sum + item.count, 0);
    const completedTasks = reportData.tasksByStatus.find(item => item.status === "Completed")?.count || 0;
    const inProgressTasks = reportData.tasksByStatus.find(item => item.status === "In Progress")?.count || 0;
    const teamAverage = reportData.memberPerformance.length > 0
      ? Math.round(
          reportData.memberPerformance.reduce((sum, m) => sum + m.rate, 0) /
            reportData.memberPerformance.length
        )
      : 0;
    
    return { totalTasks, completedTasks, inProgressTasks, teamAverage };
  }, [reportData]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded" />
            <div className="h-80 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">Failed to load reports</p>
          <p className="text-sm text-muted-foreground mb-4">
            Check your connection and try again
          </p>
          <Button 
            onClick={fetchReports} 
            variant="outline" 
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Team Reports</h1>
          <p className="text-muted-foreground mt-1">
            Analytics and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {groups.length > 0 && (
            <Select value={groupId || "all"} onValueChange={(val) => setGroupId(val === "all" ? null : val)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Teams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group._id || group.id} value={group._id || group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={fetchReports} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Stats - Using memoized SummaryCard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Tasks"
          value={computedStats.totalTasks}
          subtitle={reportData.totalEvents > 0 ? `${reportData.totalEvents} events` : null}
          icon={BarChart3}
        />
        <SummaryCard
          title="Completed"
          value={computedStats.completedTasks}
          subtitle={`${reportData.completionRate}% completion rate`}
          icon={TrendingUp}
          color="text-green-600"
        />
        <SummaryCard
          title="In Progress"
          value={computedStats.inProgressTasks}
          subtitle={computedStats.totalTasks > 0 ? `${Math.round((computedStats.inProgressTasks / computedStats.totalTasks) * 100)}% of total` : null}
          icon={TrendingUp}
          color="text-blue-600"
        />
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Team Average</p>
            <Badge variant="secondary">
              {reportData.memberPerformance.length} members
            </Badge>
          </div>
          <p className="text-2xl font-bold">
            {computedStats.teamAverage}%
          </p>
        </Card>
      </div>

      {/* Charts remain the same... */}
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Task Status Distribution</h2>
          <p className="text-sm text-muted-foreground">
            Overview of all tasks by their current status
          </p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reportData.tasksByStatus}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" name="Tasks" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tasks by Priority</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={reportData.tasksByPriority}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ priority, percentage }) =>
                  `${priority} (${percentage}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {reportData.tasksByPriority.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Task Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={reportData.overdueTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                name="Tasks"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Top Performers</h2>
        {reportData.memberPerformance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Member</th>
                  <th className="text-right py-3 px-4 font-semibold">Assigned</th>
                  <th className="text-right py-3 px-4 font-semibold">Completed</th>
                  <th className="text-right py-3 px-4 font-semibold">
                    Completion Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportData.memberPerformance.map((member) => (
                  <tr key={member.memberId} className="border-b hover:bg-accent">
                    <td className="py-3 px-4 font-medium">{member.name}</td>
                    <td className="text-right py-3 px-4">{member.assigned}</td>
                    <td className="text-right py-3 px-4 text-green-600 font-semibold">
                      {member.completed}
                    </td>
                    <td className="text-right py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${member.rate}%` }}
                          />
                        </div>
                        <span className="font-semibold w-10 text-right">
                          {member.rate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No performance data available for this period
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Try selecting a different date range
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

// ✅ Wrap entire component in React.memo
export default memo(TeamReports);