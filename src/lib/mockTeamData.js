/**
 * Mock data for team management features
 */

export const mockTeamMembers = [
  {
    id: "user-001",
    name: "John Doe",
    email: "john.doe@opexcal.com",
    role: "staff",
    avatar: "",
    taskCount: 5,
    completedCount: 3,
    overdueCount: 1,
    joinedDate: "2025-01-15",
  },
  {
    id: "user-002",
    name: "Jane Smith",
    email: "jane.smith@opexcal.com",
    role: "staff",
    avatar: "",
    taskCount: 3,
    completedCount: 3,
    overdueCount: 0,
    joinedDate: "2025-02-01",
  },
  {
    id: "user-003",
    name: "Mike Johnson",
    email: "mike.johnson@opexcal.com",
    role: "staff",
    avatar: "",
    taskCount: 6,
    completedCount: 4,
    overdueCount: 2,
    joinedDate: "2024-11-10",
  },
  {
    id: "user-004",
    name: "Sarah Williams",
    email: "sarah.williams@opexcal.com",
    role: "staff",
    avatar: "",
    taskCount: 4,
    completedCount: 4,
    overdueCount: 0,
    joinedDate: "2024-12-05",
  },
];

export const mockTeamTasks = [
  {
    id: "task-001",
    title: "Prepare Q4 Financial Report",
    description: "Complete quarterly financial analysis and create presentation",
    assigneeId: "user-001",
    assigneeName: "John Doe",
    assignedById: "admin-001",
    assignedByName: "Sarah Johnson",
    priority: "high",
    status: "in_progress",
    dueDate: "2025-12-25",
    createdDate: "2025-12-10",
    completedDate: null,
    conferenceLink: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: "task-002",
    title: "Client Presentation Preparation",
    description: "Prepare slides for client presentation on project status",
    assigneeId: "user-002",
    assigneeName: "Jane Smith",
    assignedById: "admin-001",
    assignedByName: "Sarah Johnson",
    priority: "medium",
    status: "not_started",
    dueDate: "2025-12-23",
    createdDate: "2025-12-18",
    completedDate: null,
    conferenceLink: null,
  },
  {
    id: "task-003",
    title: "API Documentation Update",
    description: "Update API documentation for v2.0 release",
    assigneeId: "user-003",
    assigneeName: "Mike Johnson",
    assignedById: "admin-001",
    assignedByName: "Sarah Johnson",
    priority: "high",
    status: "in_progress",
    dueDate: "2025-12-20",
    createdDate: "2025-12-08",
    completedDate: null,
    conferenceLink: null,
  },
  {
    id: "task-004",
    title: "Design Review - Dashboard UI",
    description: "Review and provide feedback on new dashboard design",
    assigneeId: "user-004",
    assigneeName: "Sarah Williams",
    assignedById: "admin-001",
    assignedByName: "Sarah Johnson",
    priority: "low",
    status: "completed",
    dueDate: "2025-12-19",
    createdDate: "2025-12-05",
    completedDate: "2025-12-19",
    conferenceLink: null,
  },
  {
    id: "task-005",
    title: "Database Optimization",
    description: "Optimize database queries for improved performance",
    assigneeId: "user-001",
    assigneeName: "John Doe",
    assignedById: "admin-001",
    assignedByName: "Sarah Johnson",
    priority: "high",
    status: "not_started",
    dueDate: "2025-12-22",
    createdDate: "2025-12-12",
    completedDate: null,
    conferenceLink: null,
  },
  {
    id: "task-006",
    title: "Bug Fix - Login Page",
    description: "Fix authentication issue on login page",
    assigneeId: "user-003",
    assigneeName: "Mike Johnson",
    assignedById: "admin-001",
    assignedByName: "Sarah Johnson",
    priority: "medium",
    status: "completed",
    dueDate: "2025-12-18",
    createdDate: "2025-12-10",
    completedDate: "2025-12-18",
    conferenceLink: null,
  },
];

export const mockTeamEvents = [
  {
    id: "event-001",
    title: "Team Sync Meeting",
    description: "Weekly team synchronization meeting",
    startDate: "2025-12-22T10:00:00Z",
    endDate: "2025-12-22T10:30:00Z",
    type: "meeting",
    attendees: ["user-001", "user-002", "user-003", "user-004"],
    conferenceLink: "https://meet.google.com/xyz-uvwx-rst",
    isTeamEvent: true,
  },
  {
    id: "event-002",
    title: "Q4 Review",
    description: "Quarterly performance review and planning",
    startDate: "2025-12-23T14:00:00Z",
    endDate: "2025-12-23T15:30:00Z",
    type: "review",
    attendees: ["user-001", "user-003"],
    conferenceLink: null,
    isTeamEvent: true,
  },
  {
    id: "event-003",
    title: "Sprint Planning",
    description: "Plan next sprint objectives and tasks",
    startDate: "2025-12-20T09:00:00Z",
    endDate: "2025-12-20T10:00:00Z",
    type: "planning",
    attendees: ["user-001", "user-002", "user-003", "user-004"],
    conferenceLink: "https://meet.google.com/abc-defg-hij",
    isTeamEvent: true,
  },
];

export const mockAssignments = [
  {
    id: "assign-001",
    taskId: "task-001",
    taskTitle: "Prepare Q4 Financial Report",
    assignedTo: "user-001",
    assignedToName: "John Doe",
    assignedBy: "admin-001",
    assignedByName: "Sarah Johnson",
    status: "pending",
    priority: "high",
    dueDate: "2025-12-25",
    createdDate: "2025-12-20T08:00:00Z",
    declineReason: null,
  },
  {
    id: "assign-002",
    taskId: "task-002",
    taskTitle: "Client Presentation Preparation",
    assignedTo: "user-002",
    assignedToName: "Jane Smith",
    assignedBy: "admin-001",
    assignedByName: "Sarah Johnson",
    status: "accepted",
    priority: "medium",
    dueDate: "2025-12-23",
    createdDate: "2025-12-20T10:00:00Z",
    declineReason: null,
  },
  {
    id: "assign-003",
    taskId: "task-005",
    taskTitle: "Database Optimization",
    assignedTo: "user-001",
    assignedToName: "John Doe",
    assignedBy: "admin-001",
    assignedByName: "Sarah Johnson",
    status: "pending",
    priority: "high",
    dueDate: "2025-12-22",
    createdDate: "2025-12-20T09:00:00Z",
    declineReason: null,
  },
];

export const mockTeamStats = {
  totalTasks: 24,
  notStarted: 8,
  inProgress: 8,
  completed: 8,
  overdue: 3,
  completionRate: 75,
  teamSize: 4,
};

export const mockReportData = {
  dateRange: { start: "2025-11-20", end: "2025-12-20" },
  completionRate: 75,
  tasksByStatus: [
    { status: "Completed", count: 18 },
    { status: "In Progress", count: 12 },
    { status: "Not Started", count: 6 },
  ],
  tasksByPriority: [
    { priority: "High", count: 10, percentage: 35 },
    { priority: "Medium", count: 12, percentage: 40 },
    { priority: "Low", count: 6, percentage: 25 },
  ],
  memberPerformance: [
    {
      memberId: "user-001",
      name: "John Doe",
      assigned: 12,
      completed: 9,
      rate: 75,
    },
    {
      memberId: "user-002",
      name: "Jane Smith",
      assigned: 8,
      completed: 8,
      rate: 100,
    },
    {
      memberId: "user-003",
      name: "Mike Johnson",
      assigned: 11,
      completed: 8,
      rate: 73,
    },
    {
      memberId: "user-004",
      name: "Sarah Williams",
      assigned: 9,
      completed: 9,
      rate: 100,
    },
  ],
  overdueTrend: [
    { date: "2025-11-20", count: 5 },
    { date: "2025-11-27", count: 4 },
    { date: "2025-12-04", count: 3 },
    { date: "2025-12-11", count: 4 },
    { date: "2025-12-18", count: 3 },
  ],
};

export const getTeamDashboard = () => ({
  stats: mockTeamStats,
  members: mockTeamMembers,
  upcomingDeadlines: mockTeamTasks
    .filter((t) => new Date(t.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5),
});

export const getTeamTasks = (filters = {}) => {
  let tasks = [...mockTeamTasks];

  if (filters.status && filters.status !== "all") {
    tasks = tasks.filter((t) => t.status === filters.status);
  }

  if (filters.priority && filters.priority !== "all") {
    tasks = tasks.filter((t) => t.priority === filters.priority);
  }

  if (filters.assignee) {
    tasks = tasks.filter((t) => t.assigneeId === filters.assignee);
  }

  return tasks;
};

export const getPendingAssignments = () => {
  return mockAssignments.filter((a) => a.status === "pending");
};
