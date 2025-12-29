import React, { useState } from 'react';
import { massOpsApi } from '../../api/massOperationsApi';
import { useAuth } from '../../context/AuthContext';
import RecipientSelector from '../../components/RecipientSelector';
import RichTextEditor from '../../components/RichTextEditor';
import PreviewModal from '../../components/PreviewModal';
import { toast } from "sonner";

const MassMessaging = () => {
  const { user } = useAuth();
  const [messageData, setMessageData] = useState({
    subject: '',
    message: '',
    priority: 'normal',
    selectedGroups: [],
    selectedUsers: [],
    sendInApp: true,
    sendEmail: true,
  });
  const [recipientCount, setRecipientCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);

const handleSend = async () => {
  setSending(true);
  try {
    const groupId = messageData.selectedGroups[0]?.id;
    console.log('🔍 Debug - groupId:', groupId); // ✅ Add this
    console.log('🔍 Debug - selectedGroups:', messageData.selectedGroups);
    if (!groupId) {
      toast.error("Group Required", {
  description: "Mass messaging requires at least one group.",
});
      return;
    }
    

await massOpsApi.sendMessage({
  groupId,
  message: messageData.message,
  subject: messageData.subject, 
  priority: messageData.priority, 
});

    toast.success("Message Sent", {
      description: `Successfully sent to ${recipientCount} members.`,
    });

    // Reset form
    setMessageData({
      subject: '',
      message: '',
      priority: 'normal',
      selectedGroups: [],
      selectedUsers: [],
      sendInApp: true,
      sendEmail: true,
    });
    setRecipientCount(0);
    
  } catch (error) {
    toast.error("Message Sending Failed", {
  description:
    error?.response?.data?.message ||
    "Something went wrong while sending the message.",
});
  } finally {
    setSending(false);
    setShowPreview(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Mass Messaging</h1>

      {/* Step 1: Recipients */}
      <section className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Select Recipients</h2>
        <RecipientSelector
          mode="message"
          onSelect={(recipients) => {
            setMessageData(prev => ({
              ...prev,
              selectedGroups: recipients.groups,
              selectedUsers: recipients.users,
            }));
            setRecipientCount(recipients.count);
          }}
          allowOrganizationWide={user.role === 'manager'}
        />
        <p className="mt-4 text-sm text-gray-600">
          Total recipients: <strong>{recipientCount}</strong>
        </p>
      </section>

      {/* Step 2: Message */}
      <section className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Compose Message</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Subject *</label>
          <input
            type="text"
            value={messageData.subject}
            onChange={(e) => setMessageData(prev => ({ ...prev, subject: e.target.value }))}
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Enter message subject"
            maxLength={100}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Priority</label>
          <select
            value={messageData.priority}
            onChange={(e) => setMessageData(prev => ({ ...prev, priority: e.target.value }))}
            className="border rounded-lg px-4 py-2"
          >
            <option value="normal">Normal</option>
            <option value="important">🟡 Important</option>
            <option value="urgent">🔴 Urgent</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Message *</label>
          <RichTextEditor
            value={messageData.message}
            onChange={(html) => setMessageData(prev => ({ ...prev, message: html }))}
            placeholder="Compose your message..."
            maxLength={5000}
          />
        </div>
      </section>

      {/* Step 3: Delivery */}
      <section className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Delivery Options</h2>
        
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={messageData.sendInApp}
              onChange={(e) => setMessageData(prev => ({ ...prev, sendInApp: e.target.checked }))}
              className="mr-2"
            />
            Send in-app notification
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={messageData.sendEmail}
              onChange={(e) => setMessageData(prev => ({ ...prev, sendEmail: e.target.checked }))}
              className="mr-2"
            />
            Send email notification
          </label>
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowPreview(true)}
          disabled={!messageData.subject || !messageData.message || recipientCount === 0}
          className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          Preview Message
        </button>
        
        <button
          onClick={() => setShowPreview(true)}
          disabled={!messageData.subject || !messageData.message || recipientCount === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Send to {recipientCount} Users
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <PreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onConfirm={handleSend}
          title="Preview Message"
          confirmText={`Send to ${recipientCount} Users`}
          loading={sending}
        >
          <div>
            <p className="text-sm text-gray-600 mb-2">
              To: {recipientCount} recipients
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Subject: {messageData.subject}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Priority: {messageData.priority}
            </p>
            
            <div className="border rounded-lg p-4 bg-gray-50">
              <div dangerouslySetInnerHTML={{ __html: messageData.message }} />
            </div>
          </div>
        </PreviewModal>
      )}
    </div>
  );
};

export default MassMessaging;
