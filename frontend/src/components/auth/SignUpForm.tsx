import React, { useState } from "react";
import { Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import GoogleSignInButton from "./GoogleSignInButton";

interface SignUpFormProps {
  onSuccess: (email: string, message?: string) => void;
  onSwitchToSignIn: () => void;
  onGoogleSuccess?: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  onSuccess,
  onSwitchToSignIn,
  onGoogleSuccess,
}) => {
  const { register, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      // Basic validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      if (!firstName.trim()) {
        throw new Error("First name is required");
      }

      if (!lastName.trim()) {
        throw new Error("Last name is required");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      // Backend expects these exact field names
      const registerData = {
        email: email.trim(),
        password,
        password_confirm: confirmPassword,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
      };

      const response = await register(registerData);

      // Check if verification is required
      if (response.requires_verification === false) {
        // Auto-verified, trigger success callback which will close modal
        if (onGoogleSuccess) {
          onGoogleSuccess();
        }
      } else {
        // Registration successful - switch to verification step
        onSuccess(email, response.message || "Registration successful! Please check your email.");
      }
    } catch (err: any) {
      console.error("Registration error:", err);

      let errorMessage = "Something went wrong. Please try again.";

      if (err.details && typeof err.details === "object") {
        const fieldErrors = [];
        for (const [, messages] of Object.entries(err.details)) {
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

      // Error is handled by auth context, but we can throw with custom message
      throw new Error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Google Sign Up */}
      <GoogleSignInButton
        onSuccess={onGoogleSuccess || (() => onSuccess(email))}
        buttonText="Continue with Google"
      />

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
        {/* Name fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="First Name *"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              placeholder="Last Name *"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Phone - Optional */}
        <div>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Phone Number (optional)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        {/* Email */}
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
            disabled={isLoading}
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
            disabled={isLoading}
            minLength={8}
          />
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
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      {/* Toggle to Sign In */}
      <div className="text-center">
        <button
          onClick={onSwitchToSignIn}
          className="text-orange-500 hover:text-orange-600 font-medium"
          disabled={isLoading}
        >
          Already have an account? Sign In
        </button>
      </div>
    </div>
  );
};

export default SignUpForm;
