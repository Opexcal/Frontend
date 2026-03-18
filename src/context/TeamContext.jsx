import { createContext, useContext, useState, useCallback } from 'react'
import { teamApi } from '@/api/teamApi'
import { tasksApi } from '@/api/taskApi'

const TeamContext = createContext()

export const useTeamContext = () => {
  const context = useContext(TeamContext)
  if (!context) {
    throw new Error('useTeamContext must be used within TeamProvider')
  }
  return context
}

export const TeamProvider = ({ children }) => {
  const [teamData, setTeamData] = useState({
    members: [],
    tasks: [],
    events: [],
    assignments: [],
    stats: null,
    loading: false,
    error: null,
  })

  const [selectedTeam, setSelectedTeam] = useState(null)

  const fetchTeamDashboard = useCallback(async () => {
    setTeamData((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const response = await teamApi.getDashboard()
      setTeamData((prev) => ({
        ...prev,
        stats: response?.data?.teams ?? response?.data ?? null,
        loading: false,
      }))
    } catch (error) {
      setTeamData((prev) => ({
        ...prev,
        error: error?.message || 'Failed to load dashboard',
        loading: false,
      }))
    }
  }, [])

  const fetchTeamMembers = useCallback(async (teamId) => {
    setTeamData((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const response = await teamApi.getMembers(teamId)
      setTeamData((prev) => ({
        ...prev,
        members: response?.data?.members || [],
        loading: false,
      }))
    } catch (error) {
      setTeamData((prev) => ({
        ...prev,
        error: error?.message || 'Failed to load team members',
        loading: false,
      }))
      throw error
    }
  }, [])

  const fetchTeamTasks = useCallback(async (_teamId, filters) => {
    setTeamData((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const response = await teamApi.getTasks(filters)
      setTeamData((prev) => ({
        ...prev,
        tasks: response?.data?.tasks || [],
        loading: false,
      }))
    } catch (error) {
      setTeamData((prev) => ({
        ...prev,
        error: error?.message || 'Failed to load team tasks',
        loading: false,
      }))
    }
  }, [])

  const createTask = useCallback(async (taskData) => {
    setTeamData((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const response = await tasksApi.createTask(taskData)
      const newTask = response?.data?.task
      setTeamData((prev) => ({
        ...prev,
        tasks: newTask ? [...prev.tasks, newTask] : prev.tasks,
        loading: false,
      }))
      return newTask
    } catch (error) {
      setTeamData((prev) => ({
        ...prev,
        error: error?.message || 'Failed to create task',
        loading: false,
      }))
      throw error
    }
  }, [])

  const updateTask = useCallback(async (taskId, updates) => {
    setTeamData((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const response = await tasksApi.updateTask(taskId, updates)
      const updatedTask = response?.data?.task
      setTeamData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          (t._id || t.id) === taskId ? updatedTask || t : t
        ),
        loading: false,
      }))
      return updatedTask
    } catch (error) {
      setTeamData((prev) => ({
        ...prev,
        error: error?.message || 'Failed to update task',
        loading: false,
      }))
      throw error
    }
  }, [])

  const deleteTask = useCallback(async (taskId) => {
    setTeamData((prev) => ({ ...prev, loading: true, error: null }))
    try {
      await tasksApi.deleteTask(taskId)
      setTeamData((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => (t._id || t.id) !== taskId),
        loading: false,
      }))
    } catch (error) {
      setTeamData((prev) => ({
        ...prev,
        error: error?.message || 'Failed to delete task',
        loading: false,
      }))
      throw error
    }
  }, [])

  const fetchAssignments = useCallback(async (filters) => {
    setTeamData((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const response = await teamApi.getTasks(filters)
      const tasks = response?.data?.tasks || []
      const assignments = tasks.filter((t) => t.status === 'Pending' || t.status === 'pending')
      setTeamData((prev) => ({
        ...prev,
        assignments,
        loading: false,
      }))
    } catch (error) {
      setTeamData((prev) => ({
        ...prev,
        error: error?.message || 'Failed to load assignments',
        loading: false,
      }))
    }
  }, [])

  const acceptAssignment = useCallback(async (assignmentId) => {
    const response = await tasksApi.acceptTask(assignmentId)
    const updatedTask = response?.data?.task
    setTeamData((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) =>
        (a._id || a.id) === assignmentId ? updatedTask || a : a
      ),
    }))
    return updatedTask
  }, [])

  const declineAssignment = useCallback(async (assignmentId, reason) => {
    const response = await tasksApi.rejectTask(assignmentId, reason)
    const updatedTask = response?.data?.task
    setTeamData((prev) => ({
      ...prev,
      assignments: prev.assignments.map((a) =>
        (a._id || a.id) === assignmentId ? updatedTask || a : a
      ),
    }))
    return updatedTask
  }, [])

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
  }

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>
}

