import React, { useState } from 'react';
import { massOpsApi } from '../../api/massOperationsApi';
import { useAuth } from '../../context/AuthContext';
import RecipientSelector from '../../components/RecipientSelector';
import RichTextEditor from '../../components/RichTextEditor';
import PreviewModal from '../../components/PreviewModal';

const MassEventCreation = () => {
  const { user } = useAuth();
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    location: '',
    selectedGroups: [],
    selectedUsers: [],
  });
  const [recipientCount, setRecipientCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);

  const handleCreateEvent = async () => {
    setSending(true);
    try {
      await massOpsApi.createMassEvent({
        event: {
          title: eventData.title,
          description: eventData.description,
          startDateTime: eventData.startDateTime,
          endDateTime: eventData.endDateTime,
          location: eventData.location,
        },
        attendees: {
          groupIds: eventData.selectedGroups.map(g => g.id),
          userIds: eventData.selectedUsers.map(u => u.id),
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
      <h1 className="text-2xl font-bold mb-6">Mass Event Creation</h1>

      {/* Step 1: Attendees */}
      <section className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Select Attendees</h2>
        <RecipientSelector
          mode="event"
          onSelect={(recipients) => {
            setEventData(prev => ({
              ...prev,
              selectedGroups: recipients.groups,
              selectedUsers: recipients.users,
            }));
            setRecipientCount(recipients.count);
          }}
          allowOrganizationWide={user.role === 'manager'}
        />
        <p className="mt-4 text-sm text-gray-600">
          Total attendees: <strong>{recipientCount}</strong>
        </p>
      </section>

      {/* Step 2: Event Details */}
      <section className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Event Details</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Event Title *</label>
          <input
            type="text"
            value={eventData.title}
            onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Enter event title"
            maxLength={100}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Time *</label>
            <input
              type="datetime-local"
              value={eventData.startDateTime}
              onChange={(e) => setEventData(prev => ({ ...prev, startDateTime: e.target.value }))}
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Time *</label>
            <input
              type="datetime-local"
              value={eventData.endDateTime}
              onChange={(e) => setEventData(prev => ({ ...prev, endDateTime: e.target.value }))}
              className="w-full border rounded-lg px-4 py-2"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Location / Link</label>
          <input
            type="text"
            value={eventData.location}
            onChange={(e) => setEventData(prev => ({ ...prev, location: e.target.value }))}
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Meeting Room A or Zoom Link"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Description</label>
          <RichTextEditor
            value={eventData.description}
            onChange={(html) => setEventData(prev => ({ ...prev, description: html }))}
            placeholder="Event details..."
            maxLength={2000}
          />
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowPreview(true)}
          disabled={!eventData.title || !eventData.startDateTime || recipientCount === 0}
          className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          Preview Event
        </button>
        
        <button
          onClick={() => setShowPreview(true)}
          disabled={!eventData.title || !eventData.startDateTime || recipientCount === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Invite {recipientCount} Users
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onConfirm={handleCreateEvent}
          title="Confirm Mass Event Creation"
          confirmText={`Invite ${recipientCount} Users`}
          loading={sending}
        >
          <div>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Title:</strong> {eventData.title}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Time:</strong> {new Date(eventData.startDateTime).toLocaleString()} - {new Date(eventData.endDateTime).toLocaleTimeString()}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Location:</strong> {eventData.location || 'N/A'}
            </p>
            <div className="border rounded-lg p-4 bg-gray-50">
              <div dangerouslySetInnerHTML={{ __html: eventData.description }} />
            </div>
          </div>
        </PreviewModal>
      )}
    </div>
  );
};

export default MassEventCreation;
