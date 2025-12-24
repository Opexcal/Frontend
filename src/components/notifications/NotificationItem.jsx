import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  CheckSquare,
  CheckCircle2,
  Calendar,
  Bell,
  AlertCircle,
  Users,
  AtSign,
  Info,
  Trash2,
  Check,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getNotificationTypeConfig } from "@/lib/mockNotifications";

/**
 * NotificationItem - Reusable component for displaying a single notification
 * Used in both NotificationCenter and NotificationDropdown
 */
const NotificationItem = ({
  notification,
  variant = "default",
  onMarkAsRead,
  onDelete,
  onClick,
}) => {
  const getIcon = (type) => {
    const normalizedType = type.toUpperCase();
    const iconMap = {
    'TASK_ASSIGNED': CheckSquare,
    'TASK_RESPONSE': CheckCircle2,
    'EVENT_INVITE': Calendar,
    // Keep lowercase for backwards compatibility
    'task_assigned': CheckSquare,
    'task_response': CheckCircle2,
    'event_invite': Calendar,
  };

    const IconComponent = iconMap[type] || iconMap[normalizedType] || Info;
  const config = getNotificationTypeConfig(type);
  return <IconComponent className={cn("h-5 w-5", config.color)} />;
};

const relativeTime = formatDistanceToNow(
  new Date(notification.createdAt || notification.timestamp),
  { addSuffix: true }
);
  const config = getNotificationTypeConfig(notification.type);

  return (
    <div
      className={cn(
        "p-4 border-l-4 cursor-pointer transition-colors hover:bg-accent/50",
        notification.isRead
          ? "border-transparent bg-background"
          : "border-primary bg-primary/5",
        notification.isSystem && "border-transparent bg-slate-50",
        variant === "compact" && "p-3"
      )}
      onClick={() => onClick?.(notification)}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p
                className={cn(
                  "text-sm",
                  !notification.isRead && "font-semibold"
                )}
              >
                {notification.title || notification.message}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {notification.message}
              </p>
              {notification.actor && variant === "default" && (
                <p className="text-xs text-muted-foreground mt-1">
                  by {notification.actor.name}
                </p>
              )}
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
              {relativeTime}
            </span>
          </div>

          {/* Actions - Default variant only */}
          {variant === "default" && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {notification.actionUrl && (
                <Button size="sm" variant="outline" className="gap-1">
                  <ArrowRight className="h-3 w-3" />
                  View Details
                </Button>
              )}
              {!notification.isRead && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead?.(notification.id);
                  }}
                  className="gap-1"
                >
                  <Check className="h-3 w-3" />
                  Mark as Read
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(notification.id);
                }}
                className="gap-1"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
