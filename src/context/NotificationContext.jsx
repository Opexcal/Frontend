import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationsApi } from '@/api/notificationsApi';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();


  // Helper: Generate title from type
  const generateTitle = (type) => {
    const titles = {
      'TASK_ASSIGNED': 'New Task Assignment',
      'TASK_RESPONSE': 'Task Response',
      'EVENT_INVITE': 'Event Invitation',
    };
    return titles[type] || 'Notification';
  };

  // Helper: Generate action URL
  const generateActionUrl = (type, relatedId) => {
    const routes = {
      'TASK_ASSIGNED': `/tasks/${relatedId}`,
      'TASK_RESPONSE': `/tasks/${relatedId}`,
      'EVENT_INVITE': `/events/${relatedId}`,
    };
    return routes[type] || null;
  };

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    try {
      setNotifLoading(true);
      const response = await notificationsApi.getNotifications();
      
      if (response.success) {
  // Backend returns { success, count, unreadCount, data: [...] }
  const transformed = (response.data || []).map(notif => ({
          id: notif._id,
          type: notif.type,
          message: notif.message,
          isRead: notif.isRead,
          relatedId: notif.relatedId,
          createdAt: notif.createdAt,
          timestamp: notif.createdAt, // For backwards compatibility
          title: generateTitle(notif.type),
          actionUrl: generateActionUrl(notif.type, notif.relatedId),
          isSystem: false,
          actor: null,
        }));
        
        setNotifications(transformed);
        setUnreadCount(response.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notifications',
        variant: 'destructive',
      });
    } finally {
      setNotifLoading(false);
    }
  }, [toast]);

  // Mark single notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationsApi.deleteNotification(notificationId);
      
      const wasUnread = notifications.find(n => n.id === notificationId)?.isRead === false;
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast({
        title: 'Success',
        description: 'Notification deleted',
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      });
    }
  };

  // Bulk mark as read
  const bulkMarkAsRead = async (notificationIds) => {
    try {
      await Promise.all(notificationIds.map(id => notificationsApi.markAsRead(id)));
      
      setNotifications(prev =>
        prev.map(n => (notificationIds.includes(n.id) ? { ...n, isRead: true } : n))
      );
      
      const markedCount = notificationIds.filter(
        id => !notifications.find(n => n.id === id)?.isRead
      ).length;
      setUnreadCount(prev => Math.max(0, prev - markedCount));
      
      toast({
        title: 'Success',
        description: `${notificationIds.length} notifications marked as read`,
      });
    } catch (error) {
      console.error('Failed to bulk mark as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read',
        variant: 'destructive',
      });
    }
  };

  // Bulk delete
  const bulkDeleteNotifications = async (notificationIds) => {
    try {
      await Promise.all(notificationIds.map(id => notificationsApi.deleteNotification(id)));
      
      const deletedUnreadCount = notificationIds.filter(
        id => !notifications.find(n => n.id === id)?.isRead
      ).length;
      
      setNotifications(prev => prev.filter(n => !notificationIds.includes(n.id)));
      setUnreadCount(prev => Math.max(0, prev - deletedUnreadCount));
      
      toast({
        title: 'Success',
        description: `${notificationIds.length} notifications deleted`,
      });
    } catch (error) {
      console.error('Failed to bulk delete:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notifications',
        variant: 'destructive',
      });
    }
  };

  // Settings (localStorage - backend doesn't support this yet)
  const updateSettings = async (settings) => {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  };

  const getSettings = () => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : null;
  };

  // Auto-fetch on mount
// In NotificationContext.jsx - Update useEffect dependencies
useEffect(() => {
  if (!authLoading && user) {
    console.log('✅ Fetching notifications for user:', user.email);
    fetchNotifications();
  }
}, [authLoading, user, fetchNotifications]); // Add fetchNotifications

// Poll for new notifications every 30 seconds
useEffect(() => {
  if (authLoading || !user) return;

  const interval = setInterval(() => {
    fetchNotifications();
  }, 30000);

  return () => clearInterval(interval);
}, [authLoading, user, fetchNotifications]); // Add fetchNotifications


  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading: notifLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        bulkMarkAsRead,
        bulkDeleteNotifications,
        updateSettings,
        getSettings,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};