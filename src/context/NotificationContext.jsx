import { createContext, useContext, useState, useEffect } from "react";
import { notificationsApi } from "@/api/notificationsApi";
import { useToast } from "@/hooks/use-toast";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications from API
// Then update the fetchNotifications function:
const fetchNotifications = async () => {
  const token = localStorage.getItem('authToken');
  
  // Don't fetch if no token
  if (!token) {
    console.log('No auth token found, skipping notification fetch');
    return;
  }
  
  setIsLoading(true);
  
  try {
    const data = await notificationsApi.getNotifications(); // ✅ Fixed
    
    // Handle the response based on your API structure
    const notificationList = data.notifications || data.data?.notifications || [];
    const count = data.unreadCount || data.data?.unreadCount || 0;
    
    setNotifications(notificationList);
    setUnreadCount(count);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    // Optionally show a toast error
  } finally {
    setIsLoading(false);
  }
};
useEffect(() => {
  fetchNotifications();
}, []);

  // Mark single notification as read
  const markAsRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          (n._id || n.id) === id && !n.isRead ? { ...n, isRead: true } : n
        )
      );
      const notification = notifications.find((n) => (n._id || n.id) === id);
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      toast({
        title: "Failed to mark as read",
        description: error?.message || error?.data?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      toast({
        title: "Failed to mark all as read",
        description: error?.message || error?.data?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Delete single notification
  const deleteNotification = async (id) => {
    try {
      await notificationsApi.deleteNotification(id);
      const notification = notifications.find((n) => (n._id || n.id) === id);
      setNotifications((prev) =>
        prev.filter((n) => (n._id || n.id) !== id)
      );
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      toast({
        title: "Failed to delete notification",
        description: error?.message || error?.data?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Bulk delete notifications
  const bulkDeleteNotifications = async (ids) => {
    // Backend lacks bulk delete; perform sequentially
    for (const id of ids) {
      await deleteNotification(id);
    }
  };

  // Bulk mark as read
  const bulkMarkAsRead = async (ids) => {
    // Backend lacks bulk API; perform sequentially
    for (const id of ids) {
      await markAsRead(id);
    }
  };

  // Add new notification (for real-time)
  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount((prev) => prev + 1);
    }
  };

  // Update notification settings
  const updateSettings = async (settings) => {
    // This would be saved to local storage or API
    localStorage.setItem(
      "notificationSettings",
      JSON.stringify(settings)
    );
  };

  // Get settings
  const getSettings = () => {
    const stored = localStorage.getItem("notificationSettings");
    return (
      stored &&
      JSON.parse(stored)
    );
  };

  useEffect(() => {
    fetchNotifications();
    // Set up real-time listener here (WebSocket, polling, etc.)
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        bulkDeleteNotifications,
        bulkMarkAsRead,
        addNotification,
        fetchNotifications,
        updateSettings,
        getSettings,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
