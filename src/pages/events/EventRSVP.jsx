import { useState } from "react";
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

// Mock data
const mockEvent = {
  id: 1,
  title: "Sprint Planning Meeting",
  start: "2025-12-23T10:00:00",
  end: "2025-12-23T12:00:00",
};

const mockAttendees = [
  {
    id: "2",
    name: "Mike Chen",
    avatar: "",
    email: "mike@example.com",
    rsvp: "accepted",
    respondedAt: "2025-12-21T09:00:00",
    notes: "Will arrive 5 minutes early"
  },
  {
    id: "3",
    name: "Alex Rivera",
    avatar: "",
    email: "alex@example.com",
    rsvp: "accepted",
    respondedAt: "2025-12-21T10:15:00",
  },
  {
    id: "4",
    name: "Emma Wilson",
    avatar: "",
    email: "emma@example.com",
    rsvp: "pending",
  },
  {
    id: "5",
    name: "David Kim",
    avatar: "",
    email: "david@example.com",
    rsvp: "declined",
    respondedAt: "2025-12-21T14:30:00",
    notes: "Out of office that day"
  },
  {
    id: "6",
    name: "Lisa Park",
    avatar: "",
    email: "lisa@example.com",
    rsvp: "pending",
  },
];

const EventRSVP = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [rsvpFilter, setRsvpFilter] = useState("all");
  const [attendees, setAttendees] = useState(mockAttendees);

  const handleRSVPChange = (attendeeId, newStatus) => {
    setAttendees(prev =>
      prev.map(attendee =>
        attendee.id === attendeeId
          ? { ...attendee, rsvp: newStatus, respondedAt: new Date().toISOString() }
          : attendee
      )
    );
    // API call here
  };

  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch = attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = rsvpFilter === "all" || attendee.rsvp === rsvpFilter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: attendees.length,
    accepted: attendees.filter(a => a.rsvp === "accepted").length,
    declined: attendees.filter(a => a.rsvp === "declined").length,
    pending: attendees.filter(a => a.rsvp === "pending").length,
  };

  const getRSVPBadge = (rsvp) => {
    switch (rsvp) {
      case "accepted":
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Accepted</Badge>;
      case "declined":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Declined</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-display font-semibold text-foreground">
              RSVP Management
            </h1>
            <p className="text-muted-foreground mt-1">{mockEvent.title}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {format(parseISO(mockEvent.start), "EEEE, MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Email Attendees
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export List
          </Button>
          <Button variant="outline" asChild>
            <Link to={`/events/${id}`}>
              View Event
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
                <p className="text-2xl font-semibold mt-1">{stats.total}</p>
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
                <p className="text-2xl font-semibold mt-1 text-green-600">{stats.accepted}</p>
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
                <p className="text-2xl font-semibold mt-1 text-red-600">{stats.declined}</p>
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
                <p className="text-2xl font-semibold mt-1 text-orange-600">{stats.pending}</p>
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
                {filteredAttendees.map(attendee => (
                  <div
                    key={attendee.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={attendee.avatar} />
                        <AvatarFallback>{attendee.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{attendee.name}</p>
                        <p className="text-xs text-muted-foreground">{attendee.email}</p>
                        {attendee.respondedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Responded: {format(parseISO(attendee.respondedAt), "MMM d, yyyy 'at' h:mm a")}
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
                ))}
              </div>
            </TabsContent>

            <TabsContent value="accepted" className="mt-4">
              <div className="space-y-3">
                {filteredAttendees
                  .filter(a => a.rsvp === "accepted")
                  .map(attendee => (
                    <div
                      key={attendee.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={attendee.avatar} />
                          <AvatarFallback>{attendee.name[0]}</AvatarFallback>
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
                {filteredAttendees
                  .filter(a => a.rsvp === "declined")
                  .map(attendee => (
                    <div
                      key={attendee.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={attendee.avatar} />
                          <AvatarFallback>{attendee.name[0]}</AvatarFallback>
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
                {filteredAttendees
                  .filter(a => a.rsvp === "pending")
                  .map(attendee => (
                    <div
                      key={attendee.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors border-orange-500/50"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={attendee.avatar} />
                          <AvatarFallback>{attendee.name[0]}</AvatarFallback>
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

