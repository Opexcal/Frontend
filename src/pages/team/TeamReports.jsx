import { useEffect, useState } from "react";
import { Download, BarChart3 } from "lucide-react";
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
import { mockReportData } from "@/lib/mockTeamData";

/**
 * TeamReports - Analytics and performance metrics
 */
const TeamReports = () => {
  const [dateRange, setDateRange] = useState("30days");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setReportData(mockReportData);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    console.log("Exporting report...");
    // TODO: Call API to export CSV
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load reports</p>
        </div>
      </div>
    );
  }

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Reports</h1>
          <p className="text-muted-foreground mt-1">
            Analytics and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Task Completion Rate */}
      <Card className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Task Completion Rate</h2>
            <Badge className="text-lg px-3 py-1 bg-green-100 text-green-700">
              {reportData.completionRate}%
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Tasks completed vs total tasks over time
          </p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reportData.tasksByStatus}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Priority */}
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
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Overdue Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Overdue Tasks Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={reportData.overdueTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Team Member Performance */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Team Member Performance</h2>
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
                          className="bg-green-600 h-2 rounded-full"
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
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Tasks</p>
          <p className="text-2xl font-bold">
            {reportData.tasksByStatus.reduce((sum, item) => sum + item.count, 0)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {reportData.tasksByStatus.find((item) => item.status === "Completed")
              ?.count || 0}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">
            {reportData.tasksByStatus.find((item) => item.status === "In Progress")
              ?.count || 0}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Average Rate</p>
          <p className="text-2xl font-bold">
            {Math.round(
              reportData.memberPerformance.reduce((sum, m) => sum + m.rate, 0) /
                reportData.memberPerformance.length
            )}
            %
          </p>
        </Card>
      </div>
    </div>
  );
};

export default TeamReports;
