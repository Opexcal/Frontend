import { useState, useEffect } from "react";
import { eventsApi } from "../../api/eventsApi";
import { toast } from "sonner";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft, Edit, Trash2, Calendar, Users,
  CheckCircle2, XCircle, AlertCircle, FileText, MessageSquare,
  Video, Mail, ExternalLink, Share2
} from "lucide-react";
import { format, parseISO, isPast, isToday } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rsvpStatus, setRsvpStatus] = useState("pending");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRSVPDialogOpen, setIsRSVPDialogOpen] = useState(false);

  useEffect(() => {
  const fetchEvent = async () => {
    setIsLoading(true);
    try {
      const response = await eventsApi.getEvent(id);
      
      console.log('📥 Full response:', response);
      console.log('📦 response.data:', response.data);
      
      // ✅ FIX: Backend returns { success: true, data: eventObject }
      // response.data IS the event object directly (not response.data.data)
      const eventData = response.data; // ✅ Changed from response.data.data
      
      if (!eventData || !eventData._id) {
        throw new Error('Event data not found in response');
      }
      
      const mappedEvent = {
        ...eventData,
        _id: eventData._id,
        start: eventData.startDate,
        end: eventData.endDate,
        onlineLink: eventData.conferencingLink,
        organizer: eventData.createdBy,
        attendees: (eventData.attendees || []).map(att => {
          const userId = att.userId?._id || att.userId;
          const userName = att.userId?.name || 'Unknown';
          const userEmail = att.userId?.email || '';
          const userAvatar = att.userId?.avatar || '';
          
          return {
            _id: userId,
            id: userId,
            name: userName,
            email: userEmail,
            avatar: userAvatar,
            rsvp: att.status || 'pending',
            status: att.status || 'pending',
            attended: att.attended || false,
            respondedAt: att.respondedAt,
            checkedInAt: att.checkedInAt
          };
        }),
        comments: eventData.comments || [],
        attachments: eventData.attachments || [],
        isRecurring: false
      };
      
      setEvent(mappedEvent);
      
      // Set current user's RSVP status
      if (user?.id && mappedEvent.attendees) {
        const myRsvp = mappedEvent.attendees.find(
          a => a.id === user.id || a._id === user.id
        );
        if (myRsvp?.rsvp) {
          setRsvpStatus(myRsvp.rsvp);
        }
      }
    } catch (error) {
      console.error('❌ Failed to load event:', error);
      toast.error("Failed to Load Event", {
        description: error.response?.data?.message || error.message || "Unable to load event details."
      });
      navigate("/calendar");
    } finally {
      setIsLoading(false);
    }
  };

  if (id) {
    fetchEvent();
  }
}, [id, user?.id, navigate]);

const handleRSVP = async (status) => {
  try {
    await eventsApi.updateRSVP(id, status);
    
    setRsvpStatus(status);
    setIsRSVPDialogOpen(false);
    
    toast.success("RSVP Updated", {
      description: `Your response has been set to ${status}.`
    });
    
    // Refresh event data
    const response = await eventsApi.getEvent(id);
    const eventData = response.data; // ✅ Changed from response.data.data
    
    const mappedEvent = {
      ...eventData,
      start: eventData.startDate,
      end: eventData.endDate,
      onlineLink: eventData.conferencingLink,
      organizer: eventData.createdBy,
      attendees: (eventData.attendees || []).map(att => ({
        _id: att.userId?._id || att.userId,
        id: att.userId?._id || att.userId,
        name: att.userId?.name || 'Unknown',
        email: att.userId?.email || '',
        avatar: att.userId?.avatar || '',
        rsvp: att.status || 'pending',
        status: att.status || 'pending',
        attended: att.attended || false,
        respondedAt: att.respondedAt,
        checkedInAt: att.checkedInAt
      })),
    };
    
    setEvent(mappedEvent);
    
  } catch (error) {
    console.error('❌ RSVP update failed:', error);
    toast.error("RSVP Update Failed", {
      description: error.response?.data?.message || "Unable to update RSVP."
    });
  }
};

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    
    try {
      await eventsApi.deleteEvent(id);
      toast.success("Event Deleted", {
        description: "The event has been removed successfully."
      });
      navigate("/calendar");
    } catch (error) {
      toast.error("Delete Failed", {
        description: error.message || "Unable to delete the event."
      });
    }
  };

const handleUpdateEvent = async (updates) => {
  setIsLoading(true);
  try {
    const updateData = {
      title: updates.title,
      description: updates.description,
      startDate: updates.startDate ? new Date(updates.startDate).toISOString() : undefined,
      endDate: updates.endDate ? new Date(updates.endDate).toISOString() : undefined,
      type: updates.type,
      visibility: updates.visibility,
      conferencingLink: updates.conferencingLink || null,
      attendees: updates.attendees || [],
    };

    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const response = await eventsApi.updateEvent(event._id, updateData);
    const eventData = response.data; // ✅ Changed from response.data.data
    
    const mappedEvent = {
      ...eventData,
      start: eventData.startDate,
      end: eventData.endDate,
      onlineLink: eventData.conferencingLink,
      organizer: eventData.createdBy,
      attendees: (eventData.attendees || []).map(att => ({
        _id: att.userId?._id || att.userId,
        id: att.userId?._id || att.userId,
        name: att.userId?.name || 'Unknown',
        email: att.userId?.email || '',
        avatar: att.userId?.avatar || '',
        rsvp: att.status || 'pending',
        status: att.status || 'pending',
        attended: att.attended || false,
      })),
    };
    
    setEvent(mappedEvent);
    setIsEditDialogOpen(false);
    
    toast.success("Event Updated", {
      description: "Your changes have been saved successfully."
    });

    window.dispatchEvent(new CustomEvent('eventUpdated', { detail: mappedEvent }));
    
  } catch (error) {
    console.error('❌ Update failed:', error);
    toast.error("Update Failed", {
      description: error.response?.data?.message || "Unable to update the event."
    });
  } finally {
    setIsLoading(false);
  }
};

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-medium">Event not found</p>
          <Button className="mt-4" onClick={() => navigate("/calendar")}>
            Back to Calendar
          </Button>
        </div>
      </div>
    );
  }

  const canEdit = event && (
    user?.id === event?.createdBy?._id || 
    user?._id === event?.createdBy?._id ||
    ['SuperAdmin', 'Admin'].includes(user?.role)
  );

  const myRSVP = event.attendees?.find(a => a.id === user?.id || a._id === user?.id);
  const acceptedCount = event?.attendees?.filter(a => a.rsvp === "accepted").length || 0;
  const declinedCount = event?.attendees?.filter(a => a.rsvp === "declined").length || 0;
  const pendingCount = event?.attendees?.filter(a => a.rsvp === "pending").length || 0;
  const isEventPast = event ? isPast(parseISO(event.end)) : false;
  const isEventToday = event ? isToday(parseISO(event.start)) : false;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-display font-semibold text-foreground">
              {event.title}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline">{event.type}</Badge>
              {event.isRecurring && <Badge variant="secondary">Recurring</Badge>}
              {isEventPast && <Badge variant="secondary">Past Event</Badge>}
              {isEventToday && !isEventPast && <Badge className="bg-green-500">Happening Today</Badge>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          {canEdit && (
            <>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6">
        {/* Main Content */}
        <div className="space-y-6">
         {/* Description */}
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <FileText className="h-5 w-5" />
      Description
    </CardTitle>
  </CardHeader>
  <CardContent>
    {/* ✅ FIX: Render HTML instead of plain text */}
    {event.description ? (
      <div 
        className="text-sm text-foreground prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: event.description }}
      />
    ) : (
      <p className="text-sm text-muted-foreground">No description provided</p>
    )}
  </CardContent>
</Card>
          {/* RSVP Section */}
          {!isEventPast && myRSVP && (
            <Card>
              <CardHeader>
                <CardTitle>Your RSVP</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant={
                    rsvpStatus === "accepted" ? "default" :
                    rsvpStatus === "declined" ? "destructive" :
                    "outline"
                  } className="text-base px-4 py-2">
                    {rsvpStatus === "accepted" && <CheckCircle2 className="h-4 w-4 mr-2" />}
                    {rsvpStatus === "declined" && <XCircle className="h-4 w-4 mr-2" />}
                    {rsvpStatus === "pending" && <AlertCircle className="h-4 w-4 mr-2" />}
                    {rsvpStatus.charAt(0).toUpperCase() + rsvpStatus.slice(1)}
                  </Badge>
                  <Button onClick={() => setIsRSVPDialogOpen(true)}>
                    Update RSVP
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments
                <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Comment functionality will be available soon
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Info */}
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date & Time
                </p>
                <div className="text-sm space-y-1">
                  <p>{format(parseISO(event.start), "EEEE, MMMM d, yyyy")}</p>
                  <p className="text-muted-foreground">
                    {format(parseISO(event.start), "h:mm a")} - {format(parseISO(event.end), "h:mm a")}
                  </p>
                </div>
              </div>

              {event.onlineLink && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Online Meeting
                  </p>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <a href={event.onlineLink} target="_blank" rel="noopener noreferrer">
                      Join Meeting <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Organizer */}
          <Card>
            <CardHeader>
              <CardTitle>Organizer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={event.organizer?.avatar} />
                  <AvatarFallback>{event.organizer?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{event.organizer?.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{event.organizer?.email || ''}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendees */}
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Users className="h-5 w-5" />
      Attendees ({event.attendees?.length || 0})
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-3 mb-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Accepted</span>
        <Badge className="bg-green-500">{acceptedCount}</Badge>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Pending</span>
        <Badge variant="outline">{pendingCount}</Badge>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Declined</span>
        <Badge variant="destructive">{declinedCount}</Badge>
      </div>
    </div>

    <div className="space-y-3 max-h-96 overflow-y-auto">
      {event.attendees && event.attendees.length > 0 ? (
        event.attendees.map((attendee, index) => (
          <div key={attendee._id || index} className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{attendee.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{attendee.name || 'User'}</p>
              {attendee.email && (
                <p className="text-xs text-muted-foreground">{attendee.email}</p>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">No attendees added yet</p>
      )}
    </div>

    {/* ✅ FIX: Only show "Manage RSVPs" for organizers and admins */}
    {canEdit && (
      <Button variant="outline" className="w-full mt-4" asChild>
        <Link to={`/events/${event._id}/rsvp`}>
          Manage RSVPs
        </Link>
      </Button>
    )}
  </CardContent>
</Card>

          {/* Actions & Check-in - ✅ MERGED INTO ONE CARD */}
          {!isEventPast && (
            <Card>
              <CardHeader>
                <CardTitle>{canEdit ? 'Actions & Check-in' : 'Actions'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {event.onlineLink && (
                  <Button className="w-full" asChild>
                    <a href={event.onlineLink} target="_blank" rel="noopener noreferrer">
                      <Video className="h-4 w-4 mr-2" />
                      Join Meeting
                    </a>
                  </Button>
                )}
                <Button variant="outline" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Attendees
                </Button>
                
                {/* ✅ Check-in section - only if canEdit */}
                {canEdit && (
                  <>
                    <div className="border-t pt-2 mt-2">
                      <p className="text-sm font-medium mb-2">Check-in Management</p>
                    </div>
<Button 
  className="w-full" 
  onClick={async () => {
    try {
      await eventsApi.markAttendance(event._id, user.id, true);
      toast.success("Checked in successfully");
      
      // ✅ ADD THIS: Refresh event data to show updated attendance
      const response = await eventsApi.getEvent(id);
      const eventData = response.data;
      const mappedEvent = {
        ...eventData,
        start: eventData.startDate,
        end: eventData.endDate,
        onlineLink: eventData.conferencingLink,
        organizer: eventData.createdBy,
        attendees: (eventData.attendees || []).map(att => ({
          _id: att.userId?._id || att.userId,
          id: att.userId?._id || att.userId,
          name: att.userId?.name || 'Unknown',
          email: att.userId?.email || '',
          avatar: att.userId?.avatar || '',
          rsvp: att.status || 'pending',
          status: att.status || 'pending',
          attended: att.attended || false, // ✅ This will now be true
          respondedAt: att.respondedAt,
          checkedInAt: att.checkedInAt
        })),
      };
      setEvent(mappedEvent);
      
    } catch (error) {
      toast.error("Failed to check in");
    }
  }}
>
  <CheckCircle2 className="h-4 w-4 mr-2" />
  Check Myself In
</Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate(`/events/${event._id}/checkin`)}
                    >
                      Manage All Check-ins
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* RSVP Dialog */}
      <Dialog open={isRSVPDialogOpen} onOpenChange={setIsRSVPDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update RSVP</DialogTitle>
            <DialogDescription>
              Will you be attending this event?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Button
                variant={rsvpStatus === "accepted" ? "default" : "outline"}
                onClick={() => handleRSVP("accepted")}
                className="justify-start"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Yes, I'll attend
              </Button>
              <Button
                variant={rsvpStatus === "declined" ? "destructive" : "outline"}
                onClick={() => handleRSVP("declined")}
                className="justify-start"
              >
                <XCircle className="h-4 w-4 mr-2" />
                No, I can't attend
              </Button>
              <Button
                variant={rsvpStatus === "pending" ? "default" : "outline"}
                onClick={() => handleRSVP("pending")}
                className="justify-start"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Maybe / Pending
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRSVPDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetails;