import React from "react";
import { CheckCircle, ArrowRight } from "lucide-react";

interface VerificationSuccessProps {
  onContinueToSignIn: () => void;
}

const VerificationSuccess: React.FC<VerificationSuccessProps> = ({
  onContinueToSignIn,
}) => {
  return (
    <>
      {/* Custom Header */}
      <div className="flex items-center justify-center p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Email Verified!</h2>
      </div>

      <div className="px-6 py-8">
        <div className="text-center space-y-6">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>

          {/* Success Message */}
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-gray-900">
              Verification Successful!
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed max-w-sm mx-auto">
              Your email has been successfully verified. You can now sign in to
              your account.
            </p>
          </div>

          {/* Go to Sign In Button */}
          <div className="pt-6">
            <button
              onClick={onContinueToSignIn}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold flex items-center justify-center group"
            >
              <span>Go to Sign In</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerificationSuccess;
