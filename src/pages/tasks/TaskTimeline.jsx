import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft, Calendar, Clock, User, CheckCircle2, XCircle,
  Edit, MessageSquare, FileText, AlertCircle, Plus, Play, Pause
} from "lucide-react";
import { format, parseISO, formatDistanceToNow } from "date-fns";

// Mock timeline data
const mockTimeline = [
  {
    id: 1,
    type: "created",
    actor: { id: "1", name: "Sarah Johnson", avatar: "" },
    timestamp: "2025-12-20T10:00:00",
    description: "Task created",
    details: {
      priority: "high",
      dueDate: "2025-12-24",
      estimatedHours: 4
    }
  },
  {
    id: 2,
    type: "assigned",
    actor: { id: "1", name: "Sarah Johnson", avatar: "" },
    timestamp: "2025-12-20T10:05:00",
    description: "Task assigned to Mike Chen",
    details: {
      assignee: { id: "2", name: "Mike Chen", avatar: "" }
    }
  },
  {
    id: 3,
    type: "status_changed",
    actor: { id: "2", name: "Mike Chen", avatar: "" },
    timestamp: "2025-12-20T14:30:00",
    description: "Status changed from 'Not Started' to 'In Progress'",
    details: {
      oldStatus: "not-started",
      newStatus: "in-progress"
    }
  },
  {
    id: 4,
    type: "comment",
    actor: { id: "2", name: "Mike Chen", avatar: "" },
    timestamp: "2025-12-21T09:15:00",
    description: "Added comment",
    details: {
      comment: "I've reviewed the first section. The budget allocation looks reasonable."
    }
  },
  {
    id: 5,
    type: "time_tracked",
    actor: { id: "2", name: "Mike Chen", avatar: "" },
    timestamp: "2025-12-21T11:00:00",
    description: "Time tracked: 2 hours",
    details: {
      hours: 2
    }
  },
  {
    id: 6,
    type: "assigned",
    actor: { id: "1", name: "Sarah Johnson", avatar: "" },
    timestamp: "2025-12-22T08:00:00",
    description: "Task also assigned to Alex Rivera",
    details: {
      assignee: { id: "3", name: "Alex Rivera", avatar: "" }
    }
  },
  {
    id: 7,
    type: "attachment",
    actor: { id: "2", name: "Mike Chen", avatar: "" },
    timestamp: "2025-12-22T10:20:00",
    description: "Added attachment: budget_breakdown.xlsx",
    details: {
      fileName: "budget_breakdown.xlsx",
      fileSize: "145 KB"
    }
  },
];

const TaskTimeline = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case "created":
        return <Plus className="h-4 w-4" />;
      case "assigned":
        return <User className="h-4 w-4" />;
      case "status_changed":
        return <Edit className="h-4 w-4" />;
      case "comment":
        return <MessageSquare className="h-4 w-4" />;
      case "time_tracked":
        return <Clock className="h-4 w-4" />;
      case "attachment":
        return <FileText className="h-4 w-4" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case "created":
        return "bg-blue-500";
      case "assigned":
        return "bg-purple-500";
      case "status_changed":
        return "bg-orange-500";
      case "comment":
        return "bg-green-500";
      case "time_tracked":
        return "bg-yellow-500";
      case "attachment":
        return "bg-indigo-500";
      case "completed":
        return "bg-green-600";
      default:
        return "bg-gray-500";
    }
  };

  const totalHours = mockTimeline
    .filter(item => item.type === "time_tracked")
    .reduce((sum, item) => sum + (item.details?.hours || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-display font-semibold text-foreground">
              Task Timeline
            </h1>
            <p className="text-muted-foreground mt-1">Complete history and progress tracking</p>
          </div>
        </div>
        <Button variant="outline" asChild>
  <Link to={`/tasks/${id}`}>
    View Task Details
  </Link>
</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-semibold mt-1">{mockTimeline.length}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Time Tracked</p>
                <p className="text-2xl font-semibold mt-1">{totalHours}h</p>
              </div>
              <Play className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Duration</p>
                <p className="text-2xl font-semibold mt-1">
                  {formatDistanceToNow(parseISO(mockTimeline[0].timestamp))}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

            {/* Timeline items */}
            <div className="space-y-6">
              {mockTimeline.map((item, index) => (
                <div key={item.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div className={`relative z-10 h-12 w-12 rounded-full ${getColor(item.type)} flex items-center justify-center text-white flex-shrink-0`}>
                    {getIcon(item.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-6">
                    <div className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors bg-background">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={item.actor.avatar} />
                        <AvatarFallback>{item.actor.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{item.actor.name}</span>
                            <span className="text-sm text-muted-foreground">{item.description}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(parseISO(item.timestamp), "MMM d, yyyy 'at' h:mm a")}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {formatDistanceToNow(parseISO(item.timestamp), { addSuffix: true })}
                        </p>

                        {/* Details */}
                        {item.details && (
                          <div className="mt-2 space-y-1">
                            {item.type === "status_changed" && (
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{item.details.oldStatus}</Badge>
                                <span className="text-xs">→</span>
                                <Badge>{item.details.newStatus}</Badge>
                              </div>
                            )}
                            {item.type === "assigned" && item.details.assignee && (
                              <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>{item.details.assignee.name}</span>
                              </div>
                            )}
                            {item.type === "comment" && item.details.comment && (
                              <div className="p-2 bg-muted rounded text-sm">
                                {item.details.comment}
                              </div>
                            )}
                            {item.type === "time_tracked" && item.details.hours && (
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-yellow-600" />
                                <span className="font-medium">{item.details.hours} hours tracked</span>
                              </div>
                            )}
                            {item.type === "attachment" && (
                              <div className="flex items-center gap-2 text-sm">
                                <FileText className="h-4 w-4 text-indigo-600" />
                                <span>{item.details.fileName}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({item.details.fileSize})
                                </span>
                              </div>
                            )}
                            {item.type === "created" && (
                              <div className="space-y-1 text-sm">
                                {item.details.priority && (
                                  <div>
                                    <span className="text-muted-foreground">Priority: </span>
                                    <Badge>{item.details.priority}</Badge>
                                  </div>
                                )}
                                {item.details.dueDate && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Due: </span>
                                    <span>{format(parseISO(item.details.dueDate), "MMM d, yyyy")}</span>
                                  </div>
                                )}
                                {item.details.estimatedHours && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Estimated: </span>
                                    <span>{item.details.estimatedHours} hours</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskTimeline;

