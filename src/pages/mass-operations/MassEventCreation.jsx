import React, { useState } from 'react';
import { massOpsApi } from '../../api/massOperationsApi';
import { useAuth } from '../../context/AuthContext';
import RecipientSelector from '../../components/RecipientSelector';
import RichTextEditor from '../../components/RichTextEditor';
import PreviewModal from '../../components/PreviewModal';
import { toast } from "sonner";


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
    userIds: [],
    groupMemberIds: [],
  });
  const [recipientCount, setRecipientCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);




// MassEventCreation.jsx - Update handleCreateEvent
const handleCreateEvent = async () => {
  // Validation
  if (!eventData.title.trim()) {
    toast.error("Missing title", {
      description: "Please enter an event title",
    });
    return;
  }

  if (!eventData.startDateTime || !eventData.endDateTime) {
    toast.error("Missing dates", {
      description: "Please select start and end times",
    });
    return;
  }

  if (eventData.selectedGroups.length === 0 && eventData.selectedUsers.length === 0) {
    toast.error("No recipients", {
      description: "Please select at least one group or user",
    });
    return;
  }

  setSending(true);

  try {
    const startIso = new Date(eventData.startDateTime).toISOString();
    const endIso = new Date(eventData.endDateTime).toISOString();

    // If groups are selected, use mass event API
    if (eventData.selectedGroups.length > 0) {
      const groupIds = eventData.selectedGroups.map((g) => g.id).filter(Boolean);
      
      // Creating mass event for selected groups
      
      // ✅ Send proper payload to backend (supports multiple groups)
      await Promise.all(
        groupIds.map((groupId) =>
          massOpsApi.createMassEvent({
            groupId,
            title: eventData.title,
            description: eventData.description,
            startDate: startIso,
            endDate: endIso,
            type: 'Meeting',
            visibility: 'GroupOnly',
            location: eventData.location || null,
            conferencingLink: null,
          })
        )
      );
      
      // Also handle individually-selected users that are NOT in the selected groups.
      const groupMemberIds = Array.isArray(eventData.groupMemberIds) ? eventData.groupMemberIds : [];
      const userIds = Array.isArray(eventData.userIds) ? eventData.userIds : [];
      const individualOnlyIds = userIds.filter((id) => !groupMemberIds.includes(id));

      if (individualOnlyIds.length > 0) {
        const { eventsApi } = await import('../../api/eventsApi');
        await eventsApi.createEvent({
          title: eventData.title,
          description: eventData.description,
          startDate: startIso,
          endDate: endIso,
          type: 'Meeting',
          visibility: 'Private',
          attendees: individualOnlyIds,
          location: eventData.location || null,
          conferencingLink: null,
        });
      }

      toast.success("Mass event created", {
        description: `Successfully created event for ${recipientCount} recipient${recipientCount !== 1 ? 's' : ''}.`,
      });
      window.dispatchEvent(new Event('opexcal:refresh-notifications'));
    } 
    // If only individual users, create individual events
    else if (eventData.selectedUsers.length > 0) {
      const { eventsApi } = await import('../../api/eventsApi');
      
      console.log('📝 Creating individual events for users:', eventData.selectedUsers);
      
      // ✅ Create single event with all users as attendees
      await eventsApi.createEvent({
        title: eventData.title,
        description: eventData.description,
        startDate: startIso,
        endDate: endIso,
        type: 'Meeting',
        visibility: 'Private',
        attendees: eventData.selectedUsers.map(u => u.id),
        location: eventData.location || null,
        conferencingLink: null,
      });
      
      toast.success("Event created", {
        description: `Successfully created event for ${recipientCount} recipient${recipientCount !== 1 ? 's' : ''}.`,
      });
      window.dispatchEvent(new Event('opexcal:refresh-notifications'));
    }

    // Reset form
    setEventData({
      title: '',
      description: '',
      startDateTime: '',
      endDateTime: '',
      location: '',
      selectedGroups: [],
      selectedUsers: [],
      userIds: [],
      groupMemberIds: [],
    });
    setRecipientCount(0);
    setShowPreview(false);
    
  } catch (error) {
    console.error('❌ Event creation error:', error);
    toast.error("Event Creation Failed", {
      description: error?.message || "Something went wrong",
    });
  } finally {
    setSending(false);
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
    console.log('📥 Received recipients:', recipients);
    setEventData(prev => ({
      ...prev,
      selectedGroups: recipients.groups || [],
      selectedUsers: recipients.users || [],
      userIds: recipients.userIds || [],
      groupMemberIds: recipients.groupMemberIds || [],
    }));
    setRecipientCount(recipients.count || 0);
  }}
  allowOrganizationWide={user?.role === 'SuperAdmin'}
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
