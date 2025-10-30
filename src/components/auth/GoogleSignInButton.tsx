import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { initializeGoogleAuth, signInWithGoogle } from "../../utils/googleAuth";

interface GoogleSignInButtonProps {
  onSuccess: () => void;
  buttonText?: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  buttonText = "Continue with Google",
}) => {
  const { googleLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleInitialized, setGoogleInitialized] = useState(false);

  // Initialize Google OAuth when component mounts
  useEffect(() => {
    if (!googleInitialized) {
      initializeGoogleAuth(handleGoogleLoginWrapper)
        .then(() => setGoogleInitialized(true))
        .catch(err => {
          console.error("Google OAuth initialization failed:", err);
          setError("Google sign-in is temporarily unavailable");
        });
    }
  }, [googleInitialized]);

  // Wrapper to handle success callback after googleLogin completes
  const handleGoogleLoginWrapper = async (tokenData: { id_token: string }) => {
    try {
      await googleLogin(tokenData);
      // Only call onSuccess after googleLogin completes successfully
      onSuccess();
    } catch (err) {
      // Error is already handled by googleLogin, just rethrow
      throw err;
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      if (!googleInitialized) {
        throw new Error("Google OAuth not initialized. Please try again.");
      }

      // The callback in signInWithGoogle will handle calling onSuccess
      await signInWithGoogle(handleGoogleLoginWrapper);
    } catch (err: any) {
      console.error("Google sign-in error:", err);

      // Don't show error if user simply dismissed the popup
      const isDismissed =
        err.message?.includes("dismissed") ||
        err.message?.includes("closed") ||
        err.message?.includes("popup");

      if (!isDismissed) {
        // Show user-friendly error messages
        let errorMessage = "Google sign-in failed. Please try again.";

        if (err.message?.includes("clock") || err.message?.includes("time")) {
          errorMessage =
            "Your computer's clock is not synchronized. Please check your system time settings and try again.";
        } else if (err.message?.includes("expired")) {
          errorMessage = "Google sign-in session expired. Please try again.";
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
      }

      setIsLoading(false);
    }
    // Don't set loading to false here - let it stay until success callback
  };

  if (error) {
    return <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg text-center">{error}</div>;
  }

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={isLoading || !googleInitialized}
      className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={buttonText}
    >
      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {isLoading ? "Signing in..." : buttonText}
    </button>
  );
};

export default GoogleSignInButton;
