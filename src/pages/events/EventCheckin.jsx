// Frontend component for organizers to check in attendees
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { eventsApi } from "@/api/eventsApi";
import { Checkbox } from "@/components/ui/checkbox";

const EventCheckin = () => {
  const { id } = useParams();
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendees();
  }, [id]);

  const fetchAttendees = async () => {
    try {
      const response = await eventsApi.getAttendanceSummary(id);
      setAttendees(response.data.data.attendees);
    } catch (error) {
      toast.error("Failed to load attendees");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAttendance = async (userId, currentStatus) => {
    try {
      await eventsApi.markAttendance(id, userId, !currentStatus);
      fetchAttendees(); // Refresh
      toast.success("Attendance updated");
    } catch (error) {
      toast.error("Failed to update attendance");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Check-in Attendees</h2>
      <div className="space-y-2">
        {attendees.map(attendee => (
          <div key={attendee.userId} className="flex items-center justify-between p-4 border rounded">
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={attendee.attended}
                onCheckedChange={() => handleToggleAttendance(attendee.userId, attendee.attended)}
              />
              <div>
                <p className="font-medium">{attendee.name}</p>
                <p className="text-sm text-muted-foreground">{attendee.email}</p>
              </div>
            </div>
            <Badge variant={attendee.attended ? "default" : "outline"}>
              {attendee.attended ? "Checked In" : "Not Checked In"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};