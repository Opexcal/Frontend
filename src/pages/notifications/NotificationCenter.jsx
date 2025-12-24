import { useState, useMemo} from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Settings,
  Search,
  Filter,
  Trash2,
  CheckCheck,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useNotifications } from "@/context/NotificationContext";
import NotificationItem from "@/components/notifications/NotificationItem";
import { groupNotificationsByDate } from "@/lib/mockNotifications";

/**
 * NotificationCenter - Main notifications page
 * Shows all user notifications with filtering and management capabilities
 */
const NotificationCenter = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    bulkDeleteNotifications,
    loading,
    bulkMarkAsRead,
  } = useNotifications();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let result = notifications;

    // Filter by tab
    if (selectedTab === "unread") {
      result = result.filter((n) => !n.isRead);
    } else if (selectedTab === "system") {
      result = result.filter((n) => n.isSystem);
    }

    // Filter by type
    if (filterType !== "all") {
  result = result.filter((n) => 
    n.type.toUpperCase() === filterType.toUpperCase()
  );
}
    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === "oldest") {
      result = [...result].reverse();
    } else if (sortBy === "unread-first") {
      result = [...result].sort((a, b) => {
        if (a.isRead === b.isRead) return 0;
        return a.isRead ? 1 : -1;
      });
    }

    return result;
  }, [notifications, selectedTab, filterType, searchQuery, sortBy]);

  // Group by date
  const groupedNotifications = useMemo(() => {
    if (filteredNotifications.length === 0) return {};
    return groupNotificationsByDate(filteredNotifications);
  }, [filteredNotifications]);

  // Handle checkbox toggle
  const toggleNotificationSelection = (id) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedNotifications(newSelected);
  };

  // Handle select all
  const toggleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(
        new Set(filteredNotifications.map((n) => n.id))
      );
    }
  };

  // Handle bulk actions
  const handleBulkMarkAsRead = () => {
    if (selectedNotifications.size > 0) {
      bulkMarkAsRead(Array.from(selectedNotifications));
      setSelectedNotifications(new Set());
    }
  };

  const handleBulkDelete = () => {
    if (selectedNotifications.size > 0) {
      bulkDeleteNotifications(Array.from(selectedNotifications));
      setSelectedNotifications(new Set());
    }
  };

  // Render group section
  const renderDateGroup = (groupName, notifications) => {
    if (notifications.length === 0) return null;

    const groupLabels = {
      today: "Today",
      yesterday: "Yesterday",
      thisWeek: "This Week",
      earlier: "Earlier",
    };

    return (
      <div key={groupName} className="mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-4">
          {groupLabels[groupName]}
        </h3>
        <div className="space-y-0">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start gap-3 px-4 py-2 hover:bg-accent/30 rounded-lg transition-colors"
            >
              <Checkbox
                checked={selectedNotifications.has(notification.id)}
                onCheckedChange={() =>
                  toggleNotificationSelection(notification.id)
                }
                className="mt-3"
              />
              <div className="flex-1">
                <NotificationItem
                  notification={notification}
                  variant="default"
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                  onClick={(notif) => {
                    if (notif.actionUrl) {
                      navigate(notif.actionUrl);
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Empty state messages
  const getEmptyStateMessage = () => {
    if (selectedTab === "unread") return "You're all caught up! 🎉";
    if (selectedTab === "system") return "No system notifications";
    return "No notifications yet";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b sticky top-0 bg-background z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Notifications</h1>
                <p className="text-muted-foreground">
                  Stay updated with your latest activities
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/notifications/settings")}
              title="Notification settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              onClick={markAllAsRead}
              variant="outline"
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Mark All as Read
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading && (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <span className="ml-2 text-sm text-muted-foreground">
        Loading notifications...
      </span>
    </div>
  )}
        {/* Tabs and Filters */}
        {!loading && (
        <div className="mb-6">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="all">
                  All Notifications
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>
              {loading && (
  <div className="flex items-center justify-center py-8">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    <span className="ml-2 text-sm text-muted-foreground">Loading notifications...</span>
  </div>
)}

              {/* Filters */}
              <div className="flex items-center gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
  <SelectTrigger className="w-[180px]">
    <Filter className="h-4 w-4 mr-2" />
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Types</SelectItem>
    <SelectItem value="TASK_ASSIGNED">Task Assignments</SelectItem>
    <SelectItem value="TASK_RESPONSE">Task Responses</SelectItem>
    <SelectItem value="EVENT_INVITE">Event Invites</SelectItem>
  </SelectContent>
</Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="unread-first">Unread First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bulk Actions - Show when items selected */}
            {selectedNotifications.size > 0 && (
              <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={
                        selectedNotifications.size ===
                        filteredNotifications.length
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                    <span className="text-sm font-medium">
                      {selectedNotifications.size} selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBulkMarkAsRead}
                      className="gap-1"
                    >
                      <CheckCheck className="h-4 w-4" />
                      Mark as Read
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleBulkDelete}
                      className="gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Notifications List */}
            <TabsContent value={selectedTab} className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-muted-foreground">
                    {getEmptyStateMessage()}
                  </p>
                </div>
              ) : (
                <div>
                  {renderDateGroup("today", groupedNotifications.today)}
                  {renderDateGroup("yesterday", groupedNotifications.yesterday)}
                  {renderDateGroup("thisWeek", groupedNotifications.thisWeek)}
                  {renderDateGroup("earlier", groupedNotifications.earlier)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
          )}
      </div>
    </div>
  );
};

export default NotificationCenter;
