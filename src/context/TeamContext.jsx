import { createContext, useContext, useState, useCallback } from "react";
import { teamApi } from '@/api/teamApi';
import { tasksApi } from '@/api/tasksApi';
/**
 * TeamContext - Global state management for team-related data
 * Optional: Can be used instead of local state in components
 */
const TeamContext = createContext();

export const useTeamContext = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error("useTeamContext must be used within TeamProvider");
  }
  return context;
};

export const TeamProvider = ({ children }) => {
  const [teamData, setTeamData] = useState({
    members: [],
    tasks: [],
    events: [],
    assignments: [],
    stats: null,
    loading: false,
    error: null,
  });

  const [selectedTeam, setSelectedTeam] = useState(null);

  // Fetch team dashboard
 const fetchTeamDashboard = useCallback(async () => {
  setTeamData((prev) => ({ ...prev, loading: true, error: null }));
  try {
    const response = await teamApi.getDashboard();
    setTeamData(prev => ({
      ...prev,
      stats: response.data || response,
      loading: false
    }));
  } catch (error) {
    setTeamData((prev) => ({
      ...prev,
      error: error.message,
      loading: false,
    }));
  }
}, []);

const fetchTeamMembers = useCallback(async (teamId) => {
  setTeamData(prev => ({ ...prev, loading: true })); // ✅ ADD THIS
  try {
    const response = await teamApi.getMembers(teamId);
    setTeamData(prev => ({
      ...prev,
      members: response.members || response.data?.members || [],
      loading: false // ✅ ADD THIS
    }));
  } catch (error) {
    setTeamData(prev => ({ ...prev, error: error.message, loading: false })); // ✅ ADD THIS
    throw error; // ✅ ADD THIS
  }
}, []);

const fetchTeamTasks = useCallback(async (teamId, filters) => {
  setTeamData((prev) => ({ ...prev, loading: true }));
  try {
    const response = await teamApi.getTasks(filters);
    setTeamData(prev => ({
      ...prev,
      tasks: response.tasks || response.data?.tasks || [],
      loading: false
    }));
  } catch (error) {
    setTeamData((prev) => ({
      ...prev,
      error: error.message,
      loading: false,
    }));
  }
}, []);

const createTask = useCallback(async (taskData) => {
  setTeamData(prev => ({ ...prev, loading: true }));
  try {
    const response = await tasksApi.createTask(taskData);
    const newTask = response.task || response.data?.task;
    setTeamData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
      loading: false
    }));
    return newTask;
  } catch (error) {
    setTeamData(prev => ({ ...prev, error: error.message, loading: false })); // ✅ ADD THIS
    throw error;
  }
}, []);

const updateTask = useCallback(async (taskId, updates) => {
  setTeamData(prev => ({ ...prev, loading: true }));
  try {
    const response = await tasksApi.updateTask(taskId, updates);
    const updatedTask = response.task || response.data?.task;
      setTeamData(prev => ({ ...prev, tasks: prev.tasks.map(t => t._id === taskId || t.id === taskId ? updatedTask : t), loading: false }));
    return updatedTask;
  } catch (error) {
     setTeamData(prev => ({ ...prev, error: error.message, loading: false }));
    console.error("Error updating task:", error);
    throw error;
  }
}, []);

const deleteTask = useCallback(async (taskId) => {
  setTeamData(prev => ({ ...prev, loading: true }));
  try {
    await tasksApi.deleteTask(taskId);
     setTeamData(prev => ({ ...prev, tasks: prev.tasks.map(t => t._id === taskId || t.id === taskId ? deleteTask : t), loading: false }));
  } catch (error) {
     setTeamData(prev => ({ ...prev, error: error.message, loading: false }));
    console.error("Error deleting task:", error);
    throw error;
  }
}, []);


  // Fetch assignments
// Fetch assignments (use tasks API)
const fetchAssignments = useCallback(async (filters) => {
  setTeamData((prev) => ({ ...prev, loading: true }));
  try {
    const response = await teamApi.getTasks(filters);
    const tasks = response.tasks || response.data?.tasks || [];
    
    // Filter for tasks that are assigned to current user and pending
    const assignments = tasks.filter(t => 
      t.status === 'Pending' || t.status === 'pending'
    );
    
    setTeamData(prev => ({
      ...prev,
      assignments,
      loading: false
    }));
  } catch (error) {
    setTeamData((prev) => ({
      ...prev,
      error: error.message,
      loading: false,
    }));
  }
}, []);

// Accept assignment (use task accept API)
const acceptAssignment = useCallback(async (assignmentId) => {
  try {
    const response = await tasksApi.acceptTask(assignmentId);
    const updatedTask = response.task || response.data?.task;
    
    setTeamData(prev => ({
      ...prev,
      assignments: prev.assignments.map(a =>
        a._id === assignmentId || a.id === assignmentId 
          ? updatedTask 
          : a
      ), loading: false
    }));
  } catch (error) {
    console.error("Error accepting assignment:", error);
    throw error;
  }
}, []);

// Decline assignment (use task reject API)
const declineAssignment = useCallback(async (assignmentId, reason) => {
  try {
    const response = await tasksApi.rejectTask(assignmentId, reason);
    const updatedTask = response.task || response.data?.task;
    
    setTeamData(prev => ({
      ...prev,
      assignments: prev.assignments.map(a =>
        a._id === assignmentId || a.id === assignmentId 
          ? updatedTask 
          : a
      ), loading: false
    }));
  } catch (error) {
    console.error("Error declining assignment:", error);
    throw error;
  }
}, []);

  const value = {
    teamData,
    selectedTeam,
    setSelectedTeam,
    fetchTeamDashboard,
    fetchTeamMembers,
    fetchTeamTasks,
    createTask,
    updateTask,
    deleteTask,
    fetchAssignments,
    acceptAssignment,
    declineAssignment,
  };

  return (
    <TeamContext.Provider value={value}>{children}</TeamContext.Provider>
  );
};
