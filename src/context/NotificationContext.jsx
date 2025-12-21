import { createContext, useContext, useState, useEffect } from "react";
import { mockNotifications } from "@/lib/mockNotifications";

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
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications from mock data
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      const data = mockNotifications;
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark single notification as read
  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id && !n.isRead ? { ...n, isRead: true } : n
      )
    );
    const notification = notifications.find((n) => n.id === id);
    if (notification && !notification.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
    setUnreadCount(0);
  };

  // Delete single notification
  const deleteNotification = async (id) => {
    const notification = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (notification && !notification.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  // Bulk delete notifications
  const bulkDeleteNotifications = async (ids) => {
    const toDelete = notifications.filter((n) => ids.includes(n.id));
    setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));
    const unreadCount = toDelete.filter((n) => !n.isRead).length;
    setUnreadCount((prev) => Math.max(0, prev - unreadCount));
  };

  // Bulk mark as read
  const bulkMarkAsRead = async (ids) => {
    setNotifications((prev) =>
      prev.map((n) =>
        ids.includes(n.id) ? { ...n, isRead: true } : n
      )
    );
    const toMarkRead = notifications.filter(
      (n) => ids.includes(n.id) && !n.isRead
    ).length;
    setUnreadCount((prev) => Math.max(0, prev - toMarkRead));
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
