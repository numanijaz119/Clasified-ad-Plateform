import React from "react";
import { Shield, Eye, EyeOff } from "lucide-react";
import { PasswordHelper } from "../auth/PasswordHelper";
import { User } from "./types";
import Button from "../ui/Button";
import { useAuth } from "../../contexts/AuthContext";

interface PasswordChangeData {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

interface PasswordChangeFormProps {
  user: User;
  google_id?: number;
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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate password last changed from updated_at
  // This assumes password changes update the user's updated_at field
  const getPasswordLastChanged = () => {
    // If user has a specific password_updated_at field, use that
    // Otherwise, fall back to updated_at as approximation
    const lastChanged = (user as any).password_updated_at || user.updated_at;

    if (lastChanged) {
      return formatDate(lastChanged);
    }

    // If no date available, show account creation date as fallback
    return `Since account creation (${formatDate(user.created_at)})`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Account Security
      </h2>

      {isChangingPassword ? (
        <form onSubmit={onSubmit} className="space-y-4">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none pr-10 transition-colors"
                required
                autoComplete="current-password"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none pr-10 transition-colors"
                required
                autoComplete="new-password"
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

            {/* 🔥 ONLY NEW ADDITION - Password validation */}
            {passwordData.new_password && (
              <PasswordHelper
                password={passwordData.new_password}
                confirmPassword={passwordData.confirm_password}
                userEmail={user.email}
                showConfirmCheck={true}
              />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none pr-10 transition-colors"
                required
                autoComplete="new-password"
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
            <Button type="submit" variant="primary" disabled={updating}>
              {updating ? "Changing..." : "Change Password"}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Password</h3>
              <p className="text-sm text-gray-500">
                Last changed: {getPasswordLastChanged()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onStartChanging}
              className={user.google_id ? "hidden" : ""}
            >
              Change Password
            </Button>

            <span
              className={
                !user.google_id ? "hidden" : "" + "text-sm text-orange-500 "
              }
            >
              Google account users cannot change their password here.
            </span>
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
