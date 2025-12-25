import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, MoreVertical, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import StatusBadge from "../../components/common/StatusBadge";
import CreateTaskForm from "../../components/forms/CreateTaskForms";
import { tasksApi } from "@/api/taskApi";
import { useToast } from "@/hooks/use-toast";

const TaskLists = () => {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch tasks from backend
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await tasksApi.getTasks();
        setTasks(response.data.tasks);
      } catch (error) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load tasks",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [refreshTrigger, toast]);

  // Group tasks by status (backend uses: Pending, In-Progress, Completed, Rejected)
  const tasksByStatus = {
    todo: tasks.filter(t => t.status === "Pending"),
    inProgress: tasks.filter(t => t.status === "In-Progress"),
    completed: tasks.filter(t => t.status === "Completed"),
    rejected: tasks.filter(t => t.status === "Rejected"),
  };

  // Calculate stats
  const stats = {
    total: tasks.length,
    dueThisWeek: tasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return dueDate >= today && dueDate <= weekFromNow;
    }).length,
    completionRate: tasks.length > 0 
      ? Math.round((tasksByStatus.completed.length / tasks.length) * 100) 
      : 0,
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await tasksApi.deleteTask(taskId);
      toast({
        title: "Task deleted",
        description: "The task has been successfully deleted.",
      });
      setRefreshTrigger(prev => prev + 1); // Refresh task list
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  // Handle task status change
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksApi.updateTask(taskId, { status: newStatus });
      toast({
        title: "Status updated",
        description: "Task status has been updated successfully.",
      });
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  // Handle task creation success
  const handleTaskCreated = () => {
    setIsCreateOpen(false);
    setRefreshTrigger(prev => prev + 1); // Refresh task list
  };

  const TaskCard = ({ task }) => {
    // Calculate if task is overdue
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Completed";
    
    return (
      <Card className={`card-hover ${isOverdue ? 'border-l-4 border-l-destructive' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{task.title}</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {task.description || "No description"}
              </p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <PriorityBadge priority={task.priority?.toLowerCase() || 'medium'} />
                <span className={`text-xs ${isOverdue ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                  Due: {new Date(task.dueDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
                {isOverdue && (
                  <span className="text-xs text-destructive font-semibold">⚠️ Overdue</span>
                )}
              </div>
              {task.assignees?.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Assigned to: {task.assignees.map(a => a.name).join(', ')}
                </p>
              )}
              {task.rejectionReason && (
                <p className="text-xs text-destructive mt-2">
                  Rejection: {task.rejectionReason}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  // TODO: Open edit modal
                  toast({ title: "Edit feature coming soon" });
                }}>
                  Edit Task
                </DropdownMenuItem>
                
                {/* Status change options */}
                {task.status === "Pending" && (
                  <DropdownMenuItem onClick={() => handleStatusChange(task._id, "In-Progress")}>
                    Mark as In Progress
                  </DropdownMenuItem>
                )}
                {task.status === "In-Progress" && (
                  <DropdownMenuItem onClick={() => handleStatusChange(task._id, "Completed")}>
                    Mark as Completed
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={() => handleDeleteTask(task._id)} className="text-destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold text-foreground">My Task Lists</h1>
          <p className="text-muted-foreground mt-1">Manage and track all your tasks</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-primary">Create Task</DialogTitle>
            </DialogHeader>
            <CreateTaskForm onClose={handleTaskCreated} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Weekly Task Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Task Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.dueThisWeek}</p>
                <p className="text-sm text-muted-foreground">Due this week</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{stats.completionRate}%</p>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Board */}
      <Tabs defaultValue="board" className="w-full">
        <TabsList>
          <TabsTrigger value="board">Board View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pending Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                  Pending
                  <span className="text-muted-foreground">({tasksByStatus.todo.length})</span>
                </h3>
              </div>
              <div className="space-y-3">
                {tasksByStatus.todo.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No pending tasks</p>
                ) : (
                  tasksByStatus.todo.map(task => (
                    <TaskCard key={task._id} task={task} />
                  ))
                )}
              </div>
            </div>

            {/* In Progress Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  In Progress
                  <span className="text-muted-foreground">({tasksByStatus.inProgress.length})</span>
                </h3>
              </div>
              <div className="space-y-3">
                {tasksByStatus.inProgress.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No tasks in progress</p>
                ) : (
                  tasksByStatus.inProgress.map(task => (
                    <TaskCard key={task._id} task={task} />
                  ))
                )}
              </div>
            </div>

            {/* Completed Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  Completed
                  <span className="text-muted-foreground">({tasksByStatus.completed.length})</span>
                </h3>
              </div>
              <div className="space-y-3">
                {tasksByStatus.completed.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No completed tasks</p>
                ) : (
                  tasksByStatus.completed.map(task => (
                    <TaskCard key={task._id} task={task} />
                  ))
                )}
              </div>
            </div>

            {/* Rejected Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-destructive" />
                  Rejected
                  <span className="text-muted-foreground">({tasksByStatus.rejected.length})</span>
                </h3>
              </div>
              <div className="space-y-3">
                {tasksByStatus.rejected.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No rejected tasks</p>
                ) : (
                  tasksByStatus.rejected.map(task => (
                    <TaskCard key={task._id} task={task} />
                  ))
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No tasks found</p>
                ) : (
                  tasks.map(task => (
                    <div key={task._id} className="flex items-center gap-4 p-4 hover:bg-accent/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{task.description || "No description"}</p>
                        {task.assignees?.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Assigned to: {task.assignees.map(a => a.name).join(', ')}
                          </p>
                        )}
                      </div>
                      <PriorityBadge priority={task.priority?.toLowerCase() || 'medium'} />
                      <StatusBadge status={task.status} />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(task.dueDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast({ title: "Edit feature coming soon" })}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteTask(task._id)} className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskLists;