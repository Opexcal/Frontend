import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  Download, TrendingUp, Users, Award, Target
} from "lucide-react";
import { analyticsApi } from '@/api';
import { toast } from 'sonner';

// Mock data
const mockData = {
  topPerformers: [
    { id: "1", name: "Sarah Johnson", completionRate: 95, tasksCompleted: 48, score: 92, avatar: "" },
    { id: "2", name: "Mike Chen", completionRate: 89, tasksCompleted: 42, score: 88, avatar: "" },
    { id: "3", name: "Alex Rivera", completionRate: 87, tasksCompleted: 40, score: 85, avatar: "" },
    { id: "4", name: "Emma Wilson", completionRate: 84, tasksCompleted: 38, score: 82, avatar: "" },
    { id: "5", name: "David Kim", completionRate: 81, tasksCompleted: 35, score: 79, avatar: "" },
  ],
  teamMetrics: [
    { month: "Aug", productivity: 75, engagement: 78, satisfaction: 82 },
    { month: "Sep", productivity: 78, engagement: 80, satisfaction: 84 },
    { month: "Oct", productivity: 82, engagement: 83, satisfaction: 86 },
    { month: "Nov", productivity: 85, engagement: 85, satisfaction: 88 },
    { month: "Dec", productivity: 87, engagement: 87, satisfaction: 89 },
  ],
  productivityByDepartment: [
    { department: "Engineering", score: 92, members: 24 },
    { department: "Product", score: 88, members: 12 },
    { department: "Marketing", score: 85, members: 18 },
    { department: "Sales", score: 78, members: 22 },
  ],
  overallStats: {
    averageCompletionRate: 87,
    totalTasksCompleted: 203,
    teamEngagement: 87,
    satisfactionScore: 89,
  }
};

const TeamProductivity = () => {
    const [dateRange, setDateRange] = useState("quarter");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Fetch data
  useEffect(() => {
  const fetchProductivityData = async () => {
    setLoading(true);
    try {
      const [
        productivity,
        topPerformers,
        metricsTrend,
        departmentPerf
      ] = await Promise.all([
        analyticsApi.getTeamProductivity(dateRange, departmentFilter),
        analyticsApi.getTopPerformers(5),
        analyticsApi.getTeamMetricsTrend(dateRange),
        analyticsApi.getProductivityByDepartment()
      ]);

      console.log('🎯 Top Performers Response:', topPerformers); // ✅ Add this

      setData({
        overallStats: productivity.data.overallStats,
        topPerformers: topPerformers.data,
        teamMetrics: metricsTrend.data,
        productivityByDepartment: departmentPerf.data
      });
    } catch (error) {
      console.error('Error fetching team productivity:', error);
      toast.error("Failed to load productivity data");
    } finally {
      setLoading(false);
    }
  };

  fetchProductivityData();
}, [dateRange, departmentFilter]);

  // Handle export
  const handleExport = async () => {
    try {
      toast.info("Exporting...", {
        description: "Preparing your productivity report.",
      });
      
      const response = await analyticsApi.exportTeamProductivityReport(dateRange, departmentFilter);
      
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `team-productivity-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Export Successful");
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error("Export Failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!data) return null;

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score) => {
    if (score >= 90) return "bg-green-500/10";
    if (score >= 80) return "bg-blue-500/10";
    if (score >= 70) return "bg-yellow-500/10";
    return "bg-red-500/10";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-semibold text-foreground">Team Productivity</h1>
          <p className="text-muted-foreground mt-1">Team performance metrics and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Completion Rate</p>
                <p className="text-2xl font-semibold mt-1">{data.overallStats.averageCompletionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
                <p className="text-2xl font-semibold mt-1">{data.overallStats.totalTasksCompleted}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Engagement</p>
                <p className="text-2xl font-semibold mt-1">{data.overallStats.teamEngagement}%</p>
              </div>
              <Users className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Satisfaction Score</p>
                <p className="text-2xl font-semibold mt-1">{data.overallStats.satisfactionScore}</p>
              </div>
              <Award className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topPerformers.map((performer, index) => (
              <div
                key={performer.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className={`h-10 w-10 rounded-full ${getScoreBg(performer.score)} flex items-center justify-center flex-shrink-0`}>
                  <span className={`text-sm font-semibold ${getScoreColor(performer.score)}`}>
                    #{index + 1}
                  </span>
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={performer.avatar} />
                  <AvatarFallback>{performer.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{performer.name}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>{performer.completionRate}% completion</span>
                    <span>{performer.tasksCompleted} tasks</span>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded ${getScoreBg(performer.score)}`}>
                  <span className={`text-lg font-semibold ${getScoreColor(performer.score)}`}>
                    {performer.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Metrics Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Team Metrics Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={data.teamMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="productivity" stroke="#3b82f6" strokeWidth={2} name="Productivity" />
                <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={2} name="Engagement" />
                <Line type="monotone" dataKey="satisfaction" stroke="#f59e0b" strokeWidth={2} name="Satisfaction" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Productivity by Department */}
        <Card>
          <CardHeader>
            <CardTitle>Productivity by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.productivityByDepartment}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {data.productivityByDepartment.map(dept => (
                <div key={dept.department} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{dept.department}</span>
                    <Badge variant="outline">{dept.members} members</Badge>
                  </div>
                  <Badge className={getScoreBg(dept.score)}>
                    <span className={getScoreColor(dept.score)}>Score: {dept.score}</span>
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamProductivity;

