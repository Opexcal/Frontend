import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, MapPin, Users, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { eventsApi } from "../../api/eventsApi";

 const CreateEventForm = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "",
    startTime: "",
    endTime: "",
    location: "",
    meetingUrl: "",
    participants: "",
    reminder: "30",
    visibility: "Public",
  });

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validation
  if (!formData.title || !startDate || !endDate) {
    toast.error("Validation Error", {
      description: "Please fill in all required fields: Title, Start Date, and End Date.",
    });
    return;
  }

  setIsLoading(true);
  
  try {
    // Combine date + time into ISO strings
    const startDateTime = new Date(startDate);
    if (formData.startTime) {
      const [hours, minutes] = formData.startTime.split(':');
      startDateTime.setHours(parseInt(hours), parseInt(minutes));
    }
    
    const endDateTime = new Date(endDate);
    if (formData.endTime) {
      const [hours, minutes] = formData.endTime.split(':');
      endDateTime.setHours(parseInt(hours), parseInt(minutes));
    }

    // Map frontend fields to backend schema
    const eventData = {
      title: formData.title,
      description: formData.description,
      startDate: startDateTime.toISOString(),
      endDate: endDateTime.toISOString(),
      type: formData.eventType || 'Meeting', // Map to backend enum
      visibility: 'Public', // Add visibility selector to form if needed
      conferencingLink: formData.meetingUrl || null,
      attendees: [], // Add attendee selection logic if needed
      // groupId: null // Add if implementing group events
    };

    const response = await eventsApi.createEvent(eventData);
    
    toast.success("Success", {
      description: response.message || "Event created successfully.",
    });
  
    
    onClose();
    
    // Optional: trigger calendar refresh
    window.dispatchEvent(new CustomEvent('eventCreated', { detail: response.data }));
    
  } catch (error) {
    toast.error("Error",{
      description: error.message || "Failed to create event.",
    });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Event Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Event Details</h3>
        
        <div className="space-y-2">
          <Label htmlFor="title">Event Title *</Label>
          <Input
            id="title"
            placeholder="Project status update"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Weekly sync on project deliverables to discuss progress, blockers, and next steps..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="eventType">Event Type</Label>
          <Select value={formData.eventType} onValueChange={(value) => setFormData({ ...formData, eventType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
  <SelectItem value="Meeting">Meeting</SelectItem>
  <SelectItem value="Deadline">Deadline</SelectItem>
  <SelectItem value="Holiday">Holiday</SelectItem>
  <SelectItem value="Task">Task</SelectItem>
  <SelectItem value="Reminder">Reminder</SelectItem>
  <SelectItem value="Other">Other</SelectItem>
</SelectContent>
          </Select>
        </div>
      </div>

      {/* Date & Time */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Date & Time</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
  <Label htmlFor="visibility">Visibility</Label>
  <Select value={formData.visibility} onValueChange={(value) => setFormData({ ...formData, visibility: value })}>
    <SelectTrigger>
      <SelectValue placeholder="Select visibility" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="Public">Public - Everyone can see</SelectItem>
      <SelectItem value="Private">Private - Only you</SelectItem>
      <SelectItem value="GroupOnly">Group Only - Group members</SelectItem>
    </SelectContent>
  </Select>
</div>

          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="startTime"
                type="time"
                className="pl-9"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="endTime"
                type="time"
                className="pl-9"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Location / Platform */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Location / Platform</h3>
        
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="location"
              placeholder="Conference Room A"
              className="pl-9"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="meetingUrl">Meeting URL (Optional)</Label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="meetingUrl"
              type="url"
              placeholder="https://meet.google.com/..."
              className="pl-9"
              value={formData.meetingUrl}
              onChange={(e) => setFormData({ ...formData, meetingUrl: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Participants</h3>
        
        <div className="space-y-2">
          <Label htmlFor="participants">Add Participants</Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="participants"
              placeholder="Enter team emails (optional)"
              className="pl-9"
              value={formData.participants}
              onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Reminders */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Reminders / Notifications</h3>
        
        <div className="space-y-2">
          <Label htmlFor="reminder">Reminder</Label>
          <Select value={formData.reminder} onValueChange={(value) => setFormData({ ...formData, reminder: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select reminder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes before</SelectItem>
              <SelectItem value="30">30 minutes before</SelectItem>
              <SelectItem value="60">1 hour before</SelectItem>
              <SelectItem value="1440">1 day before</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Event"}
        </Button>
      </div>
    </form>
  );
};

export default CreateEventForm;