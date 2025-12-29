import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, Edit, Trash2, Calendar, Clock, User, Users,
  CheckCircle2, AlertCircle, FileText, MessageSquare, History,
  Plus, CheckSquare
} from "lucide-react";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import StatusBadge from "@/components/common/StatusBadge";
import { format, parseISO } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tasksApi } from '@/api';
import { toast } from 'sonner';

// Mock data

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // Fetch task data on mount
useEffect(() => {
  const fetchTask = async () => {
    try {
      const response = await tasksApi.getTask(id);
      const taskData = response.data?.task || response.task;
      
      setTask({
        ...taskData,
        // Ensure all arrays have defaults
        comments: taskData.comments || [],
        relatedTasks: taskData.relatedTasks || [],
        attachments: taskData.attachments || [],
        tags: taskData.tags || [],
        assignedTo: taskData.assignedTo || taskData.assignees || [],
        // Ensure objects have defaults
        createdBy: taskData.createdBy || { 
          id: '',
          name: 'Unknown', 
          email: '', 
          avatar: '' 
        },
        // Ensure numbers have defaults
        estimatedHours: taskData.estimatedHours || 0,
        actualHours: taskData.actualHours || 0,
      });
      
      setNewStatus(taskData.status);
    } catch (error) {
      toast.error("Failed to load task", {
        description: error.response?.data?.message || "Please try again",
      });
      navigate("/tasks");
    } finally {
      setLoading(false);
    }
  };
  fetchTask();
}, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!task) return null;





  const canEdit = user?.id === task.createdBy.id || user?.role === "admin" || user?.role === "manager";
const isAssignedToMe = Array.isArray(task.assignedTo)
  ? task.assignedTo.some(a => {
      const assigneeId = a._id || a.id;
      const currentUserId = user?._id || user?.id;
      console.log('Comparing:', { assigneeId, currentUserId, match: assigneeId === currentUserId });
      return assigneeId === currentUserId;
    })
  : false;


const handleStatusChange = async () => {
  try {
    await tasksApi.updateTask(task.id, { status: newStatus });
    setTask({ ...task, status: newStatus });
    toast.success("Task status updated");
    setIsEditDialogOpen(false);
  } catch (error) {
    toast.error("Failed to update status", {
      description: error.response?.data?.message || "Please try again",
    });
  }
};

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    // API call here
    console.log("Adding comment:", commentText);
    setCommentText("");
  };

const handleDelete = async () => {
  if (!confirm("Are you sure you want to delete this task?")) return;
  
  try {
    await tasksApi.deleteTask(task.id);
    toast.success("Task deleted successfully");
    navigate("/tasks/my-tasks");
  } catch (error) {
    toast.error("Failed to delete task", {
      description: error.response?.data?.message || "Please try again",
    });
  }
};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-display font-semibold text-foreground">
              {task.title}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
              <Badge variant="outline">
  ID: {task.id || task._id}
</Badge>
            </div>
          </div>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Description
              </CardTitle>
            </CardHeader>
           <CardContent>
  <div 
    className="text-sm text-foreground prose prose-sm max-w-none"
    dangerouslySetInnerHTML={{ __html: task.description }}
  />
</CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="comments" className="w-full">
           <TabsList>
<TabsTrigger value="comments">
  <MessageSquare className="h-4 w-4 mr-2" />
  Comments ({task.comments?.length || 0})
</TabsTrigger>
  <TabsTrigger value="timeline">
    <History className="h-4 w-4 mr-2" />
    Timeline
  </TabsTrigger>
  <TabsTrigger value="related">
    <CheckSquare className="h-4 w-4 mr-2" />
    Related Tasks ({task.relatedTasks?.length || 0})  {/* ✅ Safe guard */}
  </TabsTrigger>
</TabsList>

            <TabsContent value="comments" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  {/* Add Comment */}
                  <div className="mb-6">
                    <Textarea
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="min-h-[100px] mb-3"
                    />
                    <Button onClick={handleAddComment}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Comment
                    </Button>
                  </div>

                  {/* Comments List */}
                 <div className="space-y-4">
  {(task.comments || []).map(comment => ( 
    <div key={comment.id} className="flex gap-3">
       <div className="space-y-4">
                    {task.comments.map(comment => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.author.avatar} />
                          <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{comment.author.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(parseISO(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
    </div>
  ))}
  {(!task.comments || task.comments.length === 0) && (
    <p className="text-sm text-muted-foreground text-center py-4">
      No comments yet
    </p>
  )}
</div>
                  
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <Link to={`/tasks/${task.id}/timeline`} className="text-primary hover:underline">
                    View full timeline →
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="related" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {task.relatedTasks.map(relatedTask => (
                      <Link
                        key={relatedTask.id}
                        to={`/tasks/${relatedTask.id}`}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-sm">{relatedTask.title}</p>
                          <StatusBadge status={relatedTask.status} className="mt-1" />
                        </div>
                        <ArrowLeft className="h-4 w-4 transform rotate-180" />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Actions */}
          {isAssignedToMe && task.status?.toLowerCase() === "pending" && (
  <Card>
    <CardHeader>
      <CardTitle>Actions</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      <Button 
        className="w-full"
        onClick={async () => {
          try {
            await tasksApi.acceptTask(task.id || task._id);
            toast.success("Task Accepted", {
              description: "You've accepted this task and it's now in progress.",
            });
            // Refresh the task data
            window.location.reload();
          } catch (error) {
            toast.error("Failed to accept task", {
              description: error.response?.data?.message || "Please try again",
            });
          }
        }}
      >
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Accept Task
      </Button>
      <Button 
        variant="outline" 
        className="w-full"
        onClick={async () => {
          const reason = prompt("Please provide a reason for declining:");
          if (!reason) return;
          
          try {
            await tasksApi.rejectTask(task.id || task._id, { reason });
            toast.success("Task Declined", {
              description: "You've declined this task.",
            });
            window.location.reload();
          } catch (error) {
            toast.error("Failed to decline task", {
              description: error.response?.data?.message || "Please try again",
            });
          }
        }}
      >
        <AlertCircle className="h-4 w-4 mr-2" />
        Decline Task
      </Button>
    </CardContent>
  </Card>
)}

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Due Date</p>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(parseISO(task.dueDate), "MMMM d, yyyy")}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Created</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{format(parseISO(task.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                </div>
              </div>

              <div>
  <p className="text-sm font-medium mb-2">Time Tracking</p>
  <div className="space-y-1 text-sm">
    <div className="flex justify-between">
      <span className="text-muted-foreground">Estimated:</span>
      <span>{task.estimatedHours || 0}h</span>
    </div>
    <div className="flex justify-between">
      <span className="text-muted-foreground">Actual:</span>
      <span>{task.actualHours || 0}h</span>
    </div>
  </div>
</div>
            </CardContent>
          </Card>

          {/* Created By */}
          <Card>
            <CardHeader>
              <CardTitle>Created By</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={task.createdBy.avatar} />
                  <AvatarFallback>{task.createdBy.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{task.createdBy.name}</p>
                  <p className="text-xs text-muted-foreground">{task.createdBy.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned To */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assigned To
              </CardTitle>
            </CardHeader>
            <CardContent>
  <div className="space-y-3">
    {(task.assignedTo || []).map(assignee => ( 
      <div key={assignee.id} className="flex items-center justify-between">
         <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={assignee.avatar} />
                        <AvatarFallback>{assignee.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{assignee.name}</p>
                        <p className="text-xs text-muted-foreground">{assignee.email}</p>
                      </div>
</div>
      </div>
    ))}
    {(!task.assignedTo || task.assignedTo.length === 0) && (
      <p className="text-sm text-muted-foreground text-center py-4">
        No assignees
      </p>
    )}
  </div>
</CardContent>

          </Card>

          {/* Tags */}
         {task.tags && task.tags.length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle>Tags</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-wrap gap-2">
        {task.tags.map(tag => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
    </CardContent>
  </Card>
)}

{/* Attachments - Already has conditional rendering, but add safe guard */}
{task.attachments && task.attachments.length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle>Attachments</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {task.attachments.map(attachment => (
          <div
                      key={attachment.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{attachment.name}</p>
                          <p className="text-xs text-muted-foreground">{attachment.size}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Download</Button>
                    </div>
        ))}
      </div>
    </CardContent>
  </Card>
)}

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {task.attachments.map(attachment => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{attachment.name}</p>
                          <p className="text-xs text-muted-foreground">{attachment.size}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Download</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Task Status</DialogTitle>
            <DialogDescription>
              Update the status of this task
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusChange}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskDetails;

