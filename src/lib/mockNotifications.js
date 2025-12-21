/**
 * Mock notifications data for testing and development
 */

export const mockNotifications = [
  {
    id: "1",
    type: "task_assigned",
    title: "New task assigned",
    message: "You were assigned task 'Prepare Q4 Financial Report'",
    timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(), // 2.5 hours ago
    isRead: false,
    priority: "high",
    actionUrl: "/tasks/123",
    actor: {
      id: "2",
      name: "Alice Johnson",
      avatar: "",
    },
    metadata: {
      taskId: "123",
      taskTitle: "Prepare Q4 Financial Report",
      dueDate: "2025-12-25",
    },
  },
  {
    id: "2",
    type: "event_invite",
    title: "Event invitation",
    message: "You're invited to 'Team Sync Meeting' on Dec 22 at 10:00 AM",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    isRead: false,
    priority: "medium",
    actionUrl: "/events/456",
    actor: {
      id: "3",
      name: "Bob Smith",
      avatar: "",
    },
    metadata: {
      eventId: "456",
      eventTitle: "Team Sync Meeting",
      eventDate: "2025-12-22T10:00:00Z",
    },
  },
  {
    id: "3",
    type: "task_completed",
    title: "Task completed",
    message: "John Doe completed task 'Design API Architecture'",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isRead: true,
    priority: "low",
    actionUrl: "/tasks/789",
    actor: {
      id: "4",
      name: "John Doe",
      avatar: "",
    },
  },
  {
    id: "4",
    type: "deadline_reminder",
    title: "Task deadline approaching",
    message: "Task 'Complete Marketing Campaign' is due in 2 days",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    isRead: false,
    priority: "high",
    actionUrl: "/tasks/321",
    metadata: {
      taskId: "321",
      taskTitle: "Complete Marketing Campaign",
      dueDate: "2025-12-22",
    },
  },
  {
    id: "5",
    type: "mention",
    title: "You were mentioned",
    message: "Alice Johnson mentioned you in a comment on 'Budget Review'",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    isRead: true,
    priority: "medium",
    actionUrl: "/tasks/654#comment-89",
    actor: {
      id: "2",
      name: "Alice Johnson",
      avatar: "",
    },
  },
  {
    id: "6",
    type: "group_added",
    title: "Added to group",
    message: "You were added to 'Product Design' group",
    timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 3 days ago
    isRead: true,
    priority: "low",
    actionUrl: "/admin/groups/777",
    actor: {
      id: "1",
      name: "Admin User",
      avatar: "",
    },
  },
  {
    id: "7",
    type: "system_update",
    title: "New features available",
    message: "Check out our new advanced reporting dashboard",
    timestamp: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(), // 5 days ago
    isRead: false,
    priority: "low",
    actionUrl: "/reports",
    isSystem: true,
  },
  {
    id: "8",
    type: "event_reminder",
    title: "Event starting soon",
    message: "Event 'Sprint Planning' starts in 1 hour",
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
    isRead: false,
    priority: "high",
    actionUrl: "/events/999",
    metadata: {
      eventId: "999",
      eventTitle: "Sprint Planning",
      eventDate: "2025-12-20T10:00:00Z",
    },
  },
];

/**
 * Group notifications by date
 */
export const groupNotificationsByDate = (notifications) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups = {
    today: [],
    yesterday: [],
    thisWeek: [],
    earlier: [],
  };

  notifications.forEach((notification) => {
    const notifDate = new Date(notification.timestamp);
    notifDate.setHours(0, 0, 0, 0);

    if (notifDate.getTime() === today.getTime()) {
      groups.today.push(notification);
    } else if (notifDate.getTime() === yesterday.getTime()) {
      groups.yesterday.push(notification);
    } else if (notifDate.getTime() > weekAgo.getTime()) {
      groups.thisWeek.push(notification);
    } else {
      groups.earlier.push(notification);
    }
  });

  return groups;
};

/**
 * Filter notifications by type
 */
export const filterNotificationsByType = (notifications, type) => {
  if (type === "all") return notifications;
  return notifications.filter((n) => n.type === type);
};

/**
 * Get notification icon config
 */
export const getNotificationTypeConfig = (type) => {
  const config = {
    task_assigned: {
      icon: "CheckSquare",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      label: "Task Assigned",
    },
    task_completed: {
      icon: "CheckCircle2",
      color: "text-green-600",
      bgColor: "bg-green-50",
      label: "Task Completed",
    },
    event_invite: {
      icon: "Calendar",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      label: "Event Invite",
    },
    event_reminder: {
      icon: "Bell",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      label: "Event Reminder",
    },
    mention: {
      icon: "AtSign",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      label: "Mention",
    },
    deadline_reminder: {
      icon: "AlertCircle",
      color: "text-red-600",
      bgColor: "bg-red-50",
      label: "Deadline",
    },
    group_added: {
      icon: "Users",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      label: "Group Added",
    },
    system_update: {
      icon: "Info",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      label: "System Update",
    },
  };

  return config[type] || config.system_update;
};
