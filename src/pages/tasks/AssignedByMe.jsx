import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search, Calendar, CheckSquare, Users, 
  ArrowRight, MoreVertical, Clock, AlertCircle, CheckCircle2
} from "lucide-react";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import StatusBadge from "@/components/common/StatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, parseISO, isPast, isToday } from "date-fns";
import { useAuth } from "../../context/AuthContext";

// Mock data - tasks assigned by the current user
const mockTasks = [
  {
    id: 201,
    title: "Review marketing campaign proposal",
    description: "Review and provide feedback on the Q1 marketing campaign proposal",
    priority: "high",
    status: "in-progress",
    dueDate: "2025-12-24",
    assignedTo: [
      { id: "1", name: "Sarah Johnson", avatar: "", status: "accepted" },
      { id: "2", name: "Mike Chen", avatar: "", status: "pending" },
    ],
    assignedAt: "2025-12-20",
    estimatedHours: 3
  },
  {
    id: 202,
    title: "Update design system documentation",
    description: "Document new components added to the design system",
    priority: "medium",
    status: "not-started",
    dueDate: "2025-12-26",
    assignedTo: [
      { id: "3", name: "Alex Rivera", avatar: "", status: "accepted" },
    ],
    assignedAt: "2025-12-21",
    estimatedHours: 4
  },
  {
    id: 203,
    title: "Create API integration tests",
    description: "Write comprehensive integration tests for the new API endpoints",
    priority: "high",
    status: "in-progress",
    dueDate: "2025-12-28",
    assignedTo: [
      { id: "4", name: "Emma Wilson", avatar: "", status: "accepted" },
      { id: "5", name: "David Kim", avatar: "", status: "accepted" },
    ],
    assignedAt: "2025-12-19",
    estimatedHours: 8
  },
  {
    id: 204,
    title: "Prepare monthly team report",
    description: "Compile team metrics and prepare monthly performance report",
    priority: "medium",
    status: "completed",
    dueDate: "2025-12-22",
    assignedTo: [
      { id: "2", name: "Mike Chen", avatar: "", status: "accepted" },
    ],
    assignedAt: "2025-12-18",
    estimatedHours: 2,
    completedAt: "2025-12-22"
  },
  {
    id: 205,
    title: "Design user feedback survey",
    description: "Create survey questions for gathering user feedback on new features",
    priority: "low",
    status: "not-started",
    dueDate: "2026-01-05",
    assignedTo: [
      { id: "1", name: "Sarah Johnson", avatar: "", status: "pending" },
    ],
    assignedAt: "2025-12-21",
    estimatedHours: 3
  },
];

const AssignedByMe = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getDueDateStatus = (dueDate) => {
    const date = parseISO(dueDate);
    if (isPast(date) && !isToday(date)) return "overdue";
    if (isToday(date)) return "today";
    return "upcoming";
  };

  const stats = {
    total: mockTasks.length,
    pending: mockTasks.filter(t => t.status === "not-started" || t.status === "in-progress").length,
    completed: mockTasks.filter(t => t.status === "completed").length,
    totalAssignees: mockTasks.reduce((sum, task) => sum + task.assignedTo.length, 0),
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-semibold text-foreground">Assigned by Me</h1>
        <p className="text-muted-foreground mt-1">Tasks you've assigned to team members</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-semibold mt-1">{stats.total}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-semibold mt-1">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-semibold mt-1">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assignees</p>
                <p className="text-2xl font-semibold mt-1">{stats.totalAssignees}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium mb-2">No tasks found</p>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your filters"
                  : "You haven't assigned any tasks yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map(task => {
            const dueStatus = getDueDateStatus(task.dueDate);
            const dueDateColor = 
              dueStatus === "overdue" ? "text-red-600" :
              dueStatus === "today" ? "text-orange-600" :
              "text-muted-foreground";

            const acceptedCount = task.assignedTo.filter(a => a.status === "accepted").length;
            const pendingCount = task.assignedTo.filter(a => a.status === "pending").length;

            return (
              <Card key={task.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <Link to={`/tasks/${task.id}`}>
                            <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                              {task.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/tasks/${task.id}`}>View Details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit Task</DropdownMenuItem>
                            <DropdownMenuItem>Reassign</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Assignees */}
                      <div className="flex items-center gap-2 mt-3">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Assigned to:</span>
                        <div className="flex -space-x-2">
                          {task.assignedTo.map(assignee => (
                            <Avatar
                              key={assignee.id}
                              className="h-6 w-6 border-2 border-background"
                              title={assignee.name}
                            >
                              <AvatarImage src={assignee.avatar} />
                              <AvatarFallback className="text-xs">
                                {assignee.name[0]}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ({acceptedCount} accepted{pendingCount > 0 ? `, ${pendingCount} pending` : ""})
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-4">
                        <PriorityBadge priority={task.priority} />
                        <StatusBadge status={task.status} />
                        <div className={`flex items-center gap-1 text-sm ${dueDateColor}`}>
                          <Calendar className="h-4 w-4" />
                          <span>
                            Due: {format(parseISO(task.dueDate), "MMM d, yyyy")}
                            {dueStatus === "overdue" && " (Overdue)"}
                            {dueStatus === "today" && " (Today)"}
                          </span>
                        </div>
                        {task.estimatedHours && (
                          <Badge variant="outline" className="text-xs">
                            {task.estimatedHours}h estimated
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/tasks/${task.id}`}>
                        View <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AssignedByMe;

