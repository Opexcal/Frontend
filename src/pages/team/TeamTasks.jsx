import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Trash2, CheckCheck, Filter, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

import TaskCard from "@/components/team/TaskCard";
import AssignmentModal from "@/components/team/AssignmentModal";
import { getTeamTasks, mockTeamMembers } from "@/lib/mockTeamData";

/**
 * TeamTasks - Comprehensive view of team tasks with assignment
 */
const TeamTasks = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all"
  );
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter, assigneeFilter]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const filters = {
        status: statusFilter === "all" ? undefined : statusFilter,
        priority: priorityFilter === "all" ? undefined : priorityFilter,
        assignee: assigneeFilter === "all" ? undefined : assigneeFilter,
      };
      const data = getTeamTasks(filters);
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTask = (taskId) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTasks.size === tasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(tasks.map((t) => t.id)));
    }
  };

  const handleBulkDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    console.log("Deleting tasks:", Array.from(selectedTasks));
    // TODO: Call API to delete tasks
    setSelectedTasks(new Set());
    setShowDeleteConfirm(false);
    fetchTasks();
  };

  const handleDeleteTask = (taskId) => {
    setTaskToDelete(taskId);
    setShowDeleteConfirm(true);
  };

  const handleAssignTask = async (data) => {
    console.log("Assigning task:", data);
    // TODO: Call API
    setShowAssignmentModal(false);
    fetchTasks();
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage and assign team tasks
          </p>
        </div>
        <Button
          onClick={() => setShowAssignmentModal(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">🔴 High</SelectItem>
              <SelectItem value="medium">🟡 Medium</SelectItem>
              <SelectItem value="low">🟢 Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
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
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedTasks.size > 0 && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selectedTasks.size === tasks.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                {selectedTasks.size} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
                className="gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No tasks found</p>
            <Button
              onClick={() => setShowAssignmentModal(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create First Task
            </Button>
          </Card>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 p-3 hover:bg-accent/30 rounded-lg transition-colors"
            >
              <Checkbox
                checked={selectedTasks.has(task.id)}
                onCheckedChange={() => handleSelectTask(task.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <TaskCard
                  task={task}
                  variant="default"
                  showActions
                  onDelete={handleDeleteTask}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        teamMembers={mockTeamMembers}
        onSubmit={handleAssignTask}
        mode="create"
      />

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              {taskToDelete
                ? "This task will be permanently deleted."
                : `${selectedTasks.size} tasks will be permanently deleted.`}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeamTasks;
