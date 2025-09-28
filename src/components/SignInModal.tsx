import React, { useState } from "react";
import { useAuthRedirect } from "../hooks/useAuthRedirect";
import BaseModal from "./modals/BaseModal";
import SignInForm from "./auth/SignInForm";
import SignUpForm from "./auth/SignUpForm";
import EmailVerification from "./auth/EmailVerification";
import VerificationSuccess from "./auth/VerificationSuccess";
import ForgotPasswordForm from "./auth/ForgotPasswordForm";
import ResetPasswordForm from "./auth/ResetPasswordForm";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInSuccess: () => void;
}

type ModalStep =
  | "signin"
  | "signup"
  | "verify"
  | "success"
  | "forgot-password"
  | "reset-password"
  | "password-reset-success";

const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  onSignInSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState<ModalStep>("signin");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");

  // Handle redirect after successful authentication
  useAuthRedirect();

  const handleSignInSuccess = () => {
    resetModal();
    onSignInSuccess();
    // Navigation will be handled by useAuthRedirect hook
    // which checks for redirect parameter in URL
  };

  const handleSignUpSuccess = (email: string, message?: string) => {
    setVerificationEmail(email);
    setVerificationMessage(message || "");
    setCurrentStep("verify");
  };

  const handleVerificationSuccess = () => {
    // After successful verification, show success modal
    // Don't auto-login, let user manually sign in
    setCurrentStep("success");
  };

  const handleSwitchToSignInAfterVerification = () => {
    setCurrentStep("signin");
  };

  const handleSwitchToVerification = (email: string) => {
    setVerificationEmail(email);
    setVerificationMessage(
      "Please verify your email address before logging in."
    );
    setCurrentStep("verify");
  };

  const handleForgotPasswordOtpSent = (email: string) => {
    setVerificationEmail(email);
    setVerificationMessage(
      "Password reset code sent! Please check your inbox."
    );
    setCurrentStep("reset-password");
  };

  const handlePasswordResetSuccess = () => {
    setCurrentStep("password-reset-success");
  };

  const resetModal = () => {
    setCurrentStep("signin");
    setVerificationEmail("");
    setVerificationMessage("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const getModalTitle = () => {
    switch (currentStep) {
      case "signin":
        return "Sign In";
      case "signup":
        return "Create Account";
      case "forgot-password":
        return "Reset Password";
      case "reset-password":
        return "Reset Password";
      case "password-reset-success":
        return "Password Reset Complete";
      case "verify":
      case "success":
        return undefined;
      default:
        return "Sign In";
    }
  };

  const shouldShowCloseButton = () => {
    return [
      "signin",
      "signup",
      "forgot-password",
      "password-reset-success",
    ].includes(currentStep);
  };

  const renderContent = () => {
    switch (currentStep) {
      case "signin":
        return (
          <div className="px-6 py-4">
            <SignInForm
              onSuccess={handleSignInSuccess}
              onSwitchToSignUp={() => setCurrentStep("signup")}
              onSwitchToVerification={handleSwitchToVerification}
              onForgotPassword={() => setCurrentStep("forgot-password")}
            />
          </div>
        );

      case "signup":
        return (
          <div className="px-6 py-4">
            <SignUpForm
              onSuccess={handleSignUpSuccess}
              onSwitchToSignIn={() => setCurrentStep("signin")}
              onGoogleSuccess={handleSignInSuccess}
            />
          </div>
        );

      case "forgot-password":
        return (
          <div className="px-6 py-4">
            <ForgotPasswordForm
              onSuccess={handleForgotPasswordOtpSent}
              onBack={() => setCurrentStep("signin")}
            />
          </div>
        );

      case "reset-password":
        return (
          <div className="px-6 py-4">
            <ResetPasswordForm
              email={verificationEmail}
              onSuccess={handlePasswordResetSuccess}
              onBack={() => setCurrentStep("forgot-password")}
              initialMessage={verificationMessage}
            />
          </div>
        );

      case "password-reset-success":
        return (
          <div className="px-6 py-4">
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Password Reset Successful!
              </h3>
              <p className="text-gray-600 mb-6">
                Your password has been successfully updated. You can now sign in
                with your new password.
              </p>
              <button
                onClick={() => setCurrentStep("signin")}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold"
              >
                Continue to Sign In
              </button>
            </div>
          </div>
        );

      case "verify":
        return (
          <EmailVerification
            email={verificationEmail}
            onSuccess={handleVerificationSuccess}
            onBack={() => setCurrentStep("signin")}
            initialMessage={verificationMessage}
          />
        );

      case "success":
        return (
          <div className="px-6 py-4">
            <VerificationSuccess
              onContinueToSignIn={() => handleSwitchToSignInAfterVerification()}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="max-w-md"
      title={getModalTitle()}
      showCloseButton={shouldShowCloseButton()}
      closeOnOverlayClick={!["verify", "reset-password"].includes(currentStep)}
    >
      {renderContent()}
    </BaseModal>
  );
};

export default SignInModal;
