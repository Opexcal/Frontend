import { cn } from "@/lib/utils";

/**
 * PriorityBadge - Visual indicator for task priority
 */
const PriorityBadge = ({ priority, className = "" }) => {
  const priorityConfig = {
    high: {
      icon: "🔴",
      color: "text-red-600 bg-red-50",
      label: "High",
    },
    medium: {
      icon: "🟡",
      color: "text-yellow-600 bg-yellow-50",
      label: "Medium",
    },
    low: {
      icon: "🟢",
      color: "text-green-600 bg-green-50",
      label: "Low",
    },
  };

  const config = priorityConfig[priority] || priorityConfig.low;

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

export default PriorityBadge;
