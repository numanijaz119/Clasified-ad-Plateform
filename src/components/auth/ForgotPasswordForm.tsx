// src/components/auth/ForgotPasswordForm.tsx - Simplified version
import React, { useState } from "react";
import { Mail, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface ForgotPasswordFormProps {
  onSuccess: (email: string) => void;
  onBack: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSuccess, onBack }) => {
  const { forgotPassword, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState("");

  const validateEmail = (emailValue: string): boolean => {
    if (!emailValue) {
      setLocalError("Email address is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      setLocalError("Please enter a valid email address");
      return false;
    }

    setLocalError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    if (localError) setLocalError("");
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError("");

    const trimmedEmail = email.trim().toLowerCase();

    if (!validateEmail(trimmedEmail)) {
      return;
    }

    try {
      await forgotPassword({ email: trimmedEmail });
      onSuccess(trimmedEmail);
    } catch (err: any) {
      console.error("Forgot password error:", err);

      let errorMessage = "Something went wrong. Please try again.";

      if (err.details) {
        if (err.details.email && Array.isArray(err.details.email)) {
          errorMessage = err.details.email[0];
        } else if (err.details.non_field_errors && Array.isArray(err.details.non_field_errors)) {
          errorMessage = err.details.non_field_errors[0];
        } else if (typeof err.details === "string") {
          errorMessage = err.details;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Map backend errors to user-friendly messages
      if (errorMessage.toLowerCase().includes("not found")) {
        errorMessage = "We couldn't find an account with this email address.";
      } else if (errorMessage.toLowerCase().includes("not active")) {
        errorMessage = "This account is not active. Please contact support.";
      } else if (errorMessage.toLowerCase().includes("suspended")) {
        errorMessage = "This account has been suspended. Please contact support.";
      }

      setLocalError(errorMessage);
    }
  };

  const displayError = localError || error;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        disabled={isLoading}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Sign In
      </button>

      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Forgot your password?</h3>
        <p className="text-gray-600">
          Enter your email address and we'll send you a verification code to reset your password.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Enter your email address"
            className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              displayError
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-orange-500 focus:border-transparent"
            }`}
            required
            disabled={isLoading}
            autoComplete="email"
          />
          <Mail
            className={`absolute left-4 top-11 h-5 w-5 ${
              displayError ? "text-red-400" : "text-gray-400"
            }`}
          />
        </div>

        {/* Error Display */}
        {displayError && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{displayError}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Sending Reset Code..." : "Send Reset Code"}
        </button>
      </form>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Remember your password?{" "}
          <button
            onClick={onBack}
            className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
            disabled={isLoading}
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
