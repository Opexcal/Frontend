import React, { useState } from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ExternalLink,
  Trash2,
  Edit,
  CheckCircle2,
  MoreVertical,
} from "lucide-react";
import PriorityBadge from "./PriorityBadge";
import StatusBadge from "./StatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { tasksApi } from '@/api/taskApi';
import { toast } from "sonner";
import RejectTaskDialog from '../../components/RejectTaskDialog'; // ✅ Make sure path is correct

/**
 * TaskCard - Reusable task card component
 * Used in TeamTasks, TaskDelegation, PendingAssignments
 */
const TaskCard = ({
  task,
  variant = "default", // 'default' | 'compact' | 'delegation'
  showAssignee = true,
  showActions = true,
  isSelected = false,
  onSelect,
  onAccept,
  onDecline,
  onEdit,
  onDelete,
  onReassign,
  onClick,
  onRefresh,
  className = "",
}) => {
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // ✅ Single handleDeclineConfirm for the dialog
  const handleDeclineConfirm = async (rejectionReason) => {
    try {
      await tasksApi.rejectTask(task._id, rejectionReason);
      toast.success("Task rejected", {
  description: "The task creator has been notified",
});;
      setShowRejectDialog(false);
      if (onRefresh) onRefresh();
      if (onDecline) onDecline(task);
    } catch (error) {
     toast.error("Error", {
  description: error.response?.data?.message || "Failed to reject task",
});
    }
  };

  const daysUntilDue = task.dueDate
    ? Math.ceil(
        (new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const isDueSoon = daysUntilDue !== null && daysUntilDue <= 2;
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;

  const handleClick = (e) => {
    if (e.target.closest(".task-actions")) return;
    if (onClick) onClick(task);
  };

  // ✅ Handle accept task
  const handleAccept = async () => {
    try {
      await tasksApi.acceptTask(task._id);
     toast.success("Task accepted", {
  description: "Status updated to In-Progress",
});
      if (onRefresh) onRefresh();
      if (onAccept) onAccept(task);
    } catch (error) {
      toast.error("Error", {
  description: error.response?.data?.message || "Failed to accept task",
});
    }
  };

  // Default variant - Full task card
  if (variant === "default") {
    return (
      <Card
        className={cn(
          "p-4 hover:shadow-md transition-shadow",
          isSelected && "ring-2 ring-primary",
          className
        )}
      >
        <div className="flex items-start gap-3" onClick={handleClick}>
          {onSelect && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(task._id)}
              className="mt-1"
            />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-sm line-clamp-2">
                {task.title}
              </h3>
              <StatusBadge status={task.status} className="flex-shrink-0" />
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {task.description || "No description"}
            </p>

            <div className="flex items-center flex-wrap gap-2 mb-3">
              <PriorityBadge priority={task.priority?.toLowerCase() || 'medium'} />
              {showAssignee && task.assignees?.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {task.assignees.map(a => a.name).join(', ')}
                </Badge>
              )}

              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  ⚠️ Overdue
                </Badge>
              )}
              {isDueSoon && !isOverdue && (
                <Badge variant="outline" className="text-xs text-orange-600">
                  🔔 Due Soon
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Due:{" "}
                {task.dueDate ? (
                  <span
                    className={cn(
                      isOverdue
                        ? "text-red-600 font-semibold"
                        : isDueSoon
                          ? "text-orange-600 font-semibold"
                          : ""
                    )}
                  >
                    {format(new Date(task.dueDate), "MMM dd, yyyy")}
                  </span>
                ) : (
                  "N/A"
                )}
              </span>

              {showActions && (
                <div className="task-actions flex items-center gap-1">
                  {task.conferenceLink && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      asChild
                    >
                      <a
                        href={task.conferenceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open conference link"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(task)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onReassign && (
                        <DropdownMenuItem onClick={() => onReassign(task)}>
                          ↪️ Reassign
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(task._id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Compact variant - For dropdowns/lists
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer",
          className
        )}
        onClick={handleClick}
      >
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm line-clamp-1 mb-1">
              {task.title}
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              <PriorityBadge priority={task.priority?.toLowerCase() || 'medium'} />
              <StatusBadge status={task.status} />
            </div>
          </div>
          {isOverdue && (
            <Badge variant="destructive" className="text-xs flex-shrink-0">
              Overdue
            </Badge>
          )}
        </div>
      </div>
    );
  }

  // Delegation variant - For task delegation/assignment
  if (variant === "delegation") {
    return (
      <>
        <Card
          className={cn(
            "p-4 border-l-4 border-l-primary",
            isOverdue && "border-l-4 border-l-destructive",
            className
          )}
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h3 className="font-semibold text-base mb-1">📋 {task.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {task.description || "No description"}
              </p>
            </div>
            <div className="flex-shrink-0">
              <PriorityBadge priority={task.priority?.toLowerCase() || 'medium'} />
            </div>
          </div>

          <div className="space-y-2 mb-4 pb-4 border-b">
            <div className="text-sm">
              <span className="text-muted-foreground">Assigned by:</span>
              <span className="ml-2 font-medium">
                {task.createdBy?.name || task.assignedByName || "Unknown"}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Due:</span>
              <span
                className={cn(
                  "ml-2 font-medium",
                  isOverdue
                    ? "text-red-600"
                    : isDueSoon
                      ? "text-orange-600"
                      : ""
                )}
              >
                {format(new Date(task.dueDate), "MMM dd, yyyy")}
              </span>
            </div>
            <StatusBadge status={task.status} />
            
            {/* ✅ Show rejection reason if task is rejected */}
            {task.status === "Rejected" && task.rejectionReason && (
              <div className="text-sm mt-2 p-2 bg-destructive/10 rounded">
                <span className="text-muted-foreground">Rejection reason:</span>
                <p className="text-destructive text-xs mt-1">{task.rejectionReason}</p>
              </div>
            )}
          </div>

          {task.conferenceLink && (
            <div className="mb-4 p-2 bg-blue-50 rounded">
              <div className="text-xs text-muted-foreground mb-1">
                🔗 Meeting Link
              </div>
              <a
                href={task.conferenceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 break-all"
              >
                {task.conferenceLink}
              </a>
            </div>
          )}

          {showActions && (
            <div className="task-actions flex items-center gap-2">
              {/* ✅ Only show Accept/Decline for Pending tasks */}
              {task.status === "Pending" && (
                <>
                  {onAccept && (
                    <Button
                      size="sm"
                      className="gap-1"
                      onClick={handleAccept}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Accept
                    </Button>
                  )}

                  {onDecline && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowRejectDialog(true)} // ✅ Open dialog
                    >
                      ✗ Decline
                    </Button>
                  )}
                </>
              )}
              
              {onReassign && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReassign(task)}
                >
                  ↪ Reassign
                </Button>
              )}
              
              {onEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(task)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* ✅ Reject Task Dialog - outside Card but inside fragment */}
        <RejectTaskDialog
          isOpen={showRejectDialog}
          onClose={() => setShowRejectDialog(false)}
          onConfirm={handleDeclineConfirm}
          taskTitle={task.title}
        />
      </>
    );
  }
};

export default TaskCard;