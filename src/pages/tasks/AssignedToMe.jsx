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
  Search, Calendar, CheckSquare, CheckCircle2, XCircle,
  ArrowRight, MoreVertical, Clock, User, AlertCircle
} from "lucide-react";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, parseISO, isPast, isToday } from "date-fns";
import { useAuth } from "../../context/AuthContext";

// Mock data - tasks assigned by others
const mockTasks = [
  {
    id: 101,
    title: "Review PR #234 - Authentication refactor",
    description: "Please review the authentication refactoring PR and provide feedback",
    priority: "high",
    status: "pending",
    dueDate: "2025-12-24",
    assignedBy: {
      id: "1",
      name: "Sarah Johnson",
      avatar: "",
      email: "sarah@example.com"
    },
    assignedAt: "2025-12-20",
    estimatedHours: 2
  },
  {
    id: 102,
    title: "Update API documentation",
    description: "Document the new endpoints added in the last sprint",
    priority: "medium",
    status: "pending",
    dueDate: "2025-12-26",
    assignedBy: {
      id: "2",
      name: "Mike Chen",
      avatar: "",
      email: "mike@example.com"
    },
    assignedAt: "2025-12-21",
    estimatedHours: 4
  },
  {
    id: 103,
    title: "Write unit tests for payment module",
    description: "Add comprehensive test coverage for the payment processing module",
    priority: "high",
    status: "accepted",
    dueDate: "2025-12-28",
    assignedBy: {
      id: "3",
      name: "Alex Rivera",
      avatar: "",
      email: "alex@example.com"
    },
    assignedAt: "2025-12-19",
    estimatedHours: 6,
    acceptedAt: "2025-12-20"
  },
  {
    id: 104,
    title: "Design user onboarding flow",
    description: "Create wireframes and user flow for new user onboarding",
    priority: "medium",
    status: "accepted",
    dueDate: "2026-01-05",
    assignedBy: {
      id: "1",
      name: "Sarah Johnson",
      avatar: "",
      email: "sarah@example.com"
    },
    assignedAt: "2025-12-18",
    estimatedHours: 8,
    acceptedAt: "2025-12-18"
  },
  {
    id: 105,
    title: "Fix bug in search functionality",
    description: "Investigate and fix the issue where search results are not filtering correctly",
    priority: "high",
    status: "declined",
    dueDate: "2025-12-23",
    assignedBy: {
      id: "4",
      name: "Emma Wilson",
      avatar: "",
      email: "emma@example.com"
    },
    assignedAt: "2025-12-17",
    reasonDeclined: "Already working on similar feature"
  },
];

const AssignedToMe = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [tasks, setTasks] = useState(mockTasks);

  const handleAccept = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, status: "accepted", acceptedAt: new Date().toISOString().split("T")[0] }
          : task
      )
    );
    // API call here
  };

  const handleDecline = (taskId, reason) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, status: "declined", reasonDeclined: reason }
          : task
      )
    );
    // API call here
  };

  const filteredTasks = tasks.filter(task => {
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
    total: tasks.length,
    pending: tasks.filter(t => t.status === "pending").length,
    accepted: tasks.filter(t => t.status === "accepted").length,
    declined: tasks.filter(t => t.status === "declined").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-semibold text-foreground">Assigned to Me</h1>
        <p className="text-muted-foreground mt-1">Tasks assigned by team members</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-semibold mt-1">{stats.total}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className={stats.pending > 0 ? "border-orange-500" : ""}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className={`text-2xl font-semibold mt-1 ${stats.pending > 0 ? "text-orange-600" : ""}`}>
                  {stats.pending}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accepted</p>
                <p className="text-2xl font-semibold mt-1">{stats.accepted}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Declined</p>
                <p className="text-2xl font-semibold mt-1">{stats.declined}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500 opacity-50" />
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
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
              <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium mb-2">No tasks assigned to you</p>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Tasks assigned to you will appear here"}
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

            return (
              <Card 
                key={task.id} 
                className={`card-hover ${
                  task.status === "pending" ? "border-orange-500/50" :
                  task.status === "declined" ? "border-red-500/50 opacity-75" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={task.assignedBy.avatar} />
                      <AvatarFallback>{task.assignedBy.name[0]}</AvatarFallback>
                    </Avatar>

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
                            {task.status === "pending" && (
                              <>
                                <DropdownMenuItem onClick={() => handleAccept(task.id)}>
                                  Accept Task
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDecline(task.id, "Not available")}>
                                  Decline Task
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Assigned by {task.assignedBy.name}</span>
                        </div>
                        <PriorityBadge priority={task.priority} />
                        <Badge variant={
                          task.status === "pending" ? "outline" :
                          task.status === "accepted" ? "default" :
                          "destructive"
                        }>
                          {task.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                          {task.status === "accepted" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {task.status === "declined" && <XCircle className="h-3 w-3 mr-1" />}
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </Badge>
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

                      {task.status === "declined" && task.reasonDeclined && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                          <p className="text-sm text-red-800 dark:text-red-200">
                            <strong>Declined reason:</strong> {task.reasonDeclined}
                          </p>
                        </div>
                      )}
                    </div>

                    {task.status === "pending" && (
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAccept(task.id)}
                          className="whitespace-nowrap"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDecline(task.id, "Not available")}
                          className="whitespace-nowrap"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    )}

                    {task.status === "accepted" && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/tasks/${task.id}`}>
                          View <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    )}
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

export default AssignedToMe;

