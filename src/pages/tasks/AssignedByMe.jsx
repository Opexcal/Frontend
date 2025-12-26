import { useEffect, useMemo, useState } from "react";
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
import { tasksApi } from "@/api/taskApi";
import { toast } from "sonner";


const AssignedByMe = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await tasksApi.getTasks();
        const list = res.tasks || res.data?.tasks || res.data || [];
        const mine = list.filter(
          (t) => (t.createdBy?._id || t.createdBy?.id || t.createdBy) === user?.id
        );
        setTasks(
          mine.map((t) => ({
            id: t._id || t.id,
            title: t.title,
            description: t.description,
            priority: (t.priority || "medium").toLowerCase(),
            status: (t.status || "pending").toLowerCase(),
            dueDate: t.dueDate,
            assignedTo:
              (t.assignees || []).map((a) => ({
                id: a._id || a.id,
                name: a.name,
                avatar: a.avatar,
                status: a.status || "accepted",
              })) || [],
            assignedAt: t.createdAt,
            estimatedHours: t.estimatedHours,
            completedAt: t.completedAt,
          }))
        );
      } catch (error) {
        toast.error("Failed to load tasks", {
          description:
            error?.message ||
            error?.data?.message ||
            "Please try again later.",
        });
        ;
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  const getDueDateStatus = (dueDate) => {
    const date = parseISO(dueDate);
    if (isPast(date) && !isToday(date)) return "overdue";
    if (isToday(date)) return "today";
    return "upcoming";
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "not-started" || t.status === "in-progress" || t.status === "pending").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    totalAssignees: tasks.reduce((sum, task) => sum + (task.assignedTo?.length || 0), 0),
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
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Loading tasks...</p>
            </CardContent>
          </Card>
        ) : filteredTasks.length === 0 ? (
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

