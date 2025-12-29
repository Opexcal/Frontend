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
  Download, Calendar, Users, CheckCircle2, AlertCircle, Loader2
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { analyticsApi } from "@/api/analyticsApi";
import { toast } from "sonner";

const EventAttendance = () => {
  const [dateRange, setDateRange] = useState("quarter");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  // State for all data
  const [overallStats, setOverallStats] = useState(null);
  const [rsvpDistribution, setRsvpDistribution] = useState([]);
  const [attendanceByEvent, setAttendanceByEvent] = useState([]);
  const [attendanceTrend, setAttendanceTrend] = useState([]);
  const [topEvents, setTopEvents] = useState([]);

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

const fetchAllData = async () => {
  setLoading(true);
  try {
    let overall, rsvp, byEvent, trend, top;
    
    try {
      overall = await analyticsApi.getEventAttendanceOverall(dateRange);
      console.log('✅ Overall stats:', overall.data);
    } catch (err) {
      console.error('❌ Overall stats failed:', err.response?.data || err.message);
      overall = { data: { overallStats: { totalEvents: 0, averageAttendance: 0, totalAttendees: 0, averageRSVP: 0 } } };
    }

    try {
      rsvp = await analyticsApi.getEventRSVPDistribution(dateRange);
      console.log('✅ RSVP distribution:', rsvp.data);
    } catch (err) {
      console.error('❌ RSVP distribution failed:', err.response?.data || err.message);
      rsvp = { data: [] };
    }

    try {
      byEvent = await analyticsApi.getAttendanceByEvent(dateRange, 5);
      console.log('✅ Attendance by event:', byEvent.data);
       console.log('✅ Attendance by event RAW:', JSON.stringify(byEvent.data, null, 2)); // ✅ ADD THIS
    } catch (err) {
      console.error('❌ Attendance by event failed:', err.response?.data || err.message);
      byEvent = { data: [] };
    }

    try {
      trend = await analyticsApi.getAttendanceTrend(dateRange);
      console.log('✅ Attendance trend:', trend.data);
    } catch (err) {
      console.error('❌ Attendance trend failed:', err.response?.data || err.message);
      trend = { data: [] };
    }

    try {
      top = await analyticsApi.getTopEventsByAttendance(dateRange, 3);
      console.log('✅ Top events:', top.data);
    } catch (err) {
      console.error('❌ Top events failed:', err.response?.data || err.message);
      top = { data: [] };
    }

    // ✅ FIX: Backend returns response.data directly (not response.data.data)
    // Based on your console logs showing the arrays directly
    // ✅ FIX: Map backend response to chart format
const mappedByEvent = Array.isArray(byEvent.data) 
  ? byEvent.data.map(event => ({
      name: event.eventTitle || event.name || event.title || 'Unknown Event',
      invited: event.totalInvited || event.invited || 0,
      attended: event.totalAttended || event.attended || 0
    }))
  : [];

setOverallStats(overall.data?.overallStats || overall.data || { totalEvents: 0, averageAttendance: 0, totalAttendees: 0, averageRSVP: 0 });
setRsvpDistribution(Array.isArray(rsvp.data) ? rsvp.data : rsvp.data?.data || []);
setAttendanceByEvent(mappedByEvent); // ✅ Use mapped data
setAttendanceTrend(Array.isArray(trend.data) ? trend.data : trend.data?.data || []);
setTopEvents(Array.isArray(top.data) ? top.data : top.data?.data || []);
    setOverallStats(overall.data?.overallStats || overall.data || { totalEvents: 0, averageAttendance: 0, totalAttendees: 0, averageRSVP: 0 });
    setRsvpDistribution(Array.isArray(rsvp.data) ? rsvp.data : rsvp.data?.data || []);
    setAttendanceByEvent(Array.isArray(byEvent.data) ? byEvent.data : byEvent.data?.data || []);
    setAttendanceTrend(Array.isArray(trend.data) ? trend.data : trend.data?.data || []);
    setTopEvents(Array.isArray(top.data) ? top.data : top.data?.data || []);
    
    // ✅ Add debug logs to verify
    console.log('📊 Final state:', {
      overallStats: overall.data,
      rsvpDistribution: rsvp.data,
      attendanceByEvent: byEvent.data,
      attendanceTrend: trend.data,
      topEvents: top.data
    });

  } catch (error) {
    console.error('Failed to fetch event attendance data:', error);
    toast.error(error.message || 'Failed to load event attendance data');
    
    setOverallStats({ totalEvents: 0, averageAttendance: 0, totalAttendees: 0, averageRSVP: 0 });
    setRsvpDistribution([]);
    setAttendanceByEvent([]);
    setAttendanceTrend([]);
    setTopEvents([]);
  } finally {
    setLoading(false);
  }
};

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await analyticsApi.exportEventAttendanceReport(dateRange);
      
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `event-attendance-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export Report
          </Button>
        </div>
      </div>

      {/* Overall Stats */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-semibold mt-1">{overallStats.totalEvents}</p>
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
                  <p className="text-2xl font-semibold mt-1">{overallStats.averageAttendance}%</p>
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
                  <p className="text-2xl font-semibold mt-1">{overallStats.totalAttendees}</p>
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
                  <p className="text-2xl font-semibold mt-1">{overallStats.averageRSVP}%</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       {/* RSVP Distribution */}
<Card>
  <CardHeader>
    <CardTitle>RSVP Distribution</CardTitle>
  </CardHeader>
  <CardContent>
    {rsvpDistribution.length > 0 ? (
      <>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={rsvpDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {rsvpDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {rsvpDistribution.map(item => (
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
        <p>No RSVP data available for this period</p>
      </div>
    )}
  </CardContent>
</Card>
        {/* Attendance by Event */}
<Card>
  <CardHeader>
    <CardTitle>Attendance by Event</CardTitle>
  </CardHeader>
  <CardContent>
    {attendanceByEvent.length > 0 ? (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={attendanceByEvent}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="invited" fill="#e5e7eb" name="Invited" className='mt-5' />
          <Bar dataKey="attended" fill="#10b981" name="Attended" />
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground ">
        <p>No event attendance data available for this period</p>
      </div>
    )}
  </CardContent>
</Card>
      </div>

     {/* Attendance Trend */}
<Card>
  <CardHeader>
    <CardTitle>Attendance Trend</CardTitle>
  </CardHeader>
  <CardContent>
    {attendanceTrend.length > 0 ? (
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={attendanceTrend}>
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
    ) : (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        <p>No attendance trend data available for this period</p>
      </div>
    )}
  </CardContent>
</Card>

      {/* Top Events */}
<Card>
  <CardHeader>
    <CardTitle>Top Events by Attendance</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {topEvents.length > 0 ? (
        topEvents.map((event, index) => {
          // ✅ Safe date parsing
          let formattedDate = 'Date unavailable';
          try {
            if (event.date) {
              const dateObj = typeof event.date === 'string' ? parseISO(event.date) : new Date(event.date);
              formattedDate = format(dateObj, "MMMM d, yyyy");
            }
          } catch (err) {
            console.error('Date parse error:', err);
          }

          return (
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
                    {formattedDate}
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
          );
        })
      ) : (
        <p className="text-center text-muted-foreground py-8">No events found for this period</p>
      )}
    </div>
  </CardContent>
</Card>
    </div>
  );
};

export default EventAttendance;