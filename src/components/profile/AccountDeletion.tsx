import React, { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";

interface AccountDeletionProps {
  onDelete: () => Promise<void>;
  updating: boolean;
}

const AccountDeletion: React.FC<AccountDeletionProps> = ({
  onDelete,
  updating,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setConfirmText("");
  };

  const handleConfirmDelete = async () => {
    if (confirmText.toLowerCase() === "delete") {
      await onDelete();
    }
  };

  const isConfirmValid = confirmText.toLowerCase() === "delete";

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-red-100 rounded-lg">
          <Trash2 className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Delete Account
          </h3>
          <p className="text-sm text-gray-600">
            Permanently delete your account and all associated data
          </p>
        </div>
      </div>

      {!showConfirmation ? (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-2">Warning: This action cannot be undone</p>
                <ul className="list-disc list-inside space-y-1 text-red-700">
                  <li>All your ads will be permanently deleted</li>
                  <li>Your profile information will be removed</li>
                  <li>You will lose access to your account immediately</li>
                  <li>This action is irreversible</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleDeleteClick}
            className="w-full bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete My Account
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-2">Final Confirmation Required</p>
                <p>
                  Type <span className="font-bold">DELETE</span> below to confirm account deletion
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type "DELETE" to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={updating}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={updating}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={!isConfirmValid || updating}
              className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {updating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Confirm Delete
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDeletion;
