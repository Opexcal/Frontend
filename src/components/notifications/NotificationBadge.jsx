import { cn } from "@/lib/utils";

/**
 * NotificationBadge - Shows unread notification count
 * Used on the bell icon in the header
 */
const NotificationBadge = ({ count = 0, max = 99, variant = "default" }) => {
  if (count === 0) return null;

  if (variant === "dot") {
    return (
      <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full animate-pulse" />
    );
  }

  const displayCount = count > max ? `${max}+` : count;

  return (
    <span
      className={cn(
        "absolute -top-1 -right-1 bg-destructive text-white text-xs font-medium rounded-full min-w-[1.25rem] h-5 px-1 flex items-center justify-center animate-pulse"
      )}
    >
      {displayCount}
    </span>
  );
};

export default NotificationBadge;
