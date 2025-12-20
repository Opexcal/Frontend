import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig = {
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
  
  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
};
export default StatusBadge;