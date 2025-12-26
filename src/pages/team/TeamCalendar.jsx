import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  isSameDay,
} from "date-fns";
import { teamApi } from '@/api/teamApi'
import { toast } from "sonner";


const TeamCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 20));
  const [viewMode, setViewMode] = useState("month");
  const [selectedMember, setSelectedMember] = useState("all");
  const [eventTypeFilter, setEventTypeFilter] = useState("both");
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);

  const logApiError = (context, error) => {
  console.error(`[API Error - ${context}]`, {
    message: error?.message,
    status: error?.response?.status,
    statusText: error?.response?.statusText,
    data: error?.response?.data,
    url: error?.config?.url
  });
};

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [currentDate, selectedMember, eventTypeFilter]);

  const fetchMembers = async () => {
    setMembersLoading(true);
    try {
      const response = await teamApi.getMembers();
      const membersList = response.members || response.data?.members || [];
      setMembers(membersList);
    } catch (error) {
  console.error("Error fetching members:", error);
  toast.error("Failed to load members", {
    description: "Member filter unavailable"
  });
  setMembers([]); // Empty array instead of mock
} finally {
  setMembersLoading(false);
}
  };

  const formatEvents = (events) => {
    if (!Array.isArray(events)) return [];
    
    return events.map(e => ({
      id: e._id || e.id,
      title: e.title || 'Untitled Event',
      description: e.description || '',
      startDate: e.startDate,
      endDate: e.endDate,
      type: e.type || 'event',
      conferenceLink: e.conferenceLink,
      attendees: (e.attendees || []).map(a => ({
        id: a._id || a.id,
        name: a.name,
        email: a.email
      }))
    }));
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: startOfMonth(currentDate).toISOString(),
        endDate: endOfMonth(currentDate).toISOString(),
      };

      if (selectedMember !== "all") {
        params.memberId = selectedMember;
      }

      if (eventTypeFilter !== "both") {
        params.type = eventTypeFilter;
      }

      let eventsData = [];
      
      try {
        const response = await teamApi.getEvents(params);
        eventsData = formatEvents(response.events || response.data?.events || []);
      } catch (apiError) {
        console.warn('Events endpoint not available, using tasks as events');
        
        try {
          const tasksResponse = await teamApi.getTasks();
          const tasks = tasksResponse.tasks || tasksResponse.data?.tasks || [];
          
          eventsData = tasks
            .filter(t => t.dueDate)
            .map(t => ({
              id: t._id || t.id,
              title: t.title,
              description: t.description,
              startDate: t.dueDate,
              endDate: t.dueDate,
              type: 'task',
              priority: t.priority,
              assignees: t.assignees
            }));
        } catch (taskError) {
  console.error('Failed to fetch tasks fallback:', taskError);
  eventsData = []; // Empty array instead
}
      }
      
      setEvents(eventsData);
      
} catch (error) {
  logApiError('Team Calendar Events', error);
  toast.error("Failed to load events", {
    description: error?.response?.data?.message || "Unable to fetch data"
  });
  setEvents([]);
} finally {
  setLoading(false);
}
  };

  const getEventsForDate = (date) => {
    if (!Array.isArray(events)) return [];
    
    return events.filter((event) => {
      if (!event?.startDate) return false;
      const eventDate = new Date(event.startDate);
      return isSameDay(eventDate, date);
    });
  };

  const getDateRange = () => {
    switch (viewMode) {
      case 'day':
        return [currentDate];
      case 'week':
        return eachDayOfInterval({
          start: startOfWeek(currentDate),
          end: endOfWeek(currentDate)
        });
      case 'month':
      default:
        return eachDayOfInterval({
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate)
        });
    }
  };

  const handlePrev = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'month':
      default:
        setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'month':
      default:
        setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const getViewTitle = () => {
    switch (viewMode) {
      case 'day':
        return format(currentDate, "MMMM dd, yyyy");
      case 'week':
        return `${format(startOfWeek(currentDate), "MMM dd")} - ${format(endOfWeek(currentDate), "MMM dd, yyyy")}`;
      case 'month':
      default:
        return format(currentDate, "MMMM yyyy");
    }
  };

  const daysToShow = getDateRange();

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowEventDialog(true);
  };

  const handleCreateEvent = async (eventData) => {
    try {
      await teamApi.createEvent(eventData);
      toast.success("Event created", {
        description: "The event has been added to the calendar",
      });
      fetchEvents();
    } catch (error) {
      toast.error("Failed to create event", {
        description: error?.message || "Please try again"
      });
    }
  };

  if (loading && events.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-96 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Calendar</h1>
          <p className="text-muted-foreground mt-1">
            View team events and task deadlines
          </p>
        </div>
        <Button className="gap-2" onClick={() => handleCreateEvent({})}>
          <Plus className="h-4 w-4" />
          New Event
        </Button>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === "month" ? "default" : "ghost"}
              onClick={() => setViewMode("month")}
            >
              Month
            </Button>
            <Button
              size="sm"
              variant={viewMode === "week" ? "default" : "ghost"}
              onClick={() => setViewMode("week")}
            >
              Week
            </Button>
            <Button
              size="sm"
              variant={viewMode === "day" ? "default" : "ghost"}
              onClick={() => setViewMode("day")}
            >
              Day
            </Button>
          </div>

          <Select 
            value={selectedMember} 
            onValueChange={setSelectedMember}
            disabled={membersLoading}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={membersLoading ? "Loading..." : "All Members"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              {members.map((member) => (
                <SelectItem 
                  key={member.id || member._id} 
                  value={member.id || member._id}
                >
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="both">Events & Tasks</SelectItem>
              <SelectItem value="events">Events Only</SelectItem>
              <SelectItem value="tasks">Tasks Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Calendar */}
      <Card className="p-6">
        {/* View Header with Navigation */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {getViewTitle()}
          </h2>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handlePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button size="sm" variant="outline" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Month View */}
        {viewMode === 'month' && (
          <>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center font-semibold text-sm text-muted-foreground p-2"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {daysToShow.map((date) => {
                const dayEvents = getEventsForDate(date);
                const isToday = isSameDay(date, new Date());

                return (
                  <div
                    key={date.toISOString()}
                    onClick={() => handleDateClick(date)}
                    className={`min-h-24 p-2 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                      isToday ? "bg-primary/10 border-primary" : ""
                    }`}
                  >
                    <div className={`text-sm font-semibold mb-1 ${isToday ? "text-primary" : ""}`}>
                      {format(date, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs rounded px-1 py-0.5 truncate ${
                            event.type === 'task' 
                              ? 'bg-orange-100 text-orange-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}
                          title={`${event.title}${event.attendees?.length ? ' - ' + event.attendees.map(a => a.name).join(', ') : ''}`}
                        >
                          {event.type === 'task' ? '📋' : '🔵'} {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground px-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Week View */}
        {viewMode === 'week' && (
          <>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {daysToShow.map((date) => (
                <div
                  key={date.toISOString()}
                  className="text-center font-semibold text-sm text-muted-foreground p-2"
                >
                  <div>{format(date, "EEE")}</div>
                  <div className="text-xs">{format(date, "MMM d")}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {daysToShow.map((date) => {
                const dayEvents = getEventsForDate(date);
                const isToday = isSameDay(date, new Date());

                return (
                  <div
                    key={date.toISOString()}
                    onClick={() => handleDateClick(date)}
                    className={`min-h-40 p-2 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                      isToday ? "bg-primary/10 border-primary" : ""
                    }`}
                  >
                    <div className="space-y-1">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs rounded px-2 py-1 ${
                            event.type === 'task' 
                              ? 'bg-orange-100 text-orange-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          <div className="font-semibold truncate">{event.title}</div>
                          {event.startDate && (
                            <div className="text-[10px] opacity-75">
                              {format(new Date(event.startDate), "h:mm a")}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Day View */}
        {viewMode === 'day' && (
          <div className="space-y-3">
            {Array.from({ length: 24 }, (_, hour) => {
              const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
              const slotEvents = getEventsForDate(currentDate).filter(event => {
                if (!event.startDate) return false;
                const eventHour = new Date(event.startDate).getHours();
                return eventHour === hour;
              });

              return (
                <div key={hour} className="flex gap-3 border-b pb-3">
                  <div className="w-20 text-sm font-medium text-muted-foreground">
                    {timeSlot}
                  </div>
                  <div className="flex-1 space-y-2">
                    {slotEvents.length > 0 ? (
                      slotEvents.map((event) => (
                        <div
                          key={event.id}
                          onClick={() => handleDateClick(currentDate)}
                          className={`p-3 rounded-lg cursor-pointer hover:opacity-90 transition-opacity ${
                            event.type === 'task' 
                              ? 'bg-orange-100 border-l-4 border-orange-500' 
                              : 'bg-blue-100 border-l-4 border-blue-500'
                          }`}
                        >
                          <div className="font-semibold">{event.title}</div>
                          {event.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {event.description}
                            </div>
                          )}
                          <div className="text-xs mt-2 opacity-75">
                            {format(new Date(event.startDate), "h:mm a")}
                            {event.endDate && ` - ${format(new Date(event.endDate), "h:mm a")}`}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground italic">
                        No events
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Legend */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Legend</h3>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-sm">Events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <span className="text-sm">Task Deadlines</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-500" />
            <span className="text-sm">Personal Events</span>
          </div>
        </div>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate ? format(selectedDate, "MMMM dd, yyyy") : ""}
            </DialogTitle>
            <DialogDescription>
              Events and tasks for this date
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {selectedDate && getEventsForDate(selectedDate).length > 0 ? (
              getEventsForDate(selectedDate).map((event) => (
                <div key={event.id} className="border rounded-lg p-3 space-y-2">
                  <h4 className="font-semibold">{event.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">
                      {format(new Date(event.startDate), "HH:mm")}
                    </Badge>
                    {event.conferenceLink && (
                      <a
                        href={event.conferenceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        🔗 Meeting Link
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No events for this date
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamCalendar;