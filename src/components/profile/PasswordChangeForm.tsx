import React from "react";
import { Shield, Eye, EyeOff } from "lucide-react";
import { User } from './types';

interface PasswordChangeData {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

interface PasswordChangeFormProps {
  user: User;
  isChangingPassword: boolean;
  passwordData: PasswordChangeData;
  showPassword: {
    old: boolean;
    new: boolean;
    confirm: boolean;
  };
  errors: Record<string, string>;
  updating: boolean;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTogglePassword: (field: "old" | "new" | "confirm") => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onStartChanging: () => void;
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  user,
  isChangingPassword,
  passwordData,
  showPassword,
  errors,
  updating,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onCancel,
  onStartChanging,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Account Security
      </h2>

      {isChangingPassword ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPassword.old ? "text" : "password"}
                name="old_password"
                value={passwordData.old_password}
                onChange={onPasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-10 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => onTogglePassword("old")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword.old ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.old_password && (
              <p className="text-red-500 text-sm mt-1">{errors.old_password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword.new ? "text" : "password"}
                name="new_password"
                value={passwordData.new_password}
                onChange={onPasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-10 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => onTogglePassword("new")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword.new ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.new_password && (
              <p className="text-red-500 text-sm mt-1">{errors.new_password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPassword.confirm ? "text" : "password"}
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={onPasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-10 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => onTogglePassword("confirm")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword.confirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirm_password}
              </p>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onSubmit}
              disabled={updating}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {updating ? "Changing..." : "Change Password"}
            </button>
            <button
              onClick={onCancel}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Password</h3>
              <p className="text-sm text-gray-500">Last changed: Not tracked</p>
            </div>
            <button
              onClick={onStartChanging}
              className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
            >
              Change Password
            </button>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-2">Account Status</h3>
            <div className="flex items-center space-x-2">
              <Shield
                className={`w-4 h-4 ${
                  user.is_active ? "text-green-500" : "text-red-500"
                }`}
              />
              <span
                className={user.is_active ? "text-green-600" : "text-red-600"}
              >
                {user.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordChangeForm;
