// src/components/auth/ForgotPasswordForm.tsx
import React, { useState } from "react";
import { Mail, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface ForgotPasswordFormProps {
  onSuccess: (email: string) => void;
  onBack: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSuccess,
  onBack,
}) => {
  const { forgotPassword, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState("umanijaz5@gmail.com");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      // Basic validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      await forgotPassword({ email: email.trim() });
      onSuccess(email);
    } catch (err: any) {
      console.error("Forgot password error:", err);
      // Error handling is managed by the auth context
    }
  };

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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Forgot your password?
        </h3>
        <p className="text-gray-600">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
            disabled={isLoading}
          />
          <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
        </div>

        {/* Error Display */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
        </button>
      </form>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Remember your password?{" "}
          <button
            onClick={onBack}
            className="text-orange-500 hover:text-orange-600 font-medium"
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
