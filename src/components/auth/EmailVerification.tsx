import React, { useEffect, useState } from "react";
import { Mail, ArrowLeft, AlertCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface EmailVerificationProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
  initialMessage?: string;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onSuccess,
  onBack,
  initialMessage,
}) => {
  const { verifyEmail, resendVerification, isLoading, error, clearError } =
    useAuth();
  const [verificationCode, setVerificationCode] = useState("");
  const [success, setSuccess] = useState(initialMessage || "");
  const [sendingOtp, setSendingOtp] = useState(false);
  const isCodeShort = verificationCode.length < 6 ? true : false;

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      if (verificationCode.length < 6) {
        throw new Error("Please enter a valid verification code");
      }

      await verifyEmail({ code: verificationCode });
      onSuccess();
    } catch (err: any) {
      // Error is handled by auth context
      console.error("Email verification error:", err);
    }
  };

  const resendVerificationEmail = async () => {
    clearError();
    setSuccess("");
    setSendingOtp(true);

    try {
      await resendVerification({ email });
      setSuccess("Verification email sent! Please check your inbox.");
    } catch (err: any) {
      // Error is handled by auth context
      console.error("Resend verification error:", err);
    } finally {
      setSendingOtp(false);
    }
  };

  return (
    <>
      {/* Custom Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-3 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">Verify Email</h2>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Check your email
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              We've sent a verification code to
              <br />
              <strong>{email}</strong>
            </p>
            {/* <p className="text-gray-500 text-xs">
              Enter the verification code below
            </p> */}
          </div>

          {/* Show success message from registration */}
          {/* {success && (
            <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )} */}

          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter verification code"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-lg tracking-wide"
                disabled={isLoading}
                maxLength={6}
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
              disabled={isLoading || !verificationCode || isCodeShort}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && sendingOtp ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Didn't receive the email?
            </p>
            <button
              onClick={resendVerificationEmail}
              disabled={isLoading}
              className="text-orange-500 hover:text-orange-600 font-medium disabled:opacity-50"
            >
              {sendingOtp ? "Sending..." : "Resend Email"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailVerification;
