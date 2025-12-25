import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig = {
  // Backend values (capitalized)
  "Pending": {
    label: "Pending",
    className: "bg-muted text-muted-foreground",
  },
  "In-Progress": {
    label: "In Progress",
    className: "bg-primary/10 text-primary",
  },
  "Completed": {
    label: "Completed",
    className: "bg-success/10 text-success",
  },
  "Rejected": {
    label: "Rejected",
    className: "bg-destructive/10 text-destructive", // Add this for rejected tasks
  },
  
  // Legacy frontend values (for backward compatibility during migration)
  "not-started": {
    label: "Not Started",
    className: "bg-muted text-muted-foreground",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-primary/10 text-primary",
  },
  "completed": {
    label: "Completed",
    className: "bg-success/10 text-success",
  },
  "on-hold": {
    label: "On Hold",
    className: "bg-warning/10 text-warning",
  },
};

const StatusBadge = ({ status, className }) => {
  const config = statusConfig[status];
  
  // Fallback for unknown status
  if (!config) {
    console.warn(`Unknown status: ${status}`);
    return (
      <Badge variant="secondary" className={cn("bg-muted text-muted-foreground", className)}>
        {status}
      </Badge>
    );
  }
  
  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;