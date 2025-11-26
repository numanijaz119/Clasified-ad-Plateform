// frontend/src/pages/PaymentCancel.tsx
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle, Home, ArrowLeft, CreditCard, HelpCircle } from "lucide-react";

const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const adSlug = searchParams.get("ad");

  const handleRetryPayment = () => {
    if (adSlug) {
      navigate(`/ad/${adSlug}`);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Cancel Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
              <XCircle className="h-12 w-12 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Payment Cancelled</h1>
            <p className="text-orange-100">Your payment was not completed</p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <p className="text-lg text-gray-700 mb-4">
                You have cancelled the payment process. No charges were made to your account.
              </p>
              <p className="text-gray-600">
                If you experienced any issues during checkout, please try again or contact our
                support team for assistance.
              </p>
            </div>

            {/* Common Issues */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-gray-600" />
                Common Issues
              </h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span>Changed your mind about the purchase</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span>Payment information was incorrect</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span>Encountered technical difficulties</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span>Want to review pricing options</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleRetryPayment}
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-orange-600 hover:bg-orange-700 transition-colors"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Try Again
              </button>

              <button
                onClick={() => navigate(-1)}
                className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Go Back
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full inline-flex items-center justify-center px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="h-5 w-5 mr-2" />
                Back to Home
              </button>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help with payment?{" "}
            <button className="text-orange-600 hover:text-orange-700 font-medium">
              Contact Support
            </button>
          </p>
        </div>

        {/* Info Box */}
        <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-start">
            <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Payment Security</p>
              <p className="text-gray-600">
                All payments are processed securely through Stripe. We never store your payment
                information on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
