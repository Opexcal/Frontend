import { useState, useEffect } from "react";
import { eventsApi } from "../../api/eventsApi";
import { toast } from 'sonner';
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { startOfMonth, endOfMonth, parseISO, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus, Filter, List, LayoutGrid } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import  CreateEventForm from "../../components/forms/CreateEventForms";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];



const CalendarOverview = () => {
 const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  
  // ✅ Add filter state
  const [filters, setFilters] = useState({
    Meeting: true,
    Holiday: true,
    Deadline: true,
    Task: true,
    Reminder: true,
    Other: true
  });
  
  const navigate = useNavigate();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Add this function after your state declarations
const fetchMonthEvents = async () => {
  setIsLoading(true);
  try {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    const response = await eventsApi.getEventsInRange(monthStart, monthEnd);
    
    const mappedEvents = response.data.map(event => ({
      id: event._id,
      title: event.title,
      date: new Date(event.startDate).getDate(),
      color: getColorByType(event.type),
      fullDate: event.startDate,
      type: event.type
    }));
    
    setEvents(mappedEvents);
  } catch (error) {
    toast.error("Error", {
      description: "Failed to load events.",
      variant: "destructive"
    });
  } finally {
    setIsLoading(false);
  }
};

// Add helper function
const getColorByType = (type) => {
  const colorMap = {
    Meeting: 'bg-blue-500',
    Deadline: 'bg-red-500',
    Holiday: 'bg-green-500',
    Task: 'bg-orange-500',
    Reminder: 'bg-purple-500',
    Other: 'bg-gray-500'
  };
  return colorMap[type] || 'bg-primary';
};

// Add useEffect to fetch on mount and when date changes
useEffect(() => {
  fetchMonthEvents();
}, [currentDate]);

// Add event listener for event changes
useEffect(() => {
  const handleEventChange = () => {
    fetchMonthEvents();
  };

  window.addEventListener("eventCreated", handleEventChange);
  window.addEventListener("eventUpdated", handleEventChange);
  window.addEventListener("eventDeleted", handleEventChange);

  return () => {
    window.removeEventListener("eventCreated", handleEventChange);
    window.removeEventListener("eventUpdated", handleEventChange);
    window.removeEventListener("eventDeleted", handleEventChange);
  };
}, [currentDate]);


  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

const renderCalendarDays = () => {
  const days = [];
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(
      <div key={`empty-${i}`} className="h-24 border border-border/50 bg-muted/30" />
    );
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = isCurrentMonth && today.getDate() === day;
    
    // ✅ Apply filters
    const dayEvents = events.filter(e => 
      e.date === day && filters[e.type]
    );

    days.push(
      <div
        key={day}
        onClick={() => navigate("/calendar/day", { 
          state: { date: new Date(year, month, day).toISOString() } 
        })}
        className={`h-24 border border-border/50 p-1 hover:bg-accent/30 transition-colors cursor-pointer ${
          isToday ? "bg-primary/5 border-primary/30" : ""
        }`}
      >
        <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : "text-foreground"}`}>
          {day}
        </div>
        <div className="space-y-1">
          {dayEvents.slice(0, 2).map((event) => (
           <div
  key={event.id}
  onClick={(e) => {
    e.stopPropagation(); // Prevent day click
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  }}
  className={`text-xs px-1.5 py-0.5 rounded text-primary-foreground truncate ${event.color} cursor-pointer hover:opacity-80 transition-opacity`}
>
  {event.title}
</div>
          ))}
          {dayEvents.length > 2 && (
            <div className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</div>
          )}
        </div>
      </div>
    );
  }

  return days;
};

  if (isLoading) {
  return (
    <div className="flex items-center justify-center h-screen">
      Loading calendar...
    </div>
  );
}


const renderWeekView = () => {
  // Get the current week's start (Sunday)
  const today = new Date();
  const currentDay = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - currentDay);
  
  const weekDays = [];
  const filteredWeekEvents = [];
  
  // Generate 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    weekDays.push(date);
    
    // Get events for this day
    const dayEvents = events.filter(e => {
      const eventDate = new Date(e.fullDate);
      return isSameDay(eventDate, date) && filters[e.type];
    });
    
    filteredWeekEvents.push({ date, events: dayEvents });
  }
  
  return (
    <div className="space-y-4">
      {filteredWeekEvents.map(({ date, events: dayEvents }, idx) => {
        const isToday = isSameDay(date, new Date());
        
        return (
          <div 
            key={idx} 
            className={`border rounded-lg p-4 ${isToday ? 'border-primary bg-primary/5' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className={`font-semibold ${isToday ? 'text-primary' : ''}`}>
                  {daysOfWeek[date.getDay()]}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <span className="text-sm text-muted-foreground">
                {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="space-y-2">
              {dayEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events</p>
              ) : (
                dayEvents.map((event) => (
                  <div
  key={event.id}
  className={`px-3 py-2 rounded text-white ${event.color} cursor-pointer hover:opacity-90 transition-opacity`}
  onClick={() => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  }}
>
  <p className="font-medium text-sm">{event.title}</p>
</div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold text-foreground">Calendar Overview</h1>
          <p className="text-muted-foreground mt-1">Manage your events and schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-xl text-primary">Create New Event</DialogTitle>
              </DialogHeader>
              <CreateEventForm onClose={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar / Quick Date Picker */}
        <Card className="lg:w-72 shrink-0">
          <CardHeader>
            <CardTitle className="text-base">Quick Date Picker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select 
  value={`${monthNames[month].toLowerCase()}-${year}`}
  onValueChange={(value) => {
    const [monthName, selectedYear] = value.split('-');
    const monthIndex = monthNames.findIndex(m => m.toLowerCase() === monthName);
    setCurrentDate(new Date(parseInt(selectedYear), monthIndex, 1));
  }}
>
  <SelectTrigger>
    <SelectValue placeholder="Select month" />
  </SelectTrigger>
  <SelectContent>
    {monthNames.map((name, index) => (
      <SelectItem key={index} value={`${name.toLowerCase()}-${year}`}>
        {name} {year}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

            {/* Mini Calendar */}
            <div className="border rounded-lg p-3">
              <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                {daysOfWeek.map(day => (
                  <div key={day} className="text-muted-foreground font-medium">{day.slice(0, 1)}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i - firstDay + 1;
                  const isValidDay = day > 0 && day <= daysInMonth;
                  const today = new Date();
                  const isToday = isValidDay && today.getDate() === day && 
                                  today.getMonth() === month && today.getFullYear() === year;
                  return (
                    <div
  key={i}
  onClick={() => {
    if (isValidDay) {
      setCurrentDate(new Date(year, month, day));
      navigate("/calendar/day", { 
        state: { date: new Date(year, month, day).toISOString() } 
      });
    }
  }}
  className={`h-6 w-6 flex items-center justify-center rounded-full cursor-pointer transition-colors
    ${isValidDay ? "hover:bg-accent" : "text-muted-foreground/30"}
    ${isToday ? "bg-primary text-primary-foreground" : ""}`}
>
  {isValidDay ? day : ""}
</div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
  <h4 className="text-sm font-medium">Filters</h4>
  <div className="space-y-2">
    {Object.keys(filters).map((filterType) => (
      <label key={filterType} className="flex items-center gap-2 text-sm cursor-pointer">
        <input 
          type="checkbox" 
          className="rounded border-border cursor-pointer" 
          checked={filters[filterType]}
          onChange={(e) => setFilters(prev => ({
            ...prev,
            [filterType]: e.target.checked
          }))}
        />
        {filterType}s
      </label>
    ))}
  </div>
            </div>

<Button 
  variant="outline" 
  size="sm" 
  className="w-full"
  onClick={() => setFilters({
    Meeting: true,
    Holiday: true,
    Deadline: true,
    Task: true,
    Reminder: true,
    Other: true
  })}
>
  <Filter className="h-4 w-4 mr-2" />
  Clear Filters
</Button>
          </CardContent>
        </Card>

        {/* Main Calendar */}
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle className="text-xl">
                  {monthNames[month]} {year}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={goToToday}>
                  Today
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "month" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("month")}
                >
                  <LayoutGrid className="h-4 w-4 mr-1" />
                  Month
                </Button>
                <Button
                  variant={viewMode === "week" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("week")}
                >
                  <List className="h-4 w-4 mr-1" />
                  Week
                </Button>
              </div>
            </div>
            
          </CardHeader>
          <CardContent>
  {viewMode === "month" ? (
    <>
      {/* Calendar Header */}
      <div className="grid grid-cols-7 gap-0 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0">
        {renderCalendarDays()}
      </div>
    </>
  ) : (
    /* Week View */
    <div className="max-h-[600px] overflow-y-auto">
      {renderWeekView()}
    </div>
  )}
</CardContent>
        </Card>
      </div>
      {/* Event Quick View Dialog */}
<Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{selectedEvent?.title}</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">
          {selectedEvent && new Date(selectedEvent.fullDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline">{selectedEvent?.type}</Badge>
      </div>
      <Button 
        className="w-full" 
        onClick={() => {
          setIsEventDialogOpen(false);
          navigate(`/events/${selectedEvent?.id}`);
        }}
      >
        View Event Details
      </Button>
    </div>
  </DialogContent>
</Dialog>
    </div>
  );
};

export default CalendarOverview;
