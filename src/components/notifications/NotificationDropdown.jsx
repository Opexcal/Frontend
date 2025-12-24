import { useState, useEffect } from "react";
import { Bell, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import NotificationBadge from "./NotificationBadge";
import NotificationItem from "./NotificationItem";
import { useNotifications } from "@/context/NotificationContext";


/**
 * NotificationDropdown - Header dropdown component showing recent notifications
 * Shows the 5 most recent notifications with a link to view all
 */
const NotificationDropdown = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    deleteNotification,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => {
    // Get the 5 most recent notifications
    setRecentNotifications(notifications.slice(0, 5));
  }, [notifications]);

  const handleMarkAsRead = (e, id) => {
    e.stopPropagation();
    markAsRead(id);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  const handleViewNotification = (notification) => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setIsOpen(false);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-96 p-0 max-h-[500px] overflow-hidden"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <h2 className="font-semibold text-sm">Notifications</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              navigate("/notifications/settings");
              setIsOpen(false);
            }}
            title="Notification settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        {/* Notification List */}
        <div className="overflow-y-auto max-h-[350px]">
    {loading ? (
      <div className="p-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    ) : recentNotifications.length === 0 ? (
      <div className="p-8 text-center">
        <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
        <p className="text-sm text-muted-foreground">No notifications yet</p>
      </div>
    ) : (
      recentNotifications.map((notification) => (
              <div key={notification.id}>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewNotification(notification);
                  }}
                  className="border-b last:border-b-0"
                >
                  <NotificationItem
                    notification={notification}
                    variant="compact"
                    onMarkAsRead={(id) => handleMarkAsRead(event, id)}
                    onDelete={(id) => handleDelete(event, id)}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <Separator />

        {/* Footer */}
        <div className="p-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              navigate("/notifications");
              setIsOpen(false);
            }}
          >
            View All Notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
