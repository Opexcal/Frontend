import { createContext, useContext, useState, useCallback } from "react";

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
  const fetchTeamDashboard = useCallback(async (teamId) => {
    setTeamData((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // TODO: Replace with actual API call
      // const response = await teamApi.getDashboard(teamId);
      // setTeamData(prev => ({
      //   ...prev,
      //   stats: response.data,
      //   loading: false
      // }));
    } catch (error) {
      setTeamData((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
    }
  }, []);

  // Fetch team members
  const fetchTeamMembers = useCallback(async (teamId) => {
    try {
      // TODO: Replace with actual API call
      // const response = await teamApi.getMembers(teamId);
      // setTeamData(prev => ({
      //   ...prev,
      //   members: response.data
      // }));
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  }, []);

  // Fetch team tasks
  const fetchTeamTasks = useCallback(async (teamId, filters) => {
    setTeamData((prev) => ({ ...prev, loading: true }));
    try {
      // TODO: Replace with actual API call
      // const response = await teamApi.getTasks(teamId, filters);
      // setTeamData(prev => ({
      //   ...prev,
      //   tasks: response.data,
      //   loading: false
      // }));
    } catch (error) {
      setTeamData((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
    }
  }, []);

  // Create task
  const createTask = useCallback(async (taskData) => {
    try {
      // TODO: Replace with actual API call
      // const response = await teamApi.createTask(taskData);
      // setTeamData(prev => ({
      //   ...prev,
      //   tasks: [...prev.tasks, response.data]
      // }));
      // return response.data;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }, []);

  // Update task
  const updateTask = useCallback(async (taskId, updates) => {
    try {
      // TODO: Replace with actual API call
      // const response = await teamApi.updateTask(taskId, updates);
      // setTeamData(prev => ({
      //   ...prev,
      //   tasks: prev.tasks.map(t => t.id === taskId ? response.data : t)
      // }));
      // return response.data;
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }, []);

  // Delete task
  const deleteTask = useCallback(async (taskId) => {
    try {
      // TODO: Replace with actual API call
      // await teamApi.deleteTask(taskId);
      // setTeamData(prev => ({
      //   ...prev,
      //   tasks: prev.tasks.filter(t => t.id !== taskId)
      // }));
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }, []);

  // Fetch assignments
  const fetchAssignments = useCallback(async (filters) => {
    setTeamData((prev) => ({ ...prev, loading: true }));
    try {
      // TODO: Replace with actual API call
      // const response = await assignmentApi.getAll(filters);
      // setTeamData(prev => ({
      //   ...prev,
      //   assignments: response.data,
      //   loading: false
      // }));
    } catch (error) {
      setTeamData((prev) => ({
        ...prev,
        error: error.message,
        loading: false,
      }));
    }
  }, []);

  // Accept assignment
  const acceptAssignment = useCallback(async (assignmentId) => {
    try {
      // TODO: Replace with actual API call
      // await assignmentApi.accept(assignmentId);
      // setTeamData(prev => ({
      //   ...prev,
      //   assignments: prev.assignments.map(a =>
      //     a.id === assignmentId ? { ...a, status: 'accepted' } : a
      //   )
      // }));
    } catch (error) {
      console.error("Error accepting assignment:", error);
      throw error;
    }
  }, []);

  // Decline assignment
  const declineAssignment = useCallback(async (assignmentId, reason) => {
    try {
      // TODO: Replace with actual API call
      // await assignmentApi.decline(assignmentId, reason);
      // setTeamData(prev => ({
      //   ...prev,
      //   assignments: prev.assignments.map(a =>
      //     a.id === assignmentId ? { ...a, status: 'declined', declineReason: reason } : a
      //   )
      // }));
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
