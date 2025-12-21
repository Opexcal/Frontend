import React, { useState } from 'react';
import { massOpsApi } from '../../api/massOperationsApi';
import { useAuth } from '../../context/AuthContext';
import RecipientSelector from '../../components/RecipientSelector';
import RichTextEditor from '../../components/RichTextEditor';
import PreviewModal from '../../components/PreviewModal';

const MassTaskCreation = () => {
  const { user } = useAuth();
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    selectedGroups: [],
    selectedUsers: [],
  });
  const [recipientCount, setRecipientCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);

  const handleCreateTask = async () => {
    setSending(true);
    try {
      await massOpsApi.createMassTasks({
        taskTemplate: {
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
        },
        assignees: {
          groupIds: taskData.selectedGroups.map(g => g.id),
          userIds: taskData.selectedUsers.map(u => u.id),
        },
      });
      // Success handling
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
      setShowPreview(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Mass Task Creation</h1>

      {/* Step 1: Assignees */}
      <section className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Select Assignees</h2>
        <RecipientSelector
          mode="task"
          onSelect={(recipients) => {
            setTaskData(prev => ({
              ...prev,
              selectedGroups: recipients.groups,
              selectedUsers: recipients.users,
            }));
            setRecipientCount(recipients.count);
          }}
          allowOrganizationWide={user.role === 'manager'}
        />
        <p className="mt-4 text-sm text-gray-600">
          Total assignees: <strong>{recipientCount}</strong>
        </p>
      </section>

      {/* Step 2: Task Details */}
      <section className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Task Details</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Task Title *</label>
          <input
            type="text"
            value={taskData.title}
            onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full border rounded-lg px-4 py-2"
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
              className="w-full border rounded-lg px-4 py-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Due Date</label>
            <input
              type="datetime-local"
              value={taskData.dueDate}
              onChange={(e) => setTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full border rounded-lg px-4 py-2"
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
          disabled={!taskData.title || recipientCount === 0}
          className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          Preview Task
        </button>
        
        <button
          onClick={() => setShowPreview(true)}
          disabled={!taskData.title || recipientCount === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Assign to {recipientCount} Users
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onConfirm={handleCreateTask}
          title="Confirm Mass Task Assignment"
          confirmText={`Assign to ${recipientCount} Users`}
          loading={sending}
        >
          <div>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Title:</strong> {taskData.title}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Priority:</strong> {taskData.priority}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Due Date:</strong> {taskData.dueDate ? new Date(taskData.dueDate).toLocaleString() : 'No due date'}
            </p>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div dangerouslySetInnerHTML={{ __html: taskData.description }} />
            </div>
          </div>
        </PreviewModal>
      )}
    </div>
  );
};

export default MassTaskCreation;
