import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight,
  ArrowRight, Users, Download,
  ChevronRight as BreadcrumbIcon, CheckCircle2, XCircle, Clock
} from "lucide-react";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameDay, isToday, isSameMonth,
  addMonths, subMonths, parseISO, addDays
} from "date-fns";
import { useAuth } from "../../context/AuthContext";

// Mock data
const groupMembers = [
  { id: "1", name: "Sarah Johnson", avatar: "", color: "blue", role: "Lead" },
  { id: "2", name: "Mike Chen", avatar: "", color: "green", role: "Member" },
  { id: "3", name: "Alex Rivera", avatar: "", color: "purple", role: "Member" },
  { id: "4", name: "Emma Wilson", avatar: "", color: "orange", role: "Member" },
];

const mockData = {
  group: {
    id: "1",
    name: "Engineering Team",
    memberCount: 24,
    description: "Engineering and development team responsible for product development",
    lead: { id: "1", name: "Sarah Johnson", avatar: "", email: "sarah@example.com" },
    members: groupMembers
  },
  events: [
    {
      id: "1",
      title: "Sprint Planning",
      start: "2025-12-22T09:00:00",
      end: "2025-12-22T10:30:00",
      organizer: { id: "1", name: "Sarah Johnson", avatar: "" },
      attendees: [
        { id: "1", name: "Sarah Johnson", avatar: "", rsvp: "accepted" },
        { id: "2", name: "Mike Chen", avatar: "", rsvp: "accepted" },
        { id: "3", name: "Alex Rivera", avatar: "", rsvp: "pending" },
      ],
      location: "Conference Room A",
      isGroupEvent: true,
      type: "meeting",
      color: "blue"
    },
    {
      id: "2",
      title: "Code Review Session",
      start: "2025-12-23T14:00:00",
      end: "2025-12-23T15:00:00",
      organizer: { id: "2", name: "Mike Chen", avatar: "" },
      attendees: [
        { id: "1", name: "Sarah Johnson", avatar: "", rsvp: "accepted" },
        { id: "2", name: "Mike Chen", avatar: "", rsvp: "accepted" },
      ],
      isGroupEvent: true,
      type: "meeting",
      color: "green"
    },
    {
      id: "3",
      title: "Sprint Retrospective",
      start: "2025-12-28T10:00:00",
      end: "2025-12-28T11:30:00",
      organizer: { id: "1", name: "Sarah Johnson", avatar: "" },
      attendees: groupMembers.map(m => ({ ...m, rsvp: "pending" })),
      isGroupEvent: true,
      type: "meeting",
      color: "blue"
    },
  ],
  stats: {
    totalEventsThisMonth: 18,
    upcomingDeadlines: 3
  }
};

const GroupCalendar = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [selectedMembers, setSelectedMembers] = useState(
    mockData.group.members.map(m => m.id)
  );
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin" || user?.role === "manager" ||
    mockData.group.lead.id === user?.id;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const daysInMonth = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const eventsForDate = (date) => {
    return mockData.events.filter(event => {
      const eventDate = parseISO(event.start);
      return isSameDay(eventDate, date);
    });
  };

  const getMemberColor = (memberId) => {
    const member = mockData.group.members.find(m => m.id === memberId);
    return member?.color || "blue";
  };

  const getEventColor = (color) => {
    const colors = {
      green: "bg-green-500",
      blue: "bg-blue-500",
      purple: "bg-purple-500",
      red: "bg-red-500",
      orange: "bg-orange-500"
    };
    return colors[color] || "bg-primary";
  };

  const handleMemberToggle = (memberId) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    setSelectedMembers(mockData.group.members.map(m => m.id));
  };

  const handleDeselectAll = () => {
    setSelectedMembers([]);
  };

  const filteredEvents = mockData.events.filter(event => {
    if (!selectedMembers.length) return false;
    // Filter by selected members (simplified - in real app, check event organizer/attendees)
    return true;
  });

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDayClick = (date) => {
    navigate("/calendar/day", { state: { date: date.toISOString(), groupId: id } });
  };

  const getRSVPBadge = (rsvp) => {
    switch (rsvp) {
      case "accepted":
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Accepted</Badge>;
      case "declined":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Declined</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link to="/calendar" className="hover:text-foreground">Calendars</Link>
          <BreadcrumbIcon className="h-4 w-4" />
          <span className="text-foreground">{mockData.group.name}</span>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-semibold text-foreground flex items-center gap-2">
                {mockData.group.name}
                <Badge variant="outline">{mockData.group.memberCount} members</Badge>
              </h1>
              <p className="text-muted-foreground mt-1">{mockData.group.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Members" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
              </SelectContent>
            </Select>
            <Tabs value={view} onValueChange={setView}>
              <TabsList>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="agenda">Agenda</TabsTrigger>
              </TabsList>
            </Tabs>
            {isAdmin && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Group Event
              </Button>
            )}
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Calendar
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6">
        {/* Main Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                {format(currentDate, "MMMM yyyy")}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {view === "month" && (
              <div className="space-y-2">
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {daysInMonth.map(day => {
                    const dayEvents = eventsForDate(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isTodayDate = isToday(day);

                    return (
                      <div
                        key={day.toISOString()}
                        onClick={() => handleDayClick(day)}
                        className={`
                          min-h-[80px] p-2 border rounded-lg cursor-pointer transition-colors
                          ${isCurrentMonth ? "bg-background" : "bg-muted/30 opacity-50"}
                          ${isTodayDate ? "border-primary border-2" : "border-border"}
                          hover:bg-accent/50
                        `}
                      >
                        <div className={`text-sm font-medium mb-1 ${isTodayDate ? "text-primary" : ""}`}>
                          {format(day, "d")}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map(event => (
                            <div
                              key={event.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(event);
                              }}
                              className={`text-xs p-1 rounded ${getEventColor(event.color)} text-white truncate cursor-pointer hover:opacity-80`}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {view === "week" && (
              <div className="space-y-2">
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const weekStart = startOfWeek(currentDate);
                    const day = addDays(weekStart, i);
                    const dayEvents = eventsForDate(day);

                    return (
                      <div
                        key={i}
                        className="border rounded-lg p-2 min-h-[400px]"
                      >
                        <div className={`text-sm font-medium mb-2 ${isToday(day) ? "text-primary" : ""}`}>
                          {format(day, "EEE d")}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.map(event => (
                            <div
                              key={event.id}
                              onClick={() => setSelectedEvent(event)}
                              className={`text-xs p-2 rounded ${getEventColor(event.color)} text-white cursor-pointer hover:opacity-80`}
                            >
                              <div className="font-medium">{event.title}</div>
                              <div className="text-xs opacity-90">
                                {format(parseISO(event.start), "h:mm a")}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {view === "day" && (
              <div>
                <Button
                  variant="outline"
                  onClick={() => navigate("/calendar/day", { state: { date: currentDate.toISOString(), groupId: id } })}
                >
                  View Full Day Timeline
                </Button>
              </div>
            )}

            {view === "agenda" && (
              <div className="space-y-4">
                {filteredEvents.map(event => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div className={`h-12 w-12 rounded-lg ${getEventColor(event.color)} flex items-center justify-center flex-shrink-0`}>
                      <CalendarIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(event.start), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                      </p>
                      {event.location && (
                        <p className="text-xs text-muted-foreground mt-1">📍 {event.location}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Details Panel */}
          {selectedEvent && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Event Details</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEvent(null)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(parseISO(selectedEvent.start), "EEEE, MMMM d, yyyy 'at' h:mm a")} -{" "}
                    {format(parseISO(selectedEvent.end), "h:mm a")}
                  </p>
                </div>

                {selectedEvent.location && (
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{selectedEvent.location}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium mb-2">Organizer</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedEvent.organizer.avatar} />
                      <AvatarFallback>{selectedEvent.organizer.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{selectedEvent.organizer.name}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Attendees</p>
                  <div className="space-y-2">
                    {selectedEvent.attendees.map(attendee => (
                      <div key={attendee.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={attendee.avatar} />
                            <AvatarFallback>{attendee.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{attendee.name}</span>
                        </div>
                        {getRSVPBadge(attendee.rsvp)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button size="sm" className="flex-1">RSVP</Button>
                  {isAdmin && (
                    <>
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="destructive">Delete</Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Group Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Group Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{mockData.group.description}</p>
              <div>
                <p className="text-sm font-medium mb-2">Team Lead</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={mockData.group.lead.avatar} />
                    <AvatarFallback>{mockData.group.lead.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{mockData.group.lead.name}</p>
                    <p className="text-xs text-muted-foreground">{mockData.group.lead.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Members List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Members</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={handleSelectAll}>All</Button>
                  <Button variant="ghost" size="sm" onClick={handleDeselectAll}>None</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockData.group.members.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Checkbox
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={() => handleMemberToggle(member.id)}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        member.color === "blue" ? "#3b82f6" :
                        member.color === "green" ? "#10b981" :
                        member.color === "purple" ? "#a855f7" :
                        member.color === "orange" ? "#f97316" :
                        "#6b7280"
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Group Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Events This Month</p>
                <p className="text-2xl font-semibold">{mockData.stats.totalEventsThisMonth}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Deadlines</p>
                <p className="text-2xl font-semibold">{mockData.stats.upcomingDeadlines}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GroupCalendar;