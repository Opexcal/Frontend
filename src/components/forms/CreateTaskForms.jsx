import { useState, useEffect } from "react"; // ✅ ADD useEffect import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react"; // ✅ Remove unused imports
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {toast} from 'sonner'; // ✅ CHANGE to sonner toast
import { tasksApi } from '@/api/taskApi';
import { usersApi } from '@/api/usersApi';
import UserMultiSelect from '@/components/UserMultiSelect'; // ✅ ADD this import

const CreateTaskForm = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dueDate, setDueDate] = useState();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignees: [],
    priority: "",
  });
  const [teamMembers, setTeamMembers] = useState([]);

  // ✅ Fetch team members on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await usersApi.getUsers();
        setTeamMembers(response.data.users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Error", {
          description: "Failed to load team members",
        });
      }
    };
    fetchUsers();
  }, []); // ✅ Add toast to dependencies

  // ✅ SINGLE handleSubmit function (removed duplicate)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!dueDate) {
      toast.error("Due date required", {
  description: "Please select a due date for the task.",
});
      return;
    }

    if (formData.assignees.length === 0) {
      toast.error("Assignee required", {
  description: "Please select at least one assignee.",
});
      return;
    }

    setIsLoading(true);
    
    try {
      await tasksApi.createTask({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        assignees: formData.assignees,
        dueDate: dueDate.toISOString(),
      });
      
      toast.success("Task created", {
  description: "Your task has been created and assignees notified.",
});
      onClose();
    } catch (error) {
      toast.error("Error creating task", {
  description: error.response?.data?.message || "Something went wrong",
});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Task Title *</Label>
        <Input
          id="title"
          placeholder="Enter task title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Add more details about this task..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignees">Assign To *</Label>
        <UserMultiSelect
          users={teamMembers}
          selectedUsers={formData.assignees}
          onChange={(userIds) => setFormData({ ...formData, assignees: userIds })}
          placeholder="Select team members..."
        />
      </div>

      <div className="space-y-2">
        <Label>Due Date *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : "Select due date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority *</Label>
        <Select 
          value={formData.priority} 
          onValueChange={(value) => setFormData({ ...formData, priority: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="High">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                High
              </div>
            </SelectItem>
            <SelectItem value="Medium">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                Medium
              </div>
            </SelectItem>
            <SelectItem value="Low">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Low
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Task"}
        </Button>
      </div>
    </form>
  );
};

export default CreateTaskForm;