import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import PriorityBadge from "./PriorityBadge";
import { tasksApi } from '@/api/taskApi';
import { useToast } from "@/hooks/use-toast";

/**
 * Validation schema
 */
const assignmentSchema = yup.object({
  title: yup
    .string()
    .max(200, "Title cannot exceed 200 characters") // Backend limit
    .required("Title is required"),
  description: yup
    .string()
    .max(2000, "Description cannot exceed 2000 characters"), // Backend limit
  assignee: yup
    .string()
    .required("Please select an assignee"),
  priority: yup
    .string()
    .oneOf(['High', 'Medium', 'Low'], "Invalid priority") // Match backend enum
    .required("Priority is required"),
  dueDate: yup.string().required("Due date is required"),
  // Remove conferenceLink - not in backend schema
});

/**
 * AssignmentModal - Modal for creating/reassigning tasks
 */
const AssignmentModal = ({
  isOpen = false,
  onClose,
  teamMembers = [],
  onSubmit,
  mode = "create", // 'create' | 'reassign'
  existingTask = null,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: yupResolver(assignmentSchema),
    defaultValues: {
      title: existingTask?.title || "",
      description: existingTask?.description || "",
      assignee: existingTask?.assigneeId || "",
priority: existingTask?.priority || "Medium", // ✅ Match backend enum
      dueDate: existingTask?.dueDate || "",
      // conferenceLink: existingTask?.conferenceLink || "",
    },
  });

const handleSubmit = async (data) => {
  setIsLoading(true);
  try {
    if (mode === 'create') {
      await tasksApi.createTask({
        title: data.title,
        description: data.description,
        priority: data.priority,
        assignees: [data.assignee], // Backend expects array
        dueDate: new Date(data.dueDate).toISOString(),
      });
    } else if (mode === 'reassign') {
      // For reassign, update the task's assignees
      await tasksApi.updateTask(existingTask._id, {
        assignees: [data.assignee],
      });
    }
    
    form.reset();
    onClose();
  } catch (error) {
    toast({
      title: "Error",
      description: error.response?.data?.message || "Failed to save task",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};


  const title =
    mode === "reassign" ? "Reassign Task" : "Create & Assign Task";
  const description =
    mode === "reassign"
      ? "Select a team member to reassign this task to"
      : "Create a new task and assign it to a team member";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {mode === "create" && (
              <>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter task title"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the task in detail"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="assignee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {mode === "reassign" ? "Reassign To" : "Assign To"}
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} ({member.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === "create" && (
              <>
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
  <SelectItem value="Low">🟢 Low</SelectItem>
  <SelectItem value="Medium">🟡 Medium</SelectItem>
  <SelectItem value="High">🔴 High</SelectItem>
</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="conferenceLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conference Link (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://meet.google.com/..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Add a meeting link if applicable
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Assigning..." : "Confirm Assignment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentModal;
