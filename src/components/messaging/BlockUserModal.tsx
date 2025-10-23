// src/components/messaging/BlockUserModal.tsx
import React from 'react';
import { AlertTriangle, Ban } from 'lucide-react';
import BaseModal from '../modals/BaseModal';

interface BlockUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  conversationCount?: number;
}

const BlockUserModal: React.FC<BlockUserModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  conversationCount = 1,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      closeOnOverlayClick={false}
    >
      <div className="p-6">
        {/* Icon */}
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
          <Ban className="w-8 h-8 text-red-600" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          Block {userName}?
        </h3>

        {/* Description */}
        <div className="space-y-3 mb-6">
          <p className="text-sm text-gray-600 text-center">
            {conversationCount > 1 ? (
              <>
                This will block <span className="font-semibold">{conversationCount} conversations</span> with this user.
              </>
            ) : (
              <>
                This will block your conversation with <span className="font-semibold">{userName}</span>.
              </>
            )}
          </p>

          {/* Warning Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">What happens when you block:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>All conversations will be moved to Blocked Chats</li>
                  <li>You won't receive messages from this user</li>
                  <li>They won't be able to start new conversations with you</li>
                  <li>You can unblock them anytime from Blocked Chats</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Ban className="w-4 h-4" />
            Block User
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default BlockUserModal;
