import { cn } from "@/lib/utils";

/**
 * StatusBadge - Visual indicator for task status
 */
const StatusBadge = ({ status, className = "" }) => {
  const statusConfig = {
    not_started: {
      icon: "⭕",
      color: "text-gray-600 bg-gray-50",
      label: "Not Started",
    },
    in_progress: {
      icon: "🔵",
      color: "text-blue-600 bg-blue-50",
      label: "In Progress",
    },
    completed: {
      icon: "✅",
      color: "text-green-600 bg-green-50",
      label: "Completed",
    },
    on_hold: {
      icon: "⏸️",
      color: "text-orange-600 bg-orange-50",
      label: "On Hold",
    },
  };

  const config = statusConfig[status] || statusConfig.not_started;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium",
        config.color,
        className
      )}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
