import React, { useState } from "react";
import { Mail, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { authService } from "../../services/authService";
import GoogleSignInButton from "./GoogleSignInButton";

interface SignInFormProps {
  onSuccess: () => void;
  onSwitchToSignUp: () => void;
  onSwitchToVerification: (email: string) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({
  onSuccess,
  onSwitchToSignUp,
  onSwitchToVerification,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Basic validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      const loginData = {
        email: email.trim(),
        password,
      };

      await authService.login(loginData);

      // Success - the auth service should handle token storage and emit auth events
      // App.tsx will catch the auth:login event and update state
      onSuccess();
    } catch (err: any) {
      console.error("Sign in error:", err);

      let errorMessage = "Something went wrong. Please try again.";

      if (err.details && typeof err.details === "object") {
        const fieldErrors = [];
        for (const [field, messages] of Object.entries(err.details)) {
          if (Array.isArray(messages)) {
            fieldErrors.push(...messages);
          } else if (typeof messages === "string") {
            fieldErrors.push(messages);
          } else {
            fieldErrors.push(String(messages));
          }
        }
        if (fieldErrors.length > 0) {
          errorMessage = fieldErrors[0];
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Handle email verification error
      if (
        errorMessage.includes("verify your email") ||
        errorMessage.includes("email_not_verified")
      ) {
        onSwitchToVerification(email);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Google Sign In */}
      <GoogleSignInButton onSuccess={onSuccess} />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or</span>
        </div>
      </div>

      {/* Email Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
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

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      {/* Toggle to Sign Up */}
      <div className="text-center">
        <button
          onClick={onSwitchToSignUp}
          className="text-orange-500 hover:text-orange-600 font-medium"
          disabled={isLoading}
        >
          Don't have an account? Sign Up
        </button>
      </div>

      {/* Forgot Password */}
      <div className="text-center">
        <button className="text-sm text-gray-500 hover:text-gray-700">
          Forgot your password?
        </button>
      </div>
    </div>
  );
};

export default SignInForm;
