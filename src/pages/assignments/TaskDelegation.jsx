import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TaskCard from "@/components/team/TaskCard";
import { mockAssignments, mockTeamMembers } from "@/lib/mockTeamData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * TaskDelegation - Interface for users to accept, decline, or reassign tasks
 */
const TaskDelegation = () => {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("pending");
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [declineReason, setDeclineReason] = useState("");
  const [reassignTo, setReassignTo] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [assignments, selectedTab, searchQuery]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setAssignments(mockAssignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAssignments = () => {
    let filtered = [...assignments];

    if (selectedTab !== "all") {
      filtered = filtered.filter((a) => a.status === selectedTab);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.taskTitle.toLowerCase().includes(query) ||
          a.assignedByName.toLowerCase().includes(query)
      );
    }

    setFilteredAssignments(filtered);
  };

  const handleAccept = async (assignment) => {
    console.log("Accepting assignment:", assignment.id);
    // TODO: Call API
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignment.id ? { ...a, status: "accepted" } : a
      )
    );
  };

  const handleDecline = (assignment) => {
    setSelectedAssignment(assignment);
    setShowDeclineDialog(true);
  };

  const confirmDecline = async () => {
    console.log("Declining assignment:", selectedAssignment.id, declineReason);
    // TODO: Call API
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === selectedAssignment.id
          ? { ...a, status: "declined", declineReason }
          : a
      )
    );
    setShowDeclineDialog(false);
    setDeclineReason("");
    setSelectedAssignment(null);
  };

  const handleReassign = (assignment) => {
    setSelectedAssignment(assignment);
    setShowReassignDialog(true);
  };

  const confirmReassign = async () => {
    console.log(
      "Reassigning to:",
      reassignTo,
      "Assignment:",
      selectedAssignment.id
    );
    // TODO: Call API
    setShowReassignDialog(false);
    setReassignTo("");
    setSelectedAssignment(null);
  };

  const getTaskData = (assignment) => ({
    id: assignment.id,
    title: assignment.taskTitle,
    description: assignment.taskTitle,
    assigneeId: "current-user",
    assigneeName: "You",
    assignedById: assignment.assignedBy,
    assignedByName: assignment.assignedByName,
    priority: assignment.priority,
    status: "pending",
    dueDate: assignment.dueDate,
    conferenceLink: null,
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Task Assignments</h1>
        <p className="text-muted-foreground mt-1">
          Accept, decline, or reassign tasks assigned to you
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search task titles or assignees..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">
            All{" "}
            {assignments.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {assignments.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {assignments.filter((a) => a.status === "pending").length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {assignments.filter((a) => a.status === "pending").length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted
            {assignments.filter((a) => a.status === "accepted").length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {assignments.filter((a) => a.status === "accepted").length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="declined">
            Declined
            {assignments.filter((a) => a.status === "declined").length > 0 && (
              <Badge variant="outline" className="ml-2">
                {assignments.filter((a) => a.status === "declined").length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4 mt-6">
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No assignments in this category
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssignments.map((assignment) => (
                <TaskCard
                  key={assignment.id}
                  task={getTaskData(assignment)}
                  variant="delegation"
                  showActions
                  onAccept={() => handleAccept(assignment)}
                  onDecline={() => handleDecline(assignment)}
                  onReassign={() => handleReassign(assignment)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Decline Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Assignment?</DialogTitle>
            <DialogDescription>
              Are you sure you want to decline this assignment? You can provide
              a reason.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Task</h4>
              <p className="text-sm text-muted-foreground">
                {selectedAssignment?.taskTitle}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Reason for Declining (Optional)
              </label>
              <Textarea
                placeholder="Let your team lead know why you're declining this task..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="min-h-24"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeclineDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDecline}
            >
              Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reassign Dialog */}
      <Dialog open={showReassignDialog} onOpenChange={setShowReassignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Task</DialogTitle>
            <DialogDescription>
              Select a team member to reassign this task to
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Task</h4>
              <p className="text-sm text-muted-foreground">
                {selectedAssignment?.taskTitle}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Reassign To
              </label>
              <Select value={reassignTo} onValueChange={setReassignTo}>
                <SelectTrigger>
                  <Select.Value placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {mockTeamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReassignDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmReassign}
              disabled={!reassignTo}
            >
              Reassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskDelegation;
