import { Shield, Eye, EyeOff } from "lucide-react";

interface PrivacySettingsProps {
  showEmail: boolean;
  showPhone: boolean;
  onToggleEmail: () => void;
  onTogglePhone: () => void;
  updating: boolean;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  showEmail,
  showPhone,
  onToggleEmail,
  onTogglePhone,
  updating,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-6">
        <Shield className="h-6 w-6 text-orange-500 mr-3" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Privacy Settings</h2>
          <p className="text-sm text-gray-600">Control what information is visible to others</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Show Email Setting */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {showEmail ? (
              <Eye className="h-5 w-5 text-green-600" />
            ) : (
              <EyeOff className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <p className="font-medium text-gray-900">Show Email Publicly</p>
              <p className="text-sm text-gray-600">
                Allow other users to see your email address on your ads
              </p>
            </div>
          </div>
          <button
            onClick={onToggleEmail}
            disabled={updating}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showEmail ? "bg-green-600" : "bg-gray-300"
            } ${updating ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showEmail ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Show Phone Setting */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {showPhone ? (
              <Eye className="h-5 w-5 text-green-600" />
            ) : (
              <EyeOff className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <p className="font-medium text-gray-900">Show Phone Publicly</p>
              <p className="text-sm text-gray-600">
                Allow other users to see your phone number on your ads
              </p>
            </div>
          </div>
          <button
            onClick={onTogglePhone}
            disabled={updating}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showPhone ? "bg-green-600" : "bg-gray-300"
            } ${updating ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showPhone ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> These settings control the visibility of your contact information
          on your ads. Your information is always visible to you and site administrators.
        </p>
      </div>
    </div>
  );
};
