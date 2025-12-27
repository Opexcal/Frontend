import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft, ChevronRight, Printer, Share2, Plus,
  Calendar as CalendarIcon, CheckSquare, Clock, Cloud,
  Mail, Copy, FileText, AlertCircle
} from "lucide-react";
import { format, addDays, subDays, parseISO, startOfDay, isToday, setHours,} from "date-fns";
import { eventsApi } from "../../api/eventsApi"
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import CreateEventForm from "../../components/forms/CreateEventForms";


const DayView = () => {
  const location = useLocation();
  
  const [currentDate, setCurrentDate] = useState(
    location.state?.date ? parseISO(location.state.date) : new Date()
  );
  const [viewFilter, setViewFilter] = useState("all");
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBlockTimeDialog, setShowBlockTimeDialog] = useState(false);
const [showFreeTimeDialog, setShowFreeTimeDialog] = useState(false);
const [showAddEventDialog, setShowAddEventDialog] = useState(false);
const [blockTimeData, setBlockTimeData] = useState({ start: '', end: '', title: '' });
const [showEditEventDialog, setShowEditEventDialog] = useState(false);


  // In each calendar view component
useEffect(() => {
  const handleEventChange = () => {
    fetchDayEvents();
  };

  window.addEventListener("eventCreated", handleEventChange);
  window.addEventListener("eventUpdated", handleEventChange);
  window.addEventListener("eventDeleted", handleEventChange);

  return () => {
    window.removeEventListener("eventCreated", handleEventChange);
    window.removeEventListener("eventUpdated", handleEventChange);
    window.removeEventListener("eventDeleted", handleEventChange);
  };
}, []);

useEffect(() => {
  const style = document.createElement('style');
  style.innerHTML = `
    @media print {
      .bg-blue-500, .bg-green-500, .bg-red-500, .bg-orange-500, .bg-purple-500 {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
    }
  `;
  document.head.appendChild(style);
  return () => document.head.removeChild(style);
}, []);

  // Fetch events for the current day
  const fetchDayEvents = async () => {
      setIsLoading(true);
      try {
        const dayStart = startOfDay(currentDate);
        const dayEnd = addDays(dayStart, 1);
        
        const response = await eventsApi.getEventsInRange(dayStart, dayEnd);
        
        // Map backend events to component format
        const mappedEvents = response.data.map(event => ({
          id: event._id,
          title: event.title,
          start: new Date(event.startDate),
          end: new Date(event.endDate),
          type: event.type.toLowerCase(),
          location: event.location || null,
          description: event.description,
          onlineLink: event.conferencingLink,
          attendees: event.attendees?.length || 0,
          color: getColorByType(event.type),
          isAllDay: isAllDayEvent(event.startDate, event.endDate),
          organizer: event.createdBy,
          visibility: event.visibility
        }));
        
        setEvents(mappedEvents);
        toast.success("Calendar Updated", {
  description: "Day events refreshed successfully."
});

      } catch (error) {
        toast.error("Failed to Load Events", {
  description: "Unable to load events for this day. Please try again."
});

      } finally {
        setIsLoading(false);
      }
    };
  useEffect(() => {
  fetchDayEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentDate]);

  // Helper: Map event type to color
  const getColorByType = (type) => {
    const colorMap = {
      Meeting: 'blue',
      Deadline: 'red',
      Holiday: 'green',
      Task: 'orange',
      Reminder: 'purple',
      Other: 'gray'
    };
    return colorMap[type] || 'blue';
  };

  // Helper: Check if event spans full day
  const isAllDayEvent = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const duration = (endDate - startDate) / (1000 * 60 * 60); // hours
    return duration >= 23;
  };

  // Block Time handler
const handleBlockTime = async () => {
  try {
    const startTime = new Date(currentDate);
    const [startHour, startMin] = blockTimeData.start.split(':');
    startTime.setHours(parseInt(startHour), parseInt(startMin));
    
    const endTime = new Date(currentDate);
    const [endHour, endMin] = blockTimeData.end.split(':');
    endTime.setHours(parseInt(endHour), parseInt(endMin));
    
    const newEvent = {
      title: blockTimeData.title || "Blocked Time",
      description: "Time blocked for focused work",
      startDate: startTime.toISOString(),
      endDate: endTime.toISOString(),
      type: "Other",
      visibility: "Private"
    };
    
    await eventsApi.createEvent(newEvent);
    toast.success("Time Blocked", {
      description: "Focus time added to your schedule"
    });
    setShowBlockTimeDialog(false);
    setBlockTimeData({ start: '', end: '', title: '' });
    fetchDayEvents();
  } catch (error) {
    toast.error("Failed to block time");
  }
};

// Find Free Time handler
const findFreeSlots = () => {
  const freeSlots = [];
  const workStart = 9; // 9 AM
  const workEnd = 17; // 5 PM
  
  for (let hour = workStart; hour < workEnd; hour++) {
    const slotStart = new Date(currentDate);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(currentDate);
    slotEnd.setHours(hour + 1, 0, 0, 0);
    
    const hasConflict = timedEvents.some(event => {
      return (event.start < slotEnd && event.end > slotStart);
    });
    
    if (!hasConflict) {
      freeSlots.push({
        start: format(slotStart, "h:mm a"),
        end: format(slotEnd, "h:mm a")
      });
    }
  }
  
  return freeSlots;
};
  // Add loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading day view...
      </div>
    );
  }

  

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();

  const getEventPosition = (event) => {
    if (event.isAllDay) return null;
    const start = event.start;
    const end = event.end;
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const top = (startMinutes / 60) * 80; // 80px per hour
    const height = ((endMinutes - startMinutes) / 60) * 80;
    return { top: `${top}px`, height: `${Math.max(height, 40)}px` };
  };

  const getEventColor = (color) => {
    const colors = { // Tailwind classes
      'green': 'bg-green-500',
      'blue': 'bg-blue-500',
      'purple': 'bg-purple-500',
      'red': 'bg-red-500',
      'orange': 'bg-orange-500',
    };
    return colors[color] || "bg-primary";
  };

  const handlePreviousDay = () => {
    setCurrentDate(subDays(currentDate, 1));
  };

  const handleNextDay = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  const allDayEvents = events.filter(e => e.isAllDay);
  const timedEvents = events.filter(e => !e.isAllDay);

  const filteredTimedEvents = viewFilter === "all" 
    ? timedEvents 
    : timedEvents.filter(e => e.type === viewFilter);

  const summary = {
    totalEvents: events.length,
    scheduledHours: timedEvents.reduce((acc, e) => {
      const duration = (e.end - e.start) / (1000 * 60 * 60);
      return acc + duration;
    }, 0),
    freeHours: 24 - timedEvents.reduce((acc, e) => {
      const duration = (e.end - e.start) / (1000 * 60 * 60);
      return acc + duration;
    }, 0),
    busiestHour: "10:00 AM" // Simplified calculation
  };

  const isCurrentDay = isToday(currentDate);
  const isBusinessHours = (hour) => hour >= 9 && hour < 17;

  
  // Print Day
const handlePrintDay = () => {
  window.print();
};

// Share Day (copy schedule to clipboard)
const handleShareDay = async () => {
  const scheduleText = `Schedule for ${format(currentDate, "EEEE, MMMM d, yyyy")}\n\n` +
    events.map(event => {
      if (event.isAllDay) {
        return `${event.title} - All Day`;
      }
      return `${format(event.start, "h:mm a")} - ${format(event.end, "h:mm a")}: ${event.title}`;
    }).join('\n');
  
  try {
    await navigator.clipboard.writeText(scheduleText);
    toast.success("Schedule Copied", {
      description: "Day schedule copied to clipboard"
    });
  } catch (error) {
    toast.error("Failed to copy schedule");
  }
};


// Export to PDF (using print dialog with PDF option)
// Email Schedule
const handleEmailSchedule = () => {
  const scheduleHTML = events.map(event => {
    if (event.isAllDay) {
      return `${event.title} - All Day`;
    }
    return `${format(event.start, "h:mm a")} - ${format(event.end, "h:mm a")}: ${event.title}${event.location ? ` @ ${event.location}` : ''}`;
  }).join('%0D%0A');
  
  const subject = encodeURIComponent(`Schedule for ${format(currentDate, "EEEE, MMMM d, yyyy")}`);
  const body = encodeURIComponent(`My Schedule:\n\n${scheduleHTML.replace(/%0D%0A/g, '\n')}`);
  
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
};


// Copy to Next Day
const handleCopyToNextDay = async () => {
  try {
    const nextDay = addDays(currentDate, 1);
    const copyPromises = events.map(event => {
      const newEvent = {
        title: event.title,
        description: event.description,
        startDate: addDays(event.start, 1).toISOString(),
        endDate: addDays(event.end, 1).toISOString(),
        type: event.type.charAt(0).toUpperCase() + event.type.slice(1), // Capitalize first letter
        visibility: event.visibility,
        location: event.location,
        conferencingLink: event.onlineLink
      };
      return eventsApi.createEvent(newEvent);
    });
    
    await Promise.all(copyPromises);
    toast.success("Events Copied", {
      description: `All events copied to ${format(nextDay, "MMMM d, yyyy")}`
    });
  } catch (error) {
    toast.error("Failed to copy events");
  }
};


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePreviousDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-display font-semibold text-foreground">
              {format(currentDate, "EEEE, MMMM d, yyyy")}
            </h1>
            {isCurrentDay && (
              <p className="text-sm text-muted-foreground">Today</p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handleNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleGoToToday}>
            Today
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewFilter} onValueChange={setViewFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="meeting">Meetings</TabsTrigger>
              <TabsTrigger value="work">Work</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" onClick={handlePrintDay}>
  <Printer className="h-4 w-4 mr-2" />
  Print Day
</Button>
<Button variant="outline" size="sm" onClick={handleShareDay}>
  <Share2 className="h-4 w-4 mr-2" />
  Share Day
</Button>
 <Button variant="outline" size="sm" onClick={handleCopyToNextDay}>
  <Copy className="h-4 w-4 mr-2" />
  Copy to Next Day
</Button>
<Button variant="outline" size="sm" onClick={handleEmailSchedule}>
  <Mail className="h-4 w-4 mr-2" />
  Email Schedule
</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[75%_25%] gap-6">
        {/* Main Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {/* All-Day Events */}
            {allDayEvents.length > 0 && (
              <div className="mb-4 pb-4 border-b">
                <div className="flex gap-2">
                  {allDayEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`flex-1 p-3 rounded-lg ${getEventColor(event.color)} text-white cursor-pointer hover:opacity-90 transition-opacity`}
                    >
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs opacity-90 mt-1">{event.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline Grid */}
            <div className="relative">
              {/* Time Slots */}
              <div className="grid grid-cols-[10%_90%] gap-2">
                <div className="space-y-0">
                  {hours.map(hour => (
                    <div
                      key={hour}
                      className={`h-20 border-r border-b border-border flex items-start justify-end pr-2 pt-1 ${
                        isBusinessHours(hour) ? "bg-blue-50/50 dark:bg-blue-950/10" : ""
                      }`}
                    >
                      <span className="text-xs text-muted-foreground">
                        {format(setHours(new Date(), hour), "h a")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Events Area */}
                <div className="relative">
                  {hours.map(hour => (
                    <div
                      key={hour}
                      className={`h-20 border-b border-border ${
                        isBusinessHours(hour) ? "bg-blue-50/50 dark:bg-blue-950/10" : ""
                      }`}
                    />
                  ))}

                  {/* Current Time Indicator */}
                  {isCurrentDay && (
                    <div
                      className="absolute left-0 right-0 z-10"
                      style={{
                        top: `${((currentHour * 60 + currentMinute) / 60) * 80}px`,
                      }}
                    >
                      <div className="flex items-center">
                        <div className="h-4 w-4 rounded-full bg-red-500 -ml-2 -mt-2" />
                        <div className="flex-1 h-0.5 bg-red-500" />
                        <div className="px-2 py-1 bg-red-500 text-white text-xs rounded">
                          {format(new Date(), "h:mm a")}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Event Blocks */}
                  {filteredTimedEvents.map(event => {
                    const position = getEventPosition(event);
                    if (!position) return null;

                    return (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`absolute left-2 right-2 ${getEventColor(event.color)} text-white rounded-lg p-2 cursor-pointer hover:opacity-90 transition-opacity shadow-md z-20`}
                        style={position}
                      >
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        <p className="text-xs opacity-90 mt-1">
                          {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
                        </p>
                        {event.location && (
                          <p className="text-xs opacity-75 mt-1 truncate">📍 {event.location}</p>
                        )}
                        {event.attendees && (
                          <p className="text-xs opacity-75 mt-1">👥 {event.attendees} attendees</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Day Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Day Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-semibold">{summary.totalEvents}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scheduled Hours</p>
                <p className="text-2xl font-semibold">{summary.scheduledHours.toFixed(1)}h</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Free Time</p>
                <p className="text-2xl font-semibold">{summary.freeHours.toFixed(1)}h</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Busiest Hour</p>
                <p className="text-lg font-semibold">{summary.busiestHour}</p>
              </div>
            </CardContent>
          </Card>

          {/* Event List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events
                  .sort((a, b) => {
                    if (a.isAllDay && !b.isAllDay) return -1;
                    if (!a.isAllDay && b.isAllDay) return 1;
                    return a.start - b.start;
                  })
                  .map(event => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`p-2 rounded-lg border border-border cursor-pointer hover:bg-accent/50 transition-colors ${
                        selectedEvent?.id === event.id ? "bg-accent" : ""
                      }`}
                    >
                      {event.isAllDay ? (
                        <div>
                          <Badge variant="outline" className="text-xs mb-1">All Day</Badge>
                          <p className="text-sm font-medium">{event.title}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
                          </p>
                          <p className="text-sm font-medium">{event.title}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
  <Button 
    variant="outline" 
    className="w-full justify-start" 
    size="sm" 
    onClick={() => setShowAddEventDialog(true)}
  >
    <Plus className="h-4 w-4 mr-2" />
    Add Event
  </Button>
  
  <Link to="/tasks?create=task" className="w-full">
  <Button 
    variant="outline" 
    className="w-full justify-start" 
    size="sm"
  >
    <CheckSquare className="h-4 w-4 mr-2" />
    Add Task
  </Button>
</Link>
  
  <Button 
    variant="outline" 
    className="w-full justify-start" 
    size="sm"
    onClick={() => setShowBlockTimeDialog(true)}
  >
    <Clock className="h-4 w-4 mr-2" />
    Block Time
  </Button>
  
  <Button 
    variant="outline" 
    className="w-full justify-start" 
    size="sm"
    onClick={() => setShowFreeTimeDialog(true)}
  >
    <CalendarIcon className="h-4 w-4 mr-2" />
    Find Free Time
  </Button>
</CardContent>
          </Card>

          {/* Weather Widget (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Cloud className="h-4 w-4 mr-2" />
                Weather
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-semibold">72°F</p>
                <p className="text-sm text-muted-foreground mt-1">Partly Cloudy</p>
              </div>
            </CardContent>
          </Card>

          {/* Time Blocking Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Time Blocking Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Block focused work time during your peak hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Schedule buffer time between meetings</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Use color coding to categorize events</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          {/* <Button variant="outline" size="sm" onClick={handlePrintDay}>
  <Printer className="h-4 w-4 mr-2" />
  Print Schedule
</Button>
<Button variant="outline" size="sm" onClick={handleExportPDF}>
  <FileText className="h-4 w-4 mr-2" />
  Export to PDF
</Button> */}

        </div>
       
      </div>

      {/* Event Details Modal (simplified - can be expanded with Dialog) */}
      {selectedEvent && (
        <Card className="fixed bottom-4 right-4 w-96 z-50 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">{selectedEvent.title}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEvent(null)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {!selectedEvent.isAllDay && (
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="text-sm font-medium">
                  {format(selectedEvent.start, "h:mm a")} - {format(selectedEvent.end, "h:mm a")}
                </p>
              </div>
            )}
            {selectedEvent.location && (
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="text-sm font-medium">{selectedEvent.location}</p>
              </div>
            )}
            {selectedEvent.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm">{selectedEvent.description}</p>
              </div>
            )}
            {selectedEvent.attendees && (
              <div>
                <p className="text-sm text-muted-foreground">Attendees</p>
                <p className="text-sm font-medium">{selectedEvent.attendees} people</p>
              </div>
            )}
            <div className="flex gap-2 pt-2 border-t">
  <Button 
  size="sm" 
  className="flex-1"
  onClick={() => {
    setShowEditEventDialog(true);
  }}
>
  Edit
</Button>
  {selectedEvent.onlineLink && (
    <Button 
      size="sm" 
      variant="outline" 
      className="flex-1"
      onClick={() => window.open(selectedEvent.onlineLink, '_blank')}
    >
      Join
    </Button>
  )}
  <Button 
    size="sm" 
    variant="destructive"
    onClick={async () => {
      try {
        await eventsApi.deleteEvent(selectedEvent.id);
        toast.success("Event Deleted");
        setSelectedEvent(null);
        fetchDayEvents();
      } catch (error) {
        toast.error("Failed to delete event");
      }
    }}
  >
    Delete
  </Button>
</div>
          </CardContent>
        </Card>
      )}
      {/* Block Time Dialog */}
<Dialog open={showBlockTimeDialog} onOpenChange={setShowBlockTimeDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Block Time</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Title</label>
        <input
          type="text"
          className="w-full mt-1 px-3 py-2 border rounded-md"
          placeholder="Focus time, Deep work, etc."
          value={blockTimeData.title}
          onChange={(e) => setBlockTimeData({...blockTimeData, title: e.target.value})}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Start Time</label>
        <input
          type="time"
          className="w-full mt-1 px-3 py-2 border rounded-md"
          value={blockTimeData.start}
          onChange={(e) => setBlockTimeData({...blockTimeData, start: e.target.value})}
        />
      </div>
      <div>
        <label className="text-sm font-medium">End Time</label>
        <input
          type="time"
          className="w-full mt-1 px-3 py-2 border rounded-md"
          value={blockTimeData.end}
          onChange={(e) => setBlockTimeData({...blockTimeData, end: e.target.value})}
        />
      </div>
      <Button onClick={handleBlockTime} className="w-full">
        Block Time
      </Button>
    </div>
  </DialogContent>
</Dialog>

{/* Find Free Time Dialog */}
<Dialog open={showFreeTimeDialog} onOpenChange={setShowFreeTimeDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Available Time Slots</DialogTitle>
    </DialogHeader>
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {findFreeSlots().length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No free slots available today
        </p>
      ) : (
        findFreeSlots().map((slot, i) => (
          <div 
            key={i} 
            className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
            onClick={() => {
              const [startHour, startMin] = slot.start.replace(/[ap]m/i, '').trim().split(':');
              const isPM = slot.start.toLowerCase().includes('pm');
              const hour24 = isPM && startHour !== '12' ? parseInt(startHour) + 12 : startHour;
              
              setBlockTimeData({
                start: `${hour24.toString().padStart(2, '0')}:${startMin || '00'}`,
                end: `${(parseInt(hour24) + 1).toString().padStart(2, '0')}:${startMin || '00'}`,
                title: 'Focus Time'
              });
              setShowFreeTimeDialog(false);
              setShowBlockTimeDialog(true);
            }}
          >
            <p className="font-medium">{slot.start} - {slot.end}</p>
            <p className="text-xs text-muted-foreground mt-1">Click to schedule</p>
          </div>
        ))
      )}
    </div>
  </DialogContent>
</Dialog>

{/* Add Event Dialog */}
<Dialog open={showAddEventDialog} onOpenChange={setShowAddEventDialog}>
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Create New Event</DialogTitle>
    </DialogHeader>
    <CreateEventForm onClose={() => setShowAddEventDialog(false)} />
  </DialogContent>
</Dialog>
{/* Edit Event Dialog */}
<Dialog open={showEditEventDialog} onOpenChange={setShowEditEventDialog}>
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Edit Event</DialogTitle>
    </DialogHeader>
    {selectedEvent && (
      <CreateEventForm 
        eventData={selectedEvent}
        isEditMode={true}
        onClose={() => {
          setShowEditEventDialog(false);
          setSelectedEvent(null);
          fetchDayEvents();
        }} 
      />
    )}
  </DialogContent>
</Dialog>
    </div>
  
  );
};

export default DayView;