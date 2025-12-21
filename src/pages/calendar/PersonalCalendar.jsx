import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight,
  ArrowRight, Filter
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, 
  startOfWeek, endOfWeek, isSameDay, isToday, isSameMonth,
  addMonths, subMonths, parseISO, getDay, addDays
} from "date-fns";

// Mock data
const mockData = {
  events: [
    {
      id: "1",
      title: "Morning Workout",
      start: "2025-12-22T07:00:00",
      end: "2025-12-22T08:00:00",
      type: "personal",
      color: "green",
      isPersonal: true
    },
    {
      id: "2",
      title: "Doctor Appointment",
      start: "2025-12-23T14:00:00",
      end: "2025-12-23T15:00:00",
      type: "appointment",
      color: "blue",
      isPersonal: true
    },
    {
      id: "3",
      title: "Personal Project Review",
      start: "2025-12-24T10:00:00",
      end: "2025-12-24T11:30:00",
      type: "work",
      color: "purple",
      isPersonal: true
    },
    {
      id: "4",
      title: "Holiday - Christmas",
      start: "2025-12-25T00:00:00",
      end: "2025-12-25T23:59:59",
      type: "holiday",
      color: "red",
      isPersonal: true,
      isAllDay: true
    },
  ],
  stats: {
    thisWeek: 3,
    thisMonth: 8,
    nextEvent: {
      id: "2",
      title: "Doctor Appointment",
      date: "2025-12-23",
      time: "2:00 PM"
    }
  }
};

const PersonalCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [selectedTypes, setSelectedTypes] = useState({
    meetings: true,
    deadlines: true,
    personal: true,
    holidays: true
  });
  const navigate = useNavigate();

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

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDayClick = (date) => {
    navigate("/calendar/day", { state: { date: date.toISOString() } });
  };

  const filteredEvents = mockData.events.filter(event => {
    if (event.type === "meeting" && !selectedTypes.meetings) return false;
    if (event.type === "deadline" && !selectedTypes.deadlines) return false;
    if (event.type === "personal" && !selectedTypes.personal) return false;
    if (event.type === "holiday" && !selectedTypes.holidays) return false;
    return true;
  });

  const upcomingEvents = filteredEvents
    .filter(event => parseISO(event.start) >= new Date())
    .sort((a, b) => parseISO(a.start) - parseISO(b.start))
    .slice(0, 5);

  const eventsByDate = filteredEvents.reduce((acc, event) => {
    const date = format(parseISO(event.start), "yyyy-MM-dd");
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  // Agenda view grouping
  const getAgendaGroups = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = addDays(today, 1);
    const weekEnd = addDays(today, 7);

    const groups = {
      today: { label: "Today", events: [] },
      tomorrow: { label: "Tomorrow", events: [] },
      thisWeek: { label: "This Week", events: [] },
      later: { label: "Later", events: [] }
    };

    filteredEvents.forEach(event => {
      const eventDate = parseISO(event.start);
      if (isSameDay(eventDate, today)) {
        groups.today.events.push(event);
      } else if (isSameDay(eventDate, tomorrow)) {
        groups.tomorrow.events.push(event);
      } else if (eventDate < weekEnd) {
        groups.thisWeek.events.push(event);
      } else {
        groups.later.events.push(event);
      }
    });

    return Object.values(groups).filter(group => group.events.length > 0);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold text-foreground">
            My Personal Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal events and schedule
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={setView}>
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button asChild>
            <Link to="/events/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Link>
          </Button>
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
                              className={`text-xs p-1 rounded ${getEventColor(event.color)} text-white truncate`}
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
                              className={`text-xs p-2 rounded ${getEventColor(event.color)} text-white`}
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
                  onClick={() => navigate("/calendar/day", { state: { date: currentDate.toISOString() } })}
                >
                  View Full Day Timeline
                </Button>
              </div>
            )}

            {view === "agenda" && (
              <div className="space-y-6">
                {getAgendaGroups().map(group => (
                  <div key={group.label}>
                    <h3 className="font-semibold text-lg mb-3">{group.label}</h3>
                    <div className="space-y-2">
                      {group.events.map(event => (
                        <div
                          key={event.id}
                          className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                        >
                          <div className={`h-12 w-12 rounded-lg ${getEventColor(event.color)} flex items-center justify-center flex-shrink-0`}>
                            <CalendarIcon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(event.start), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Mini Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="grid grid-cols-7 gap-1 text-xs mb-2">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <div key={i} className="p-1 font-medium text-muted-foreground">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {daysInMonth.slice(0, 35).map(day => {
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isTodayDate = isToday(day);
                    const hasEvents = eventsForDate(day).length > 0;

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setCurrentDate(day)}
                        className={`
                          aspect-square p-1 text-xs rounded
                          ${isCurrentMonth ? "hover:bg-accent" : "opacity-30"}
                          ${isTodayDate ? "bg-primary text-primary-foreground font-semibold" : ""}
                        `}
                      >
                        <div className="relative">
                          {format(day, "d")}
                          {hasEvents && (
                            <span className="absolute -top-1 -right-1 h-1.5 w-1.5 bg-primary rounded-full" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Type Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Event Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="meetings"
                  checked={selectedTypes.meetings}
                  onCheckedChange={(checked) =>
                    setSelectedTypes({ ...selectedTypes, meetings: checked })
                  }
                />
                <label htmlFor="meetings" className="text-sm cursor-pointer">
                  Meetings
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="deadlines"
                  checked={selectedTypes.deadlines}
                  onCheckedChange={(checked) =>
                    setSelectedTypes({ ...selectedTypes, deadlines: checked })
                  }
                />
                <label htmlFor="deadlines" className="text-sm cursor-pointer">
                  Deadlines
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="personal"
                  checked={selectedTypes.personal}
                  onCheckedChange={(checked) =>
                    setSelectedTypes({ ...selectedTypes, personal: checked })
                  }
                />
                <label htmlFor="personal" className="text-sm cursor-pointer">
                  Personal
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="holidays"
                  checked={selectedTypes.holidays}
                  onCheckedChange={(checked) =>
                    setSelectedTypes({ ...selectedTypes, holidays: checked })
                  }
                />
                <label htmlFor="holidays" className="text-sm cursor-pointer">
                  Holidays
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming events
                  </p>
                ) : (
                  upcomingEvents.map(event => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-2 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className={`h-8 w-8 rounded ${getEventColor(event.color)} flex items-center justify-center flex-shrink-0`}>
                        <CalendarIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(event.start), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-semibold">{mockData.stats.thisWeek}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-semibold">{mockData.stats.thisMonth}</p>
              </div>
              {mockData.stats.nextEvent && (
                <div>
                  <p className="text-sm text-muted-foreground">Next Event</p>
                  <p className="text-sm font-medium">{mockData.stats.nextEvent.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {mockData.stats.nextEvent.date} at {mockData.stats.nextEvent.time}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PersonalCalendar;