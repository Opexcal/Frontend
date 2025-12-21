import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, Edit, Trash2, Calendar, Clock, MapPin, Users,
  CheckCircle2, XCircle, AlertCircle, FileText, MessageSquare,
  Plus, Video, Mail, ExternalLink, Share2
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data
const mockEvent = {
  id: 1,
  title: "Sprint Planning Meeting",
  description: "Quarterly sprint planning session to discuss Q1 goals, assign tasks, and plan the upcoming sprint. All team members are expected to attend and contribute to the planning process.",
  start: "2025-12-23T10:00:00",
  end: "2025-12-23T12:00:00",
  location: "Conference Room A",
  onlineLink: "https://zoom.us/j/123456789",
  type: "meeting",
  isRecurring: false,
  createdAt: "2025-12-20T10:00:00",
  updatedAt: "2025-12-22T14:30:00",
  organizer: {
    id: "1",
    name: "Sarah Johnson",
    avatar: "",
    email: "sarah@example.com"
  },
  attendees: [
    { id: "2", name: "Mike Chen", avatar: "", email: "mike@example.com", rsvp: "accepted" },
    { id: "3", name: "Alex Rivera", avatar: "", email: "alex@example.com", rsvp: "accepted" },
    { id: "4", name: "Emma Wilson", avatar: "", email: "emma@example.com", rsvp: "pending" },
    { id: "5", name: "David Kim", avatar: "", email: "david@example.com", rsvp: "declined" },
  ],
  attachments: [
    { id: 1, name: "sprint_planning_agenda.pdf", size: "1.2 MB", uploadedAt: "2025-12-20" },
  ],
  comments: [
    {
      id: 1,
      author: { id: "2", name: "Mike Chen", avatar: "" },
      content: "Looking forward to this meeting! I'll prepare my updates beforehand.",
      createdAt: "2025-12-21T09:15:00",
    },
  ],
};

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event] = useState(mockEvent);
  const [commentText, setCommentText] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState(
    event.attendees.find(a => a.id === user?.id)?.rsvp || "pending"
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRSVPDialogOpen, setIsRSVPDialogOpen] = useState(false);

  const canEdit = user?.id === event.organizer.id || user?.role === "admin" || user?.role === "manager";
  const myRSVP = event.attendees.find(a => a.id === user?.id);
  const acceptedCount = event.attendees.filter(a => a.rsvp === "accepted").length;
  const declinedCount = event.attendees.filter(a => a.rsvp === "declined").length;
  const pendingCount = event.attendees.filter(a => a.rsvp === "pending").length;
  const isEventPast = isPast(parseISO(event.end));
  const isEventToday = isToday(parseISO(event.start));

  const handleRSVP = (status) => {
    // API call here
    setRsvpStatus(status);
    setIsRSVPDialogOpen(false);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    // API call here
    console.log("Adding comment:", commentText);
    setCommentText("");
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this event?")) {
      // API call here
      navigate("/calendar");
    }
  };

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
              <Badge variant="outline">
                {event.type}
              </Badge>
              {event.isRecurring && (
                <Badge variant="secondary">Recurring</Badge>
              )}
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
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {event.description}
              </p>
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
                  <div className="flex items-center gap-3">
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
                  </div>
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
                Comments ({event.comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add Comment */}
              <div className="mb-6">
                <Textarea
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-[100px] mb-3"
                />
                <Button onClick={handleAddComment}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Comment
                </Button>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {event.comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.avatar} />
                      <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.author.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
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

              {event.location && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </p>
                  <p className="text-sm">{event.location}</p>
                </div>
              )}

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
                  <AvatarImage src={event.organizer.avatar} />
                  <AvatarFallback>{event.organizer.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{event.organizer.name}</p>
                  <p className="text-xs text-muted-foreground">{event.organizer.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendees */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Attendees ({event.attendees.length})
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
                {event.attendees.map(attendee => (
                  <div key={attendee.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={attendee.avatar} />
                        <AvatarFallback>{attendee.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{attendee.name}</p>
                        <p className="text-xs text-muted-foreground">{attendee.email}</p>
                      </div>
                    </div>
                    <Badge variant={
                      attendee.rsvp === "accepted" ? "default" :
                      attendee.rsvp === "declined" ? "destructive" :
                      "outline"
                    }>
                      {attendee.rsvp === "accepted" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {attendee.rsvp === "declined" && <XCircle className="h-3 w-3 mr-1" />}
                      {attendee.rsvp === "pending" && <AlertCircle className="h-3 w-3 mr-1" />}
                      {attendee.rsvp}
                    </Badge>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to={`/events/${event.id}/rsvp`}>
                  Manage RSVPs
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Attachments */}
          {event.attachments && event.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {event.attachments.map(attachment => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{attachment.name}</p>
                          <p className="text-xs text-muted-foreground">{attachment.size}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Download</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {!isEventPast && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
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

