// frontend/src/components/PaymentModal.tsx
import React, { useEffect, useState } from "react";
import {
  CreditCard,
  Star,
  TrendingUp,
  Clock,
  DollarSign,
  Check,
  Loader,
} from "lucide-react";
import BaseModal from "./modals/BaseModal";
import { useToast } from "../contexts/ToastContext";
import { paymentService } from "../services/paymentService";
import type { PaymentProduct } from "../types/payment";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  adId?: string;
  adSlug?: string;
  productType?: "FEATURED" | "BOOST";
  onSuccess?: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  adId,
  adSlug,
  productType,
  onSuccess,
}) => {
  const toast = useToast();
  const [products, setProducts] = useState<PaymentProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<PaymentProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Load products when modal opens
  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen, adSlug, productType]);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      let fetchedProducts: PaymentProduct[];

      // If adSlug is provided, get products specific to that ad
      if (adSlug) {
        fetchedProducts = await paymentService.getProductsForAd(adSlug);
      } else if (productType) {
        // Otherwise filter by product type
        fetchedProducts = await paymentService.getProducts(productType);
      } else {
        // Get all active products
        fetchedProducts = await paymentService.getProducts();
      }

      // Filter only active products and sort by sort_order
      const activeProducts = fetchedProducts
        .filter((p) => p.is_active)
        .sort((a, b) => a.sort_order - b.sort_order);

      setProducts(activeProducts);

      // Auto-select first product if only one available
      if (activeProducts.length === 1) {
        setSelectedProduct(activeProducts[0]);
      }
    } catch (error: any) {
      console.error("Failed to load products:", error);
      toast.error(error.message || "Failed to load payment options");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedProduct) {
      toast.warning("Please select a payment option");
      return;
    }

    setLoading(true);
    try {
      // Build success and cancel URLs
      const successUrl = paymentService.buildSuccessUrl(adSlug);
      const cancelUrl = paymentService.buildCancelUrl(adSlug);

      // Create checkout session
      const response = await paymentService.createCheckout({
        product_id: selectedProduct.id,
        ad_id: adId,
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      // Redirect to Stripe Checkout
      window.location.href = response.checkout_url;
    } catch (error: any) {
      console.error("Checkout failed:", error);
      toast.error(error.message || "Failed to start checkout. Please try again.");
      setLoading(false);
    }
  };

  const getProductIcon = (type: string) => {
    switch (type) {
      case "FEATURED":
        return Star;
      case "BOOST":
        return TrendingUp;
      case "MEMBERSHIP":
        return CreditCard;
      default:
        return CreditCard;
    }
  };

  const getProductDescription = (product: PaymentProduct) => {
    const features = [];

    if (product.product_type === "FEATURED") {
      features.push("Pin your ad at the top");
      features.push("Increase visibility");
      if (product.duration_days) {
        features.push(`Valid for ${product.duration_display}`);
      }
    } else if (product.product_type === "BOOST") {
      features.push(`${product.boost_multiplier}x visibility boost`);
      features.push("Appear higher in search results");
      if (product.duration_days) {
        features.push(`Active for ${product.duration_display}`);
      }
    }

    return features;
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedProduct(null);
      onClose();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Select Payment Plan"
      maxWidth="max-w-3xl"
      closeOnOverlayClick={!loading}
    >
      <div className="p-6">
        {loadingProducts ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading payment options...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No payment options available</p>
          </div>
        ) : (
          <>
            {/* Product Selection */}
            <div className="space-y-4 mb-6">
              {products.map((product) => {
                const Icon = getProductIcon(product.product_type);
                const features = getProductDescription(product);
                const isSelected = selectedProduct?.id === product.id;

                return (
                  <div
                    key={product.id}
                    onClick={() => !loading && setSelectedProduct(product)}
                    className={`
                      relative border-2 rounded-lg p-4 cursor-pointer transition-all
                      ${
                        isSelected
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300 bg-white"
                      }
                      ${loading ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4">
                        <div className="bg-blue-600 text-white rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    )}

                    <div className="flex items-start">
                      <div
                        className={`
                        p-3 rounded-lg
                        ${isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}
                      `}
                      >
                        <Icon className="h-6 w-6" />
                      </div>

                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {product.name}
                          </h3>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              {paymentService.formatPrice(product.price)}
                            </div>
                            {product.duration_days && (
                              <div className="text-sm text-gray-500 flex items-center justify-end mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {product.duration_display}
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mt-2">{product.description}</p>

                        {features.length > 0 && (
                          <ul className="mt-3 space-y-2">
                            {features.map((feature, index) => (
                              <li
                                key={index}
                                className="flex items-center text-sm text-gray-700"
                              >
                                <Check
                                  className={`h-4 w-4 mr-2 ${isSelected ? "text-blue-600" : "text-green-500"}`}
                                />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Summary */}
            {selectedProduct && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Payment Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Product:</span>
                    <span className="font-medium text-gray-900">{selectedProduct.name}</span>
                  </div>
                  {selectedProduct.duration_days && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium text-gray-900">
                        {selectedProduct.duration_display}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="font-bold text-xl text-gray-900">
                        {paymentService.formatPrice(selectedProduct.price)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                disabled={!selectedProduct || loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Proceed to Checkout
                  </>
                )}
              </button>
            </div>

            {/* Security Notice */}
            <div className="mt-4 text-center text-xs text-gray-500">
              <p>Secure payment powered by Stripe</p>
            </div>
          </>
        )}
      </div>
    </BaseModal>
  );
};

export default PaymentModal;
