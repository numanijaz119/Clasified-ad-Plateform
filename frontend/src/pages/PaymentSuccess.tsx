// frontend/src/pages/PaymentSuccess.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Home, FileText, Loader, ArrowRight } from "lucide-react";
import { paymentService } from "../services/paymentService";
import { useToast } from "../contexts/ToastContext";
import type { PaymentDetailResponse } from "../types/payment";

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const [payment, setPayment] = useState<PaymentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const sessionId = searchParams.get("session_id");
  const adSlug = searchParams.get("ad");

  useEffect(() => {
    if (sessionId) {
      confirmPayment();
    } else {
      setLoading(false);
      toast.error("Invalid payment session");
    }
  }, [sessionId]);

  const confirmPayment = async () => {
    if (!sessionId) return;

    setConfirming(true);
    try {
      // Confirm the payment with backend
      const confirmedPayment = await paymentService.confirmPayment({
        session_id: sessionId,
      });

      setPayment(confirmedPayment);
      toast.success("Payment successful! Your benefits have been applied.");
    } catch (error: any) {
      console.error("Payment confirmation failed:", error);
      toast.error(error.message || "Failed to confirm payment");
    } finally {
      setConfirming(false);
      setLoading(false);
    }
  };

  const viewReceipt = async () => {
    if (!payment) return;

    try {
      const { receipt_url } = await paymentService.getReceipt(payment.id);
      window.open(receipt_url, "_blank");
    } catch (error: any) {
      toast.error(error.message || "Failed to load receipt");
    }
  };

  if (loading || confirming) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader className="h-16 w-16 text-green-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {confirming ? "Confirming Payment..." : "Loading..."}
          </h2>
          <p className="text-gray-600">Please wait while we process your payment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-green-100">Your transaction has been completed successfully</p>
          </div>

          {/* Payment Details */}
          {payment && (
            <div className="p-8">
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-sm text-gray-900">
                      {payment.id.substring(0, 8)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product:</span>
                    <span className="font-medium text-gray-900">{payment.product.name}</span>
                  </div>
                  {payment.ad_title && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ad:</span>
                      <span className="font-medium text-gray-900">{payment.ad_title}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-bold text-xl text-gray-900">
                      {paymentService.formatPrice(payment.amount, payment.currency)}
                    </span>
                  </div>
                  {payment.expires_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valid Until:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(payment.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {payment.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Benefits Applied */}
              {payment.is_active && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">
                        Benefits Applied Successfully
                      </h3>
                      <p className="text-sm text-blue-700">
                        {payment.product.product_type === "FEATURED" &&
                          "Your ad is now featured and will appear at the top of search results."}
                        {payment.product.product_type === "BOOST" &&
                          `Your ad visibility has been boosted by ${payment.product.boost_multiplier}x.`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {payment.receipt_url && (
                  <button
                    onClick={viewReceipt}
                    className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    View Receipt
                  </button>
                )}

                {adSlug ? (
                  <button
                    onClick={() => navigate(`/ad/${adSlug}`)}
                    className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    View Your Ad
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </button>
                )}

                <button
                  onClick={() => navigate("/")}
                  className="w-full inline-flex items-center justify-center px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Home className="h-5 w-5 mr-2" />
                  Back to Home
                </button>
              </div>
            </div>
          )}

          {/* Error State - No Payment Found */}
          {!payment && !loading && (
            <div className="p-8 text-center">
              <p className="text-gray-600 mb-6">
                We couldn't find your payment details. Please check your email for confirmation or
                contact support.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5 ml-2" />
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
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Questions about your payment?{" "}
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Contact Support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
