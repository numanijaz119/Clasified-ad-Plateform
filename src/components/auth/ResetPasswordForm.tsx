import React, { useState } from "react";
import {
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface ResetPasswordFormProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
  initialMessage?: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  email,
  onSuccess,
  onBack,
  initialMessage,
}) => {
  const { resetPassword, isLoading, error, clearError } = useAuth();
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success] = useState(initialMessage || "");

  const isCodeShort = code.length < 6;
  const passwordsMatch = newPassword === confirmPassword;
  const isFormValid = !isCodeShort && newPassword.length >= 8 && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      if (code.length < 6) {
        throw new Error("Please enter a valid verification code");
      }

      if (newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      await resetPassword({
        email: email.trim(),
        code: code.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      onSuccess();
    } catch (err: any) {
      console.error("Reset password error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        disabled={isLoading}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </button>

      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Reset Your Password
        </h3>
        <p className="text-gray-600">
          Enter the verification code sent to <strong>{email}</strong> and your
          new password.
        </p>
      </div>

      {success && (
        <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg flex items-start space-x-2">
          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-lg tracking-wide"
            disabled={isLoading}
            maxLength={6}
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={isLoading}
            minLength={8}
          />
          <Key className="absolute left-4 top-11 h-5 w-5 text-gray-400" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-11 text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={isLoading}
            minLength={8}
          />
          <Key className="absolute left-4 top-11 h-5 w-5 text-gray-400" />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-11 text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        {confirmPassword && !passwordsMatch && (
          <p className="text-red-500 text-sm">Passwords do not match</p>
        )}

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Resetting Password..." : "Reset Password"}
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Didn't receive the code?{" "}
          <button
            onClick={onBack}
            className="text-orange-500 hover:text-orange-600 font-medium"
            disabled={isLoading}
          >
            Try again
          </button>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
