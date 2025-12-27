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
import { tasksApi } from "@/api/taskApi";
import { toast } from "sonner";


const AssignedToMe = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

useEffect(() => {
  const load = async () => {
    setLoading(true);
    try {
      const res = await tasksApi.getTasks();
      const list = res.tasks || res.data?.tasks || res.data || [];
      // Keep only tasks where current user is an assignee
      const mine = list.filter((t) =>
        (t.assignees || []).some((a) => (a._id || a.id) === user?.id)
      );
      setTasks(
        mine.map((t) => ({
          id: t._id || t.id,
          title: t.title,
          description: t.description,
          priority: (t.priority || "medium").toLowerCase(),
          status: t.status || "Pending", // ✅ REMOVE .toLowerCase() here
          dueDate: t.dueDate,
          assignedBy: t.createdBy || {},
          assignedAt: t.createdAt,
          estimatedHours: t.estimatedHours,
        }))
      );
    } catch (error) {
      toast.error("Failed to load tasks", {
        description:
          error?.message ||
          error?.data?.message ||
          "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };
  load();
}, [user?.id]);

const handleAccept = (taskId) => {
  tasksApi
    .acceptTask(taskId)
    .then(() => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, status: "In-Progress", acceptedAt: new Date().toISOString() } // ✅ Changed from "accepted"
            : task
        )
      );
      toast.success("Task accepted");
    })
    .catch((error) =>
      toast.error("Failed to accept task", {
        description: error?.message || error?.data?.message,
      })
    );
};

const handleDecline = (taskId, reason) => {
  tasksApi
    .rejectTask(taskId, reason || "No reason provided")
    .then(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? { ...task, status: "Rejected", reasonDeclined: reason } // ✅ Changed from "declined"
            : task
        )
      );
      toast.success("Task declined");
    })
    .catch((error) =>
      toast.error("Failed to decline task", {
        description: error?.message || error?.data?.message,
      })
    );
};

const filteredTasks = useMemo(() => {
  return tasks.filter((task) => {
    const matchesSearch =
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // ✅ Fix status matching to use backend values
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
  pending: tasks.filter((t) => t.status === "Pending").length, // ✅ Changed from "pending"
  accepted: tasks.filter((t) => t.status === "In-Progress").length, // ✅ Changed from "accepted"
  declined: tasks.filter((t) => t.status === "Rejected").length, // ✅ Changed from "declined"
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
  <SelectItem value="Pending">Pending</SelectItem>
  <SelectItem value="In-Progress">In Progress</SelectItem>
  <SelectItem value="Completed">Completed</SelectItem>
  <SelectItem value="Rejected">Rejected</SelectItem>
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
  task.status === "Pending" ? "border-orange-500/50" :       // ✅ Changed
  task.status === "Rejected" ? "border-red-500/50 opacity-75" : ""  // ✅ Changed
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
                            {task.status === "Pending" && (  // ✅ Changed from "pending"
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
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Assigned by {task.assignedBy.name}</span>
                        </div>
                        <PriorityBadge priority={task.priority} />
                            <Badge 
  variant={
    task.status === "Pending" ? "outline" :
    task.status === "In-Progress" ? "default" :
    task.status === "Rejected" ? "destructive" :
    "default" // For Completed
  }
  className={task.status === "Completed" ? "bg-green-500 text-white hover:bg-green-600" : ""}
>
  {task.status === "Pending" && <Clock className="h-3 w-3 mr-1" />}
  {task.status === "In-Progress" && <CheckCircle2 className="h-3 w-3 mr-1" />}
  {task.status === "Completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
  {task.status === "Rejected" && <XCircle className="h-3 w-3 mr-1" />}
  {task.status}
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

                      {task.status === "Rejected" && task.reasonDeclined && (  // ✅ Changed from "declined"
  <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
    <p className="text-sm text-red-800 dark:text-red-200">
      <strong>Declined reason:</strong> {task.reasonDeclined}
    </p>
  </div>
)}
                    </div>

                    {task.status === "Pending" && (
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

                    {task.status === "In-Progress" && (  // ✅ Changed from "accepted"
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

