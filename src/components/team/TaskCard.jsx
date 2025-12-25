import { formatDistanceToNow, format } from "date-fns";
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
import { useToast } from "@/hooks/use-toast";

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
  className = "",
}) => {
  const { toast } = useToast();
  const [filters, setFilters] = useState({ status: '', priority: '' });

useEffect(() => {
  const fetchTasks = async () => {
    const response = await tasksApi.getTasks(filters);
    setTasks(response.data.tasks);
  };
  fetchTasks();
}, [filters, refreshTrigger]);
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
              onCheckedChange={() => onSelect(task.id)}
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
              {task.description}
            </p>

            <div className="flex items-center flex-wrap gap-2 mb-3">
              <PriorityBadge priority={task.priority} />
              {showAssignee && (
  <Badge variant="secondary" className="text-xs">
    {/* Changed from task.assigneeName to: */}
    {task.assignees?.map(a => a.name).join(', ')}
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
                          onClick={() => onDelete(task.id)}
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
              <PriorityBadge priority={task.priority} />
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
              {task.description}
            </p>
          </div>
          <div className="flex-shrink-0">
            <PriorityBadge priority={task.priority} />
          </div>
        </div>

        <div className="space-y-2 mb-4 pb-4 border-b">
          <div className="text-sm">
            <span className="text-muted-foreground">Assigned by:</span>
            <span className="ml-2 font-medium">{task.assignedByName}</span>
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
            {onAccept && (
  <Button
    size="sm"
    className="gap-1"
    onClick={async () => {
      try {
        await tasksApi.acceptTask(task._id);
        toast({ title: "Task accepted" });
        // Refresh task list or update local state
      } catch (error) {
        toast({ 
          title: "Error", 
          description: error.response?.data?.message,
          variant: "destructive" 
        });
      }
    }}
  >
    <CheckCircle2 className="h-4 w-4" />
    Accept
  </Button>
)}

            {onDecline && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDecline(task)}
              >
                ✗ Decline
              </Button>
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
    );
  }
};

export default TaskCard;
