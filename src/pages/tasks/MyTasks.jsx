import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus, Search, Filter, Calendar, CheckSquare, 
  ArrowRight, MoreVertical, Clock, AlertCircle
} from "lucide-react";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import StatusBadge from "@/components/common/StatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, parseISO, isPast, isToday, isThisWeek } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { tasksApi } from "@/api/taskApi";
import { useToast } from "@/hooks/use-toast";

const MyTasks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await tasksApi.getTasks();
        const list = res.tasks || res.data?.tasks || res.data || [];
        // Tasks where I am an assignee
        const mine = list.filter((t) =>
          (t.assignees || []).some((a) => (a._id || a.id) === user?.id)
        );
        setTasks(
          mine.map((t) => ({
            id: t._id || t.id,
            title: t.title,
            description: t.description,
            priority: (t.priority || "medium").toLowerCase(),
            status: (t.status || "pending").toLowerCase(),
            dueDate: t.dueDate,
            createdAt: t.createdAt,
            tags: t.tags || [],
            estimatedHours: t.estimatedHours,
          }))
        );
      } catch (error) {
        toast({
          title: "Failed to load tasks",
          description:
            error?.message ||
            error?.data?.message ||
            "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id, toast]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesSearch =
          task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "all" || task.status === statusFilter;
        const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "dueDate":
            return new Date(a.dueDate) - new Date(b.dueDate);
          case "priority": {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
          }
          case "createdAt":
            return new Date(b.createdAt) - new Date(a.createdAt);
          default:
            return 0;
        }
      });
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy]);

  const getDueDateStatus = (dueDate) => {
    const date = parseISO(dueDate);
    if (isPast(date) && !isToday(date)) return "overdue";
    if (isToday(date)) return "today";
    if (isThisWeek(date)) return "thisWeek";
    return "upcoming";
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    inProgress: tasks.filter((t) => t.status === "in-progress" || t.status === "pending").length,
    overdue: tasks.filter((t) => getDueDateStatus(t.dueDate) === "overdue").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-semibold text-foreground">My Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage your personal tasks</p>
        </div>
        <Button asChild>
          <Link to="/tasks?create=task">
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Link>
        </Button>
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
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-semibold mt-1">{stats.inProgress}</p>
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
              <CheckSquare className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className={stats.overdue > 0 ? "border-red-500" : ""}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className={`text-2xl font-semibold mt-1 ${stats.overdue > 0 ? "text-red-600" : ""}`}>
                  {stats.overdue}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
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

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="createdAt">Recently Created</SelectItem>
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
              <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium mb-2">No tasks found</p>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first task to get started"}
              </p>
              {!searchQuery && statusFilter === "all" && priorityFilter === "all" && (
                <Button asChild>
                  <Link to="/tasks?create=task">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </Link>
                </Button>
              )}
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
                            <DropdownMenuItem>Change Status</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {task.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
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

export default MyTasks;

