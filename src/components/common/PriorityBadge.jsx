import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const priorityConfig = {
  high: {
    label: "High",
    className: "bg-priority-high/10 text-priority-high border-priority-high/30 hover:bg-priority-high/20",
  },
  medium: {
    label: "Medium",
    className: "bg-priority-medium/10 text-priority-medium border-priority-medium/30 hover:bg-priority-medium/20",
  },
  low: {
    label: "Low",
    className: "bg-priority-low/10 text-priority-low border-priority-low/30 hover:bg-priority-low/20",
  },
};

export const PriorityBadge = ({ priority, className }) => {
  const config = priorityConfig[priority?.toLowerCase()] || priorityConfig.low;
  
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
};