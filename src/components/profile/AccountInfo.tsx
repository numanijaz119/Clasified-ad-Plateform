import React from "react";
import { Calendar, Check, X } from "lucide-react";
import { User } from './types';

interface AccountInfoProps {
  user: User;
  onResendVerification?: () => void;
}

const AccountInfo: React.FC<AccountInfoProps> = ({
  user,
  onResendVerification,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Account Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Account Created
          </label>
          <div className="flex items-center space-x-2 mt-1">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-900">{formatDate(user.created_at)}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Last Updated
          </label>
          <div className="flex items-center space-x-2 mt-1">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-900">{formatDate(user.updated_at)}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            User ID
          </label>
          <p className="text-gray-900 mt-1">#{user.id}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email Verification
          </label>
          <div className="flex items-center space-x-2 mt-1">
            {user.email_verified ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-green-600">Verified</span>
              </>
            ) : (
              <>
                <X className="w-4 h-4 text-red-500" />
                <span className="text-red-600">Not Verified</span>
                {onResendVerification && (
                  <button
                    onClick={onResendVerification}
                    className="text-orange-600 hover:text-orange-700 text-sm font-medium ml-2 transition-colors"
                  >
                    Send Verification Email
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountInfo;
