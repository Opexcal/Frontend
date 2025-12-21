import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, MoreVertical, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { differenceInHours, format } from "date-fns";
import { mockAssignments } from "@/lib/mockTeamData";

/**
 * PendingAssignments - Quick view of urgent pending assignments
 */
const PendingAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    fetchPendingAssignments();
    const interval = setInterval(fetchPendingAssignments, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPendingAssignments = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const pending = mockAssignments.filter((a) => a.status === "pending");
      setAssignments(pending);
    } catch (error) {
      console.error("Error fetching pending assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (assignment) => {
    console.log("Accepting assignment:", assignment.id);
    // TODO: Call API
    setAssignments((prev) =>
      prev.filter((a) => a.id !== assignment.id)
    );
  };

  const handleDecline = async (assignment) => {
    console.log("Declining assignment:", assignment.id);
    // TODO: Call API
    setAssignments((prev) =>
      prev.filter((a) => a.id !== assignment.id)
    );
  };

  const handleMarkReviewed = async (assignmentId) => {
    console.log("Marking as reviewed:", assignmentId);
    // TODO: Call API
    setAssignments((prev) =>
      prev.filter((a) => a.id !== assignmentId)
    );
  };

  const getUrgency = (assignment) => {
    const hoursUntilDue = differenceInHours(
      new Date(assignment.dueDate),
      new Date()
    );

    if (hoursUntilDue < 0) return "overdue";
    if (hoursUntilDue <= 6) return "urgent";
    if (hoursUntilDue <= 24) return "soon";
    return "normal";
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case "overdue":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            OVERDUE
          </Badge>
        );
      case "urgent":
        return (
          <Badge className="bg-red-500 text-white gap-1">
            🔴 URGENT
          </Badge>
        );
      case "soon":
        return (
          <Badge className="bg-orange-500 text-white gap-1">
            🟠 Due Soon
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            ⭕ Due Later
          </Badge>
        );
    }
  };

  const sortedAssignments = [...assignments].sort((a, b) => {
    const urgencyOrder = { overdue: 0, urgent: 1, soon: 2, normal: 3 };
    const urgencyA = getUrgency(a);
    const urgencyB = getUrgency(b);
    return urgencyOrder[urgencyA] - urgencyOrder[urgencyB];
  });

  if (loading && assignments.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pending Assignments</h1>
          <p className="text-muted-foreground mt-1">
            Tasks requiring immediate attention
          </p>
        </div>
        {assignments.length > 0 && (
          <Badge className="h-fit text-lg px-3 py-1 bg-red-100 text-red-700">
            {assignments.length}
          </Badge>
        )}
      </div>

      {/* Pending Assignments */}
      <div className="space-y-3">
        {assignments.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-2">✅</div>
            <h3 className="font-semibold mb-1">All Caught Up!</h3>
            <p className="text-muted-foreground">
              You have no pending task assignments
            </p>
          </Card>
        ) : (
          sortedAssignments.map((assignment) => {
            const urgency = getUrgency(assignment);
            const hoursUntilDue = differenceInHours(
              new Date(assignment.dueDate),
              new Date()
            );

            return (
              <Card
                key={assignment.id}
                className={`p-4 border-l-4 transition-all ${
                  urgency === "overdue"
                    ? "border-l-destructive bg-red-50"
                    : urgency === "urgent"
                      ? "border-l-orange-500 bg-orange-50"
                      : "border-l-primary"
                }`}
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base">
                        📋 {assignment.taskTitle}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Assigned by:{" "}
                        <span className="font-medium">
                          {assignment.assignedByName}
                        </span>
                      </p>
                    </div>
                    {getUrgencyBadge(urgency)}
                  </div>

                  {/* Due Info */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Due:</span>
                    <span
                      className={`font-medium ${
                        urgency === "overdue" ||
                        urgency === "urgent"
                          ? "text-red-600"
                          : ""
                      }`}
                    >
                      {format(new Date(assignment.dueDate), "MMM dd, yyyy")}
                    </span>
                    {hoursUntilDue >= 0 && (
                      <span className="text-muted-foreground">
                        ({hoursUntilDue} hours remaining)
                      </span>
                    )}
                  </div>

                  {/* Priority */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Priority:</span>
                    <Badge
                      variant={
                        assignment.priority === "high"
                          ? "destructive"
                          : assignment.priority === "medium"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {assignment.priority === "high"
                        ? "🔴 High"
                        : assignment.priority === "medium"
                          ? "🟡 Medium"
                          : "🟢 Low"}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleAccept(assignment)}
                      className="gap-1"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDecline(assignment)}
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setShowDetailsDialog(true);
                      }}
                      className="gap-1 ml-auto"
                    >
                      <Eye className="h-4 w-4" />
                      Details
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.taskTitle}</DialogTitle>
            <DialogDescription>
              Assignment from {selectedAssignment?.assignedByName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Due Date
              </h4>
              <p className="font-medium">
                {selectedAssignment &&
                  format(
                    new Date(selectedAssignment.dueDate),
                    "MMMM dd, yyyy"
                  )}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Priority
              </h4>
              <Badge
                variant={
                  selectedAssignment?.priority === "high"
                    ? "destructive"
                    : "secondary"
                }
              >
                {selectedAssignment?.priority === "high"
                  ? "🔴 High"
                  : "🟡 Medium"}
              </Badge>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Status
              </h4>
              <Badge variant="outline">
                {selectedAssignment?.status}
              </Badge>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetailsDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingAssignments;
