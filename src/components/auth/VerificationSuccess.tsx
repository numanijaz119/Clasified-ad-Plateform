import React, { useEffect } from "react";
import { CheckCircle } from "lucide-react";

interface VerificationSuccessProps {
  onContinueToSignIn: () => void;
}

const VerificationSuccess: React.FC<VerificationSuccessProps> = ({
  onContinueToSignIn,
}) => {
  // Auto redirect after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinueToSignIn();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onContinueToSignIn]);

  return (
    <>
      {/* Custom Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Success!</h2>
      </div>

      <div className="px-6 py-4">
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Email Verified!
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Your email has been successfully verified. You can now sign in to
            your account.
          </p>
          <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">
            Redirecting to sign in in 3 seconds...
          </div>
          <button
            onClick={onContinueToSignIn}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold"
          >
            Continue to Sign In
          </button>
        </div>
      </div>
    </>
  );
};

export default VerificationSuccess;
