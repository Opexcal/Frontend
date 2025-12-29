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
import { toast } from "sonner";

/**
 * Validation schema
 */
const assignmentSchema = yup.object({
  title: yup
    .string()
    .max(200, "Title cannot exceed 200 characters")
    .required("Title is required"),
  description: yup
    .string()
    .max(2000, "Description cannot exceed 2000 characters"),
  assignee: yup
    .string()
    .required("Please select an assignee"),
  priority: yup
    .string()
    .oneOf(['High', 'Medium', 'Low'], "Invalid priority")
    .required("Priority is required"),
  dueDate: yup.string().required("Due date is required"),
  conferenceLink: yup.string().url("Must be a valid URL").optional(), // ✅ Re-added as optional
});

/**
 * AssignmentModal - Modal for creating/reassigning tasks
 */
const AssignmentModal = ({
  isOpen = false,
  onClose,
  teamMembers = [],
  onSubmit,
  mode = "create",
  existingTask = null,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: yupResolver(assignmentSchema),
    defaultValues: {
      title: existingTask?.title || "",
      description: existingTask?.description || "",
      assignee: existingTask?.assigneeId || "",
      priority: existingTask?.priority || "Medium",
      dueDate: existingTask?.dueDate || "",
      conferenceLink: existingTask?.conferenceLink || "",
    },
  });

  const handleSubmit = async (data) => {
    setIsLoading(true);
    
    console.log('📤 Form data being sent:', data); // Debug log
    
    try {
      if (mode === 'create') {
        // ✅ Only send fields that backend expects
        const taskData = {
          title: data.title,
          description: data.description || "", // Ensure it's a string
          priority: data.priority,
          assignees: [data.assignee], // Backend expects array
          dueDate: new Date(data.dueDate).toISOString(),
        };
        
        // Only add conferenceLink if it has a value
        if (data.conferenceLink && data.conferenceLink.trim()) {
          taskData.conferenceLink = data.conferenceLink;
        }
        
        console.log('📤 Sending to API:', taskData); // Debug log
        
        await tasksApi.createTask(taskData);
        
        toast.success("Task created", {
          description: "Your task has been created and assigned.",
        });
      } else if (mode === 'reassign') {
        await tasksApi.updateTask(existingTask._id, {
          assignees: [data.assignee],
        });
        
        toast.success("Task reassigned", {
          description: "The task has been successfully reassigned.",
        });
      }
      
      form.reset();
      onClose();
      
      // Call parent's onSubmit if provided
      if (onSubmit) {
        onSubmit(data);
      }
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                       error.response?.data?.error ||
                       error.message || 
                       "Failed to save task";
  
  toast.error("Error", {
    description: errorMessage,
    duration: 5000, // Show longer for debugging
  });
} finally {
      setIsLoading(false);
    }
  };

  const title = mode === "reassign" ? "Reassign Task" : "Create & Assign Task";
  const description = mode === "reassign"
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
                        <Input placeholder="Enter task title" {...field} />
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
      <Select 
        value={field.value} 
        onValueChange={field.onChange}
        disabled={teamMembers.length === 0} // ✅ Disable if empty
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder={
              teamMembers.length === 0 
                ? "No team members available" 
                : "Select team member"
            } />
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
      {teamMembers.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Please add team members before creating tasks
        </p>
      )}
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
      <Select value={field.value} onValueChange={field.onChange}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select priority" /> {/* ✅ Add placeholder */}
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
                        <Input type="date" {...field} />
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