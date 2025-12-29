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
    'TASK_ASSIGNED': { color: 'text-blue-500', label: 'Task' },
    'TASK_RESPONSE': { color: 'text-green-500', label: 'Task Response' },
    'EVENT_INVITE': { color: 'text-purple-500', label: 'Event' },
    'MESSAGE': { color: 'text-cyan-500', label: 'Message' }, // ✅ Add
    'ANNOUNCEMENT': { color: 'text-orange-500', label: 'Announcement' }, // ✅ Add
  };
  return configs[type] || { color: 'text-gray-500', label: 'Notification' };
};