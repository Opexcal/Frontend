/**
 * Team-related utility functions
 */

export const formatTaskDueDate = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const daysUntilDue = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

  if (daysUntilDue < 0) {
    return `Overdue by ${Math.abs(daysUntilDue)} day${daysUntilDue !== -1 ? "s" : ""}`;
  }

  if (daysUntilDue === 0) {
    return "Due today";
  }

  if (daysUntilDue === 1) {
    return "Due tomorrow";
  }

  return `Due in ${daysUntilDue} days`;
};

export const calculateCompletionRate = (assigned, completed) => {
  if (assigned === 0) return 0;
  return Math.round((completed / assigned) * 100);
};

export const groupTasksByStatus = (tasks) => {
  return {
    notStarted: tasks.filter((t) => t.status === "not_started"),
    inProgress: tasks.filter((t) => t.status === "in_progress"),
    completed: tasks.filter((t) => t.status === "completed"),
  };
};

export const getTaskStats = (tasks) => {
  const now = new Date();
  return {
    total: tasks.length,
    notStarted: tasks.filter((t) => t.status === "not_started").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    overdue: tasks.filter((t) => new Date(t.dueDate) < now).length,
    completionRate: Math.round(
      (tasks.filter((t) => t.status === "completed").length / tasks.length) * 100
    ),
  };
};

export const sortTasksByPriority = (tasks) => {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return [...tasks].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
};

export const sortTasksByDueDate = (tasks) => {
  return [...tasks].sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
  );
};

export const getMemberMetrics = (members, tasks) => {
  return members.map((member) => {
    const memberTasks = tasks.filter((t) => t.assigneeId === member.id);
    const completedTasks = memberTasks.filter(
      (t) => t.status === "completed"
    );

    return {
      ...member,
      assignedCount: memberTasks.length,
      completedCount: completedTasks.length,
      completionRate: calculateCompletionRate(
        memberTasks.length,
        completedTasks.length
      ),
      overdueCount: memberTasks.filter(
        (t) => new Date(t.dueDate) < new Date()
      ).length,
    };
  });
};

export const generateTaskReport = (tasks, dateRange) => {
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);

  const tasksInRange = tasks.filter((t) => {
    const taskDate = new Date(t.createdDate);
    return taskDate >= startDate && taskDate <= endDate;
  });

  return {
    total: tasksInRange.length,
    completed: tasksInRange.filter((t) => t.status === "completed").length,
    inProgress: tasksInRange.filter((t) => t.status === "in_progress").length,
    notStarted: tasksInRange.filter((t) => t.status === "not_started").length,
    completionRate: Math.round(
      (tasksInRange.filter((t) => t.status === "completed").length /
        tasksInRange.length) *
        100
    ) || 0,
    byPriority: {
      high: tasksInRange.filter((t) => t.priority === "high").length,
      medium: tasksInRange.filter((t) => t.priority === "medium").length,
      low: tasksInRange.filter((t) => t.priority === "low").length,
    },
  };
};
