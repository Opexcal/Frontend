import { isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';


export const groupNotificationsByDate = (notifications) => {
  const groups = {
    today: [],
    yesterday: [],
    thisWeek: [],
    earlier: []
  };

  notifications.forEach(notification => {
    const date = new Date(notification.createdAt || notification.timestamp);
    
    if (isToday(date)) {
      groups.today.push(notification);
    } else if (isYesterday(date)) {
      groups.yesterday.push(notification);
    } else if (isThisWeek(date, { weekStartsOn: 1 })) {
      groups.thisWeek.push(notification);
    } else {
      groups.earlier.push(notification);
    }
  });

  return groups;
};


export const getNotificationTypeConfig = (type) => {
  const configs = {
    // Backend types (uppercase)
    'TASK_ASSIGNED': {
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      label: 'Task Assignment'
    },
    'TASK_RESPONSE': {
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'Task Response'
    },
    'EVENT_INVITE': {
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      label: 'Event Invitation'
    },
    // Frontend types (lowercase) - for backwards compatibility
    'task_assigned': {
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      label: 'Task Assignment'
    },
    'task_response': {
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'Task Response'
    },
    'event_invite': {
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      label: 'Event Invitation'
    },
    // ... other types
  };
  
  return configs[type] || {
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    label: 'Notification'
  };
};