// src/components/SignInModal.tsx - REFACTORED VERSION
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseModal from "./modals/BaseModal";
import SignInForm from "./auth/SignInForm";
import SignUpForm from "./auth/SignUpForm";
import EmailVerification from "./auth/EmailVerification";
import VerificationSuccess from "./auth/VerificationSuccess";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInSuccess: () => void;
}

type ModalStep = "signin" | "signup" | "verify" | "success";

const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  onSignInSuccess,
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<ModalStep>("signin");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");

  const handleSignInSuccess = () => {
    // Reset modal state first
    resetModal();

    // Call the parent success handler to update app state
    // This will handle setting user data and auth state in App.tsx
    onSignInSuccess();

    // Navigate to dashboard (optional - you might handle this in App.tsx)
    navigate("/dashboard");
  };

  const handleSignUpSuccess = (email: string, message?: string) => {
    setVerificationEmail(email);
    setVerificationMessage(message || "");
    setCurrentStep("verify");
  };

  const handleVerificationSuccess = () => {
    setCurrentStep("success");
  };

  const handleContinueToSignIn = () => {
    setCurrentStep("signin");
    setVerificationEmail("");
    setVerificationMessage("");
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

  const handleSwitchToVerification = (email: string) => {
    setVerificationEmail(email);
    setVerificationMessage(
      "Please verify your email address before logging in."
    );
    setCurrentStep("verify");
  };

  const getModalTitle = () => {
    switch (currentStep) {
      case "signin":
        return "Sign In";
      case "signup":
        return "Create Account";
      case "verify":
      case "success":
        return undefined; // These steps have custom headers
      default:
        return "Sign In";
    }
  };

  const shouldShowCloseButton = () => {
    return currentStep === "signin" || currentStep === "signup";
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
            />
          </div>
        );

      case "signup":
        return (
          <div className="px-6 py-4">
            <SignUpForm
              onSuccess={handleSignUpSuccess}
              onSwitchToSignIn={() => setCurrentStep("signin")}
            />
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
          <VerificationSuccess onContinueToSignIn={handleContinueToSignIn} />
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
    >
      {renderContent()}
    </BaseModal>
  );
};

export default SignInModal;
