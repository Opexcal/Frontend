import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationsApi } from '@/api/notificationsApi';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const [retryCount, setRetryCount] = useState(0);
  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);
  const [hasFetchedOnMount, setHasFetchedOnMount] = useState(false);
  const MAX_RETRIES = 3;

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

  // ✅ Fetch notifications - NO useCallback needed
  const fetchNotifications = async () => {
    // ✅ CRITICAL FIX: Don't fetch if user is not logged in
    if (!user) {
      console.log('⏸️ Skipping notification fetch - user not logged in');
      return;
    }

    try {
      setNotifLoading(true);
      const response = await notificationsApi.getNotifications();
      
      if (response.success) {
        const transformed = (response.data || []).map(notif => ({
          id: notif._id,
          type: notif.type,
          message: notif.message,
          isRead: notif.isRead,
          relatedId: notif.relatedId,
          createdAt: notif.createdAt,
          timestamp: notif.createdAt,
          title: generateTitle(notif.type),
          actionUrl: generateActionUrl(notif.type, notif.relatedId),
          isSystem: false,
          actor: null,
        }));
        
        setNotifications(transformed);
        setUnreadCount(response.unreadCount);
        setRetryCount(0); // Reset retry count on success
      }
    } catch (error) {
  console.error('Failed to fetch notifications:', error);
  
  // ✅ Don't retry on 401/403 - these are auth errors, not transient failures
  const isAuthError = error?.message?.includes('auth token') || 
                      error?.message?.includes('Access denied');
  
  // ✅ Only retry if we have a user, haven't exceeded max retries, AND it's not an auth error
  if (user && retryCount < MAX_RETRIES && !isAuthError) {
        setRetryCount(prev => prev + 1);
        
        // ✅ Use exponential backoff for retries
        const retryDelay = Math.min(2000 * Math.pow(2, retryCount), 10000);
        
        setTimeout(() => {
          fetchNotifications();
        }, retryDelay);
      }
    } finally {
      setNotifLoading(false);
    }
  };

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
      toast.error('Failed to mark notification as read');
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all notifications as read');
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
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Bulk mark as read
  const bulkMarkAsRead = async (notificationIds) => {
    try {
      await Promise.all(notificationIds.map(id => notificationsApi.markAsRead(id)));
      
      let markedCount = 0;
      
      setNotifications(prev => {
        const updated = prev.map(n => {
          if (notificationIds.includes(n.id) && !n.isRead) {
            markedCount++;
            return { ...n, isRead: true };
          }
          return n;
        });
        return updated;
      });
      
      setUnreadCount(prev => Math.max(0, prev - markedCount));
      
      toast.success(`${notificationIds.length} notifications marked as read`);
    } catch (error) {
      console.error('Failed to bulk mark as read:', error);
      toast.error('Failed to mark notifications as read');
    }
  };

  // Bulk delete
  const bulkDeleteNotifications = async (notificationIds) => {
    try {
      await Promise.all(notificationIds.map(id => notificationsApi.deleteNotification(id)));
      
      let deletedUnreadCount = 0;
      
      setNotifications(prev => {
        const toDelete = prev.filter(n => notificationIds.includes(n.id));
        deletedUnreadCount = toDelete.filter(n => !n.isRead).length;
        return prev.filter(n => !notificationIds.includes(n.id));
      });
      
      setUnreadCount(prev => Math.max(0, prev - deletedUnreadCount));
      
      toast.success(`${notificationIds.length} notifications deleted`);
    } catch (error) {
      console.error('Failed to bulk delete:', error);
      toast.error('Failed to delete notifications');
    }
  };

  // Settings (localStorage - backend doesn't support this yet)
  const [settings, setSettings] = useState({
    sound: true,
    desktop: true,
    email: true,
  });

  const updateSettings = async (newSettings) => {
    setSettings(newSettings);
  };

  const getSettings = () => settings;

  // ✅ Effect 1: Fetch on mount when user is available
  useEffect(() => {
    if (!authLoading && user && !hasFetchedOnMount) {
      console.log('✅ Initial notification fetch');
      fetchNotifications();
      setHasFetchedOnMount(true);
    }
    
    // ✅ Reset hasFetchedOnMount when user logs out
    if (!user && hasFetchedOnMount) {
      setHasFetchedOnMount(false);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [authLoading, user, hasFetchedOnMount]);

  // ✅ Effect 2: Poll every 30 seconds ONLY when logged in and tab is visible
  useEffect(() => {
    // Don't poll if: loading, no user, or tab not visible
    if (authLoading || !user || !isTabVisible) {
      return;
    }

    console.log('🔄 Starting notification polling (30s interval)');
    
    const interval = setInterval(() => {
      console.log('⏰ Polling notifications...');
      fetchNotifications();
    }, 30000); // 30 seconds

    return () => {
      console.log('⏹️ Stopping notification polling');
      clearInterval(interval);
    };
  }, [authLoading, user, isTabVisible]);

  // ✅ Effect 3: Track tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsTabVisible(visible);
      
      // ✅ Fetch immediately when tab becomes visible again
      if (visible && user && !authLoading) {
        console.log('👀 Tab became visible - fetching notifications');
        fetchNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, authLoading]);

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