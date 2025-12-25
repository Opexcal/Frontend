// hooks/useTaskActions.js
import { tasksApi } from "@/api/tasksApi";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export const useTaskActions = (onSuccess) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const acceptTask = async (taskId) => {
    setLoading(true);
    try {
      await tasksApi.acceptTask(taskId);
      toast({ title: "Task accepted", description: "Status updated to In-Progress" });
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to accept task",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const rejectTask = async (taskId, rejectionReason) => {
    if (!rejectionReason || rejectionReason.trim().length === 0) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejecting this task",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await tasksApi.rejectTask(taskId, rejectionReason);
      toast({ title: "Task rejected" });
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reject task",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId) => {
    setLoading(true);
    try {
      await tasksApi.completeTask(taskId);
      toast({ title: "Task marked as completed" });
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to complete task",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { acceptTask, rejectTask, completeTask, loading };
};