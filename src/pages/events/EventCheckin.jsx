import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns"; // ✅ ADD THIS IMPORT
import { eventsApi } from "@/api/eventsApi";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

const EventCheckin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    fetchAttendees();
  }, [id]);

  const fetchAttendees = async () => {
    setLoading(true);
    try {
      const response = await eventsApi.getAttendanceSummary(id);
      console.log('📥 Attendance summary response:', response.data);
      
      const data = response.data?.data || response.data;
      setAttendees(data.attendees || []);
      setEvent(data.event || null);
    } catch (error) {
      console.error('Failed to load attendees:', error);
      toast.error("Failed to load attendees");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAttendance = async (userId, currentStatus, rsvpStatus) => {
    // ✅ Prevent check-in if RSVP is not accepted
    if (rsvpStatus !== 'accepted') {
      toast.error("Cannot check in attendee who hasn't accepted the invitation");
      return;
    }

    try {
      await eventsApi.markAttendance(id, userId, !currentStatus);
      toast.success("Attendance updated");
      fetchAttendees();
    } catch (error) {
      console.error('Failed to update attendance:', error);
      toast.error("Failed to update attendance");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Check-in Attendees</h2>
          {event && (
            <p className="text-sm text-muted-foreground mt-1">
              {event.title} • {attendees.filter(a => a.attended).length} / {attendees.filter(a => a.status === 'accepted').length} checked in
            </p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Attendees ({attendees.filter(a => a.status === 'accepted').length} accepted)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attendees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No attendees to check in</p>
            </div>
          ) : (
            <div className="space-y-2">
              {attendees.map(attendee => {
                const isAccepted = attendee.status === 'accepted';
                const isDisabled = !isAccepted;
                
                return (
                  <div 
                    key={attendee.userId || attendee.id} 
                    className={`flex items-center justify-between p-4 border rounded-lg transition-all duration-200
                      ${isDisabled 
                        ? 'opacity-50 cursor-not-allowed bg-muted/30' 
                        : 'hover:bg-accent/50 hover:border-primary/50 hover:shadow-sm cursor-pointer'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={attendee.attended || false}
                        disabled={isDisabled}
                        onCheckedChange={() => handleToggleAttendance(
                          attendee.userId || attendee.id, 
                          attendee.attended,
                          attendee.status
                        )}
                        className={isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                      />
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={attendee.avatar} />
                        <AvatarFallback>{attendee.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{attendee.name || 'Unknown User'}</p>
                          {/* ✅ Show RSVP status badge */}
                          {attendee.status === 'declined' && (
                            <Badge variant="destructive" className="text-xs">Declined</Badge>
                          )}
                          {attendee.status === 'pending' && (
                            <Badge variant="outline" className="text-xs">Pending</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{attendee.email || ''}</p>
                        {attendee.checkedInAt && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ Checked in: {format(parseISO(attendee.checkedInAt), "MMM d, h:mm a")}
                          </p>
                        )}
                        {/* ✅ Show reason for disabled state */}
                        {isDisabled && (
                          <p className="text-xs text-orange-600 mt-1">
                            ⚠ Must accept invitation to check in
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={attendee.attended ? "default" : "outline"}
                      className={isDisabled ? 'opacity-50' : ''}
                    >
                      {attendee.attended ? "Checked In" : "Not Checked In"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ Add helpful info card */}
      {attendees.some(a => a.status !== 'accepted') && (
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <span className="text-orange-600 text-sm">ℹ️</span>
              <div>
                <p className="font-medium text-orange-900 dark:text-orange-100 text-sm">
                  Check-in Requirements
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  Only attendees who have accepted the invitation can be checked in. 
                  Attendees with pending or declined status are disabled.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EventCheckin;
