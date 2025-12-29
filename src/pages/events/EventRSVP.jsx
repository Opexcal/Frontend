import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, CheckCircle2, XCircle, AlertCircle, Search,
  Users, Mail, Download, Calendar
} from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { eventsApi } from '@/api/eventsApi';
import { toast } from 'sonner';

const EventRSVP = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [rsvpFilter, setRsvpFilter] = useState("all");
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [stats, setStats] = useState({ total: 0, accepted: 0, declined: 0, pending: 0 });

  useEffect(() => {
    fetchRSVPData();
  }, [id]);

  const fetchRSVPData = async () => {
    setLoading(true);
    try {
      const response = await eventsApi.getRSVPManagement(id);
      
      console.log('📥 RSVP Response:', response.data);
      
      // ✅ Backend returns { success: true, data: { event, attendees, stats } }
      const responseData = response.data.data || response.data;
      
      const eventData = responseData.event;
      const attendeesData = (responseData.attendees || []).map(att => ({
        id: att.id,
        name: att.name,
        email: att.email,
        avatar: att.avatar,
        rsvp: att.status || 'pending',
        status: att.status || 'pending',
        respondedAt: att.respondedAt,
        attended: att.attended || false,
        checkedInAt: att.checkedInAt,
        notes: att.notes || ''
      }));
      
      setEvent(eventData);
      setAttendees(attendeesData);
      setStats(responseData.stats);
    } catch (error) {
      console.error('Failed to load RSVP data:', error);
      toast.error('Failed to load RSVP data');
      navigate('/calendar');
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch = attendee.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = rsvpFilter === "all" || attendee.rsvp === rsvpFilter;
    return matchesSearch && matchesFilter;
  });

  const handleRSVPChange = async (userId, newStatus) => {
    try {
      await eventsApi.updateAttendeeRSVP(id, userId, newStatus);
      toast.success('RSVP updated successfully');
      fetchRSVPData();
    } catch (error) {
      console.error('Failed to update RSVP:', error);
      toast.error('Failed to update RSVP');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await eventsApi.exportRSVPList(id);
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rsvp-list-${event?.title?.replace(/\s+/g, '-') || 'event'}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('RSVP list exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export RSVP list');
    } finally {
      setExporting(false);
    }
  };

  const getRSVPBadge = (status) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Accepted</Badge>;
      case "declined":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Declined</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading RSVP data...</div>;
  }

  if (!event) {
    return <div className="flex items-center justify-center h-screen">Event not found</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                RSVP Management
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Manage attendee responses and track event attendance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-display font-semibold text-foreground">
              RSVP Management
            </h1>
            <p className="text-muted-foreground mt-1">{event.title}</p>
            {event.startDate && (
              <p className="text-sm text-muted-foreground mt-1">
                {format(parseISO(event.startDate), "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </p>
            )}
          </div>
        </div>
<div className="flex items-center gap-2">
  <Button variant="outline">
    <Mail className="h-4 w-4 mr-2" />
    Email Attendees
  </Button>
  <Button variant="outline" onClick={handleExport} disabled={exporting}>
    <Download className="h-4 w-4 mr-2" />
    {exporting ? 'Exporting...' : 'Export List'}
  </Button>
  <Button variant="outline" asChild>
    <Link to={`/events/${id}`}>
      View Event
    </Link>
  </Button>
  {/* ✅ KEEP THIS ONE, REMOVE THE DUPLICATE */}
  <Button variant="outline" asChild>
    <Link to={`/events/${id}/checkin`}>
      <CheckCircle2 className="h-4 w-4 mr-2" />
      Check-in Management
    </Link>
  </Button>
</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invited</p>
                <p className="text-2xl font-semibold mt-1">{stats.total || 0}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accepted</p>
                <p className="text-2xl font-semibold mt-1 text-green-600">{stats.accepted || 0}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Declined</p>
                <p className="text-2xl font-semibold mt-1 text-red-600">{stats.declined || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-semibold mt-1 text-orange-600">{stats.pending || 0}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search attendees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={rsvpFilter} onValueChange={setRsvpFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by RSVP" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All RSVPs</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Attendees List */}
      <Card>
        <CardHeader>
          <CardTitle>Attendees</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="accepted">Accepted ({stats.accepted})</TabsTrigger>
              <TabsTrigger value="declined">Declined ({stats.declined})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <div className="space-y-3">
                {filteredAttendees.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No attendees found</p>
                  </div>
                ) : (
                  filteredAttendees.map(attendee => (
                    <div
                      key={attendee.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={attendee.avatar} />
                          <AvatarFallback>{attendee.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{attendee.name}</p>
                          <p className="text-xs text-muted-foreground">{attendee.email}</p>
                          {attendee.respondedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Responded: {format(parseISO(attendee.respondedAt), "MMM d, yyyy")}
                            </p>
                          )}
                          {attendee.notes && (
                            <p className="text-sm text-muted-foreground mt-1 italic">
                              "{attendee.notes}"
                            </p>
                          )}
                        </div>
                        {getRSVPBadge(attendee.rsvp)}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRSVPChange(attendee.id, "accepted")}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRSVPChange(attendee.id, "declined")}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="accepted" className="mt-4">
              <div className="space-y-3">
                {filteredAttendees.filter(a => a.rsvp === "accepted").map(attendee => (
                  <div
                    key={attendee.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={attendee.avatar} />
                        <AvatarFallback>{attendee.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{attendee.name}</p>
                        <p className="text-xs text-muted-foreground">{attendee.email}</p>
                      </div>
                    </div>
                    {getRSVPBadge(attendee.rsvp)}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="declined" className="mt-4">
              <div className="space-y-3">
                {filteredAttendees.filter(a => a.rsvp === "declined").map(attendee => (
                  <div
                    key={attendee.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={attendee.avatar} />
                        <AvatarFallback>{attendee.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{attendee.name}</p>
                        <p className="text-xs text-muted-foreground">{attendee.email}</p>
                        {attendee.notes && (
                          <p className="text-sm text-muted-foreground mt-1 italic">
                            "{attendee.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                    {getRSVPBadge(attendee.rsvp)}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="mt-4">
              <div className="space-y-3">
                {filteredAttendees.filter(a => a.rsvp === "pending").map(attendee => (
                  <div
                    key={attendee.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors border-orange-500/50"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={attendee.avatar} />
                        <AvatarFallback>{attendee.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{attendee.name}</p>
                        <p className="text-xs text-muted-foreground">{attendee.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRSVPBadge(attendee.rsvp)}
                      <Button
                        size="sm"
                        onClick={() => handleRSVPChange(attendee.id, "accepted")}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRSVPChange(attendee.id, "declined")}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventRSVP;