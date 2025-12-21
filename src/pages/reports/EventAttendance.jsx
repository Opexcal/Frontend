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
  Download, Calendar, Users, CheckCircle2, XCircle, AlertCircle
} from "lucide-react";
import { format, parseISO } from "date-fns";

// Mock data
const mockData = {
  overallStats: {
    totalEvents: 45,
    averageAttendance: 85,
    totalAttendees: 382,
    averageRSVP: 78,
  },
  attendanceByEvent: [
    { name: "Team Standup", invited: 24, attended: 22, rate: 92 },
    { name: "Sprint Planning", invited: 24, attended: 20, rate: 83 },
    { name: "All-Hands", invited: 142, attended: 128, rate: 90 },
    { name: "Training Session", invited: 30, attended: 25, rate: 83 },
    { name: "Quarterly Review", invited: 50, attended: 45, rate: 90 },
  ],
  rsvpDistribution: [
    { name: "Accepted", value: 298, color: "#10b981" },
    { name: "Declined", value: 52, color: "#ef4444" },
    { name: "Pending", value: 32, color: "#f59e0b" },
  ],
  attendanceTrend: [
    { month: "Aug", attendance: 82, events: 8 },
    { month: "Sep", attendance: 84, events: 10 },
    { month: "Oct", attendance: 85, events: 9 },
    { month: "Nov", attendance: 86, events: 12 },
    { month: "Dec", attendance: 87, events: 6 },
  ],
  topEvents: [
    { id: 1, title: "All-Hands Meeting", date: "2025-12-15", attendance: 128, invited: 142, rate: 90 },
    { id: 2, title: "Quarterly Review", date: "2025-11-30", attendance: 45, invited: 50, rate: 90 },
    { id: 3, title: "Team Standup", date: "2025-12-22", attendance: 22, invited: 24, rate: 92 },
  ],
};

const EventAttendance = () => {
  const [dateRange, setDateRange] = useState("quarter");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");

  const COLORS = ["#10b981", "#ef4444", "#f59e0b"];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-semibold text-foreground">Event Attendance</h1>
          <p className="text-muted-foreground mt-1">RSVP and attendance tracking analytics</p>
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
          <Button>
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
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-semibold mt-1">{mockData.overallStats.totalEvents}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Attendance</p>
                <p className="text-2xl font-semibold mt-1">{mockData.overallStats.averageAttendance}%</p>
              </div>
              <Users className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Attendees</p>
                <p className="text-2xl font-semibold mt-1">{mockData.overallStats.totalAttendees}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. RSVP Rate</p>
                <p className="text-2xl font-semibold mt-1">{mockData.overallStats.averageRSVP}%</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RSVP Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>RSVP Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockData.rsvpDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mockData.rsvpDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {mockData.rsvpDistribution.map(item => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <Badge variant="outline">{item.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Attendance by Event */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance by Event</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockData.attendanceByEvent}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="invited" fill="#e5e7eb" name="Invited" />
                <Bar dataKey="attended" fill="#10b981" name="Attended" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={mockData.attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="attendance"
                stroke="#10b981"
                strokeWidth={2}
                name="Attendance %"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="events"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Number of Events"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Events */}
      <Card>
        <CardHeader>
          <CardTitle>Top Events by Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockData.topEvents.map((event, index) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(parseISO(event.date), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{event.attendance} / {event.invited}</p>
                    <p className="text-xs text-muted-foreground">attendees</p>
                  </div>
                  <Badge className={event.rate >= 90 ? "bg-green-500" : "bg-blue-500"}>
                    {event.rate}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventAttendance;

