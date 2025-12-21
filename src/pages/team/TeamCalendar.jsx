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
  format,
  addMonths,
  subMonths,
  isSameDay,
} from "date-fns";
import { mockTeamEvents, mockTeamMembers } from "@/lib/mockTeamData";

/**
 * TeamCalendar - Unified calendar view of team events and tasks
 */
const TeamCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 20));
  const [viewMode, setViewMode] = useState("month"); // 'day', 'week', 'month'
  const [selectedMember, setSelectedMember] = useState("all");
  const [eventTypeFilter, setEventTypeFilter] = useState("both"); // 'events', 'tasks', 'both'
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventDialog, setShowEventDialog] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get events for display
  const getEventsForDate = (date) => {
    return mockTeamEvents.filter((event) => {
      const eventDate = new Date(event.startDate);
      return isSameDay(eventDate, date);
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowEventDialog(true);
  };

  const getDayOfWeek = (date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
  };

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
        <Button className="gap-2">
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

          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              {mockTeamMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
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
        {/* Month/Year Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Day Headers */}
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

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map((date) => {
            const events = getEventsForDate(date);
            const isToday = isSameDay(date, new Date());

            return (
              <div
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                className={`min-h-24 p-2 border rounded-lg cursor-pointer hover:bg-accent transition-colors ${
                  isToday ? "bg-primary/10 border-primary" : ""
                }`}
              >
                <div
                  className={`text-sm font-semibold mb-1 ${
                    isToday ? "text-primary" : ""
                  }`}
                >
                  {format(date, "d")}
                </div>
                <div className="space-y-1">
                  {events.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs bg-blue-100 text-blue-700 rounded px-1 py-0.5 truncate"
                      title={event.title}
                    >
                      🔵 {event.title}
                    </div>
                  ))}
                  {events.length > 2 && (
                    <div className="text-xs text-muted-foreground px-1">
                      +{events.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
                <div
                  key={event.id}
                  className="border rounded-lg p-3 space-y-2"
                >
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
