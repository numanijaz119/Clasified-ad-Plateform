// src/components/auth/PasswordHelper.tsx - Simplified version matching Django backend validation
import React from "react";
import { Check, X } from "lucide-react";

interface PasswordHelperProps {
  password: string;
  confirmPassword?: string;
  userEmail?: string;
  showConfirmCheck?: boolean;
}

export const PasswordHelper: React.FC<PasswordHelperProps> = ({
  password,
  confirmPassword,
  userEmail,
  showConfirmCheck = false,
}) => {
  if (!password) return null;

  // Only Django AUTH_PASSWORD_VALIDATORS checks
  const checks = [
    {
      label: "At least 8 characters",
      passed: password.length >= 8,
    },
    {
      label: "Not entirely numeric",
      passed: !/^\d+$/.test(password),
    },
    {
      label: "Not a common password",
      passed: ![
        "password",
        "password123",
        "123456",
        "123456789",
        "qwerty",
        "abc123",
      ].includes(password.toLowerCase()),
    },
  ];

  // Add email similarity check if email provided
  if (userEmail) {
    const emailPart = userEmail.split("@")[0];
    checks.push({
      label: "Not similar to your email",
      passed: !password.toLowerCase().includes(emailPart.toLowerCase()),
    });
  }

  // Add confirm password check
  if (showConfirmCheck && confirmPassword !== undefined) {
    checks.push({
      label: "Passwords match",
      passed: password === confirmPassword && confirmPassword.length > 0,
    });
  }

  const allPassed = checks.every((check) => check.passed);

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
      <div className="text-sm font-medium text-gray-700 mb-2">
        Password Requirements:
      </div>

      <div className="space-y-1">
        {checks.map((check, index) => (
          <div
            key={index}
            className={`flex items-center space-x-2 text-sm ${
              check.passed ? "text-green-600" : "text-red-500"
            }`}
          >
            {check.passed ? (
              <Check className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
            <span>{check.label}</span>
          </div>
        ))}
      </div>

      {allPassed && (
        <div className="mt-2 text-sm text-green-600 font-medium">
          ✓ Password meets all requirements
        </div>
      )}
    </div>
  );
};
