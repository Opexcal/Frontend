import React, { useState } from 'react';
import { massOpsApi } from '../../api/massOperationsApi';
import { useAuth } from '../../context/AuthContext';
import RecipientSelector from '../../components/RecipientSelector';
import RichTextEditor from '../../components/RichTextEditor';
import PreviewModal from '../../components/PreviewModal';
import { toast } from "sonner";


const MassTaskCreation = () => {
  const { user } = useAuth();
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    selectedGroups: [],
    selectedUsers: [],
  });
  const [recipientCount, setRecipientCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);

  const handleCreateTask = async () => {
    if (sending) return;

    // Validate inputs
    if (!taskData.title.trim()) {
      toast.error("Missing title", {
        description: "Please enter a task title",
      });
      return;
    }

    if (taskData.selectedGroups.length === 0 && taskData.selectedUsers.length === 0) {
      toast.error("No recipients selected", {
        description: "Please select at least one group or user",
      });
      return;
    }

    setSending(true);

    try {
      // If groups are selected, use mass task API
      if (taskData.selectedGroups.length > 0) {
        const groupId = taskData.selectedGroups[0].id;
        
        await massOpsApi.createMassTasks({
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : undefined,
          groupId,
        });
      } 
      // If only individual users, create individual tasks
      else if (taskData.selectedUsers.length > 0) {
        const { tasksApi } = await import('../../api/taskApi');
        
        // Create task for each selected user
        const promises = taskData.selectedUsers.map(user => 
          tasksApi.createTask({
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority,
            dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : undefined,
            assignees: [user.id],
            status: 'Not Started'
          })
        );
        
        await Promise.all(promises);
      }

      toast.success("Mass tasks created", {
        description: `Successfully created tasks for ${recipientCount} assignee${recipientCount !== 1 ? 's' : ''}.`,
      });

      // Reset form
      setTaskData({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: "",
        selectedGroups: [],
        selectedUsers: [],
      });
      setRecipientCount(0);
      setShowPreview(false);
      
    } catch (error) {
      console.error("Mass task creation error:", error);
      toast.error("Failed to create mass tasks", {
        description: error?.response?.data?.message || error?.message || "Something went wrong",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto p-6">
      {/* Processing overlay */}
      {sending && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white/95 rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4 border border-slate-100">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-900">
                Creating tasks for {recipientCount || "selected"} recipient{recipientCount !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-slate-500">
                This may take a few seconds while we process everything in the background.
              </p>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">Mass Task Creation</h1>

      {/* Step 1: Assignees */}
      <section className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Select Assignees</h2>
        <RecipientSelector
          mode="task"
          onSelect={(recipients) => {
            setTaskData(prev => ({
              ...prev,
              selectedGroups: recipients.groups || [],
              selectedUsers: recipients.users || [],
            }));
            setRecipientCount(recipients.count || 0);
          }}
          allowOrganizationWide={user?.role === 'manager'}
        />
        <p className="mt-4 text-sm text-gray-600">
          Total assignees: <strong>{recipientCount}</strong>
        </p>
      </section>

      {/* Step 2: Task Details */}
      <section className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Task Details</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={taskData.title}
            onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter task title"
            maxLength={100}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              value={taskData.priority}
              onChange={(e) => setTaskData(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Due Date</label>
            <input
              type="datetime-local"
              value={taskData.dueDate}
              onChange={(e) => setTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Description</label>
          <RichTextEditor
            value={taskData.description}
            onChange={(html) => setTaskData(prev => ({ ...prev, description: html }))}
            placeholder="Describe the task..."
            maxLength={2000}
          />
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowPreview(true)}
          disabled={!taskData.title || recipientCount === 0 || sending}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {sending ? "Processing…" : `Assign to ${recipientCount} User${recipientCount !== 1 ? 's' : ''}`}
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onConfirm={handleCreateTask}
          title="Confirm Mass Task Assignment"
          confirmText={`Assign to ${recipientCount} User${recipientCount !== 1 ? 's' : ''}`}
          loading={sending}
        >
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">TITLE</p>
              <p className="text-sm font-medium">{taskData.title}</p>
            </div>
            
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">PRIORITY</p>
              <span className={`inline-block px-2 py-1 text-xs rounded ${
                taskData.priority === 'High' ? 'bg-red-100 text-red-700' :
                taskData.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {taskData.priority}
              </span>
            </div>
            
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">DUE DATE</p>
              <p className="text-sm">
                {taskData.dueDate ? new Date(taskData.dueDate).toLocaleString() : 'No due date'}
              </p>
            </div>
            
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">DESCRIPTION</p>
              <div className="border rounded-lg p-3 bg-gray-50 text-sm max-h-40 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: taskData.description || '<em class="text-gray-400">No description</em>' }} />
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">RECIPIENTS</p>
              <p className="text-sm">
                {taskData.selectedGroups.length > 0 && (
                  <span className="mr-2">
                    {taskData.selectedGroups.length} team{taskData.selectedGroups.length !== 1 ? 's' : ''}
                  </span>
                )}
                {taskData.selectedUsers.length > 0 && (
                  <span>
                    {taskData.selectedUsers.length} individual user{taskData.selectedUsers.length !== 1 ? 's' : ''}
                  </span>
                )}
              </p>
            </div>
          </div>
        </PreviewModal>
      )}
    </div>
  );
};

export default MassTaskCreation;