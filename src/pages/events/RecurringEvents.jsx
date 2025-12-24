import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Calendar, Repeat, Edit, Trash2, Plus, 
  Clock, Users, Pause, Play, Settings, AlertCircle
} from "lucide-react";
import { format, parseISO, isFuture } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Mock data
const mockRecurringEvent = {
  id: 1,
  title: "Weekly Team Standup",
  description: "Regular team sync meeting to discuss progress and blockers",
  startTime: "09:00",
  duration: 30, // minutes
  frequency: "weekly",
  dayOfWeek: "monday",
  startDate: "2025-12-01",
  endDate: null, // null = no end date
  occurrences: [
    { id: 1, date: "2025-12-01", status: "completed", attendees: 8 },
    { id: 2, date: "2025-12-08", status: "completed", attendees: 8 },
    { id: 3, date: "2025-12-15", status: "completed", attendees: 7 },
    { id: 4, date: "2025-12-22", status: "upcoming", attendees: null },
    { id: 5, date: "2025-12-29", status: "upcoming", attendees: null },
    { id: 6, date: "2026-01-05", status: "upcoming", attendees: null },
  ],
  isActive: true,
  location: "Conference Room A",
  organizer: { id: "1", name: "Sarah Johnson" },
  totalOccurrences: 12,
};

const RecurringEvents = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(mockRecurringEvent);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  const handleToggleActive = () => {
    setEvent(prev => ({ ...prev, isActive: !prev.isActive }));
    // API call here
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this recurring event series? This will delete all future occurrences.")) {
      // API call here
      navigate("/calendar");
    }
  };

  const upcomingOccurrences = event.occurrences.filter(occ => 
    occ.status === "upcoming" || (occ.status === "completed" && isFuture(parseISO(occ.date)))
  );
  const pastOccurrences = event.occurrences.filter(occ => occ.status === "completed");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <div>
            <p className="font-medium text-orange-900 dark:text-orange-100">
              Recurring Events - Coming Soon
            </p>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              This feature is currently using mock data. Backend support for recurring events is in development.
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
            <h1 className="text-3xl font-display font-semibold text-foreground flex items-center gap-2">
              {event.title}
              <Badge variant={event.isActive ? "default" : "secondary"}>
                {event.isActive ? "Active" : "Paused"}
              </Badge>
            </h1>
            <p className="text-muted-foreground mt-1">{event.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleToggleActive}
          >
            {event.isActive ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause Series
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Resume Series
              </>
            )}
          </Button>
          <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Recurrence Settings</DialogTitle>
                <DialogDescription>
                  Configure how often this event repeats
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Frequency</Label>
                  <Select defaultValue={event.frequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Time</Label>
                  <Input type="time" defaultValue={event.startTime} />
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input type="number" defaultValue={event.duration} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsSettingsDialogOpen(false)}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Series
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Occurrences</p>
                <p className="text-2xl font-semibold mt-1">{event.totalOccurrences}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-semibold mt-1">{pastOccurrences.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-semibold mt-1">{upcomingOccurrences.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Frequency</p>
                <p className="text-2xl font-semibold mt-1 capitalize">{event.frequency}</p>
              </div>
              <Repeat className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6">
        {/* Event Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Recurrence Pattern</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {event.frequency} on {event.dayOfWeek || "selected days"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Time</p>
                <p className="text-sm text-muted-foreground">
                  {event.startTime} ({event.duration} minutes)
                </p>
              </div>

              {event.location && (
                <div>
                  <p className="text-sm font-medium mb-1">Location</p>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-1">Start Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(event.startDate), "MMMM d, yyyy")}
                </p>
              </div>

              {event.endDate ? (
                <div>
                  <p className="text-sm font-medium mb-1">End Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(event.endDate), "MMMM d, yyyy")}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium mb-1">End Date</p>
                  <p className="text-sm text-muted-foreground">No end date</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-1">Organizer</p>
                <p className="text-sm text-muted-foreground">{event.organizer.name}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Create Single Event
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Edit className="h-4 w-4 mr-2" />
                Edit This Occurrence Only
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                View All in Calendar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Occurrences List */}
        <Card>
          <CardHeader>
            <CardTitle>Event Occurrences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {event.occurrences.map(occurrence => (
                <div
                  key={occurrence.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    occurrence.status === "completed" ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/10" :
                    "border-border hover:bg-accent/50"
                  } transition-colors`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div>
                      <p className="font-medium text-sm">
                        {format(parseISO(occurrence.date), "EEEE, MMMM d, yyyy")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.startTime} ({event.duration} min)
                      </p>
                      {occurrence.attendees !== null && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{occurrence.attendees} attendees</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      occurrence.status === "completed" ? "default" : "outline"
                    }>
                      {occurrence.status === "completed" ? "Completed" : "Upcoming"}
                    </Badge>
                    {occurrence.status === "upcoming" && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/events/${occurrence.id}`}>View</Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecurringEvents;

