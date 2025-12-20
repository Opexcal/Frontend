import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, MoreVertical, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import  StatusBadge  from "../../components/common/StatusBadge";
import  CreateTaskForm from "../../components/forms/CreateTaskForms";

// Mock data
const mockTasks = [
  {
    id: 1,
    title: "Prepare Q3 Financial Report",
    description: "Compile all financial data and create comprehensive report",
    priority: "high",
    status: "in-progress",
    dueDate: "Oct 15, 2025",
    assignee: "John Doe",
  },
  {
    id: 2,
    title: "Design API Architecture",
    description: "Create scalable API design for new microservices",
    priority: "high",
    status: "not-started",
    dueDate: "Oct 18, 2025",
    assignee: "Jane Smith",
  },
  {
    id: 3,
    title: "Complete Marketing Campaign",
    description: "Finalize materials for Q4 marketing campaign",
    priority: "medium",
    status: "in-progress",
    dueDate: "Oct 20, 2025",
    assignee: "Mike Johnson",
  },
  {
    id: 4,
    title: "Update Documentation",
    description: "Review and update all project documentation",
    priority: "low",
    status: "not-started",
    dueDate: "Oct 25, 2025",
  },
  {
    id: 5,
    title: "Code Review: Feature Branch",
    description: "Review and approve pending pull requests",
    priority: "medium",
    status: "completed",
    dueDate: "Oct 10, 2025",
    assignee: "Sarah Wilson",
  },
];

const TaskLists = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [tasks] = useState(mockTasks);

  const tasksByStatus = {
    todo: tasks.filter(t => t.status === "not-started"),
    inProgress: tasks.filter(t => t.status === "in-progress"),
    onHold: tasks.filter(t => t.status === "on-hold"),
    completed: tasks.filter(t => t.status === "completed"),
  };

  const stats = {
    total: tasks.length,
    dueThisWeek: 9,
    completionRate: Math.round((tasksByStatus.completed.length / tasks.length) * 100),
  };

  const TaskCard = ({ task }) => (
    <Card className="card-hover">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{task.title}</h4>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
            <div className="flex items-center gap-2 mt-3">
              <PriorityBadge priority={task.priority} />
              <span className="text-xs text-muted-foreground">Due: {task.dueDate}</span>
            </div>
            {task.assignee && (
              <p className="text-xs text-muted-foreground mt-2">Assigned to: {task.assignee}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Task</DropdownMenuItem>
              <DropdownMenuItem>Change Status</DropdownMenuItem>
              <DropdownMenuItem>Reassign</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

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
            <CreateTaskForm onClose={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Weekly Task Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weekly Task Summary</CardTitle>
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
            {/* To Do Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                  To Do
                  <span className="text-muted-foreground">({tasksByStatus.todo.length})</span>
                </h3>
              </div>
              <div className="space-y-3">
                {tasksByStatus.todo.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
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
                {tasksByStatus.inProgress.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>

            {/* On Hold Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-warning" />
                  On Hold
                  <span className="text-muted-foreground">({tasksByStatus.onHold.length})</span>
                </h3>
              </div>
              <div className="space-y-3">
                {tasksByStatus.onHold.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No tasks on hold</p>
                )}
                {tasksByStatus.onHold.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
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
                {tasksByStatus.completed.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center gap-4 p-4 hover:bg-accent/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                    </div>
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{task.dueDate}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskLists;
