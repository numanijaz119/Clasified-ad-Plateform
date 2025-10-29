import React from "react";
import { Bell, Mail, MessageSquare } from "lucide-react";

interface NotificationSettingsProps {
  emailNotifications: boolean;
  emailMessageNotifications: boolean;
  onToggleEmailNotifications: () => void;
  onToggleEmailMessageNotifications: () => void;
  updating: boolean;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  emailNotifications,
  emailMessageNotifications,
  onToggleEmailNotifications,
  onToggleEmailMessageNotifications,
  updating,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Bell className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Notification Settings
          </h3>
          <p className="text-sm text-gray-600">
            Manage how you receive notifications and updates
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* General Email Notifications */}
        <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-3 flex-1">
            <Mail className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600 mt-1">
                Receive email notifications for important updates, ad status changes, and system announcements
              </p>
            </div>
          </div>
          <button
            onClick={onToggleEmailNotifications}
            disabled={updating}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              emailNotifications ? "bg-orange-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                emailNotifications ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Message Notifications */}
        <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-3 flex-1">
            <MessageSquare className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Message Notifications</h4>
              <p className="text-sm text-gray-600 mt-1">
                Get notified when you receive new messages or conversation updates
              </p>
            </div>
          </div>
          <button
            onClick={onToggleEmailMessageNotifications}
            disabled={updating}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              emailMessageNotifications ? "bg-orange-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                emailMessageNotifications ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Critical security notifications and account-related emails will always be sent regardless of these settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
