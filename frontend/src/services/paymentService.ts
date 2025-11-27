// frontend/src/services/paymentService.ts
import BaseApiService from "./baseApiService";
import { API_CONFIG, buildUrl, buildQueryString } from "../config/api";
import type {
  PaymentProduct,
  Payment,
  PaymentDetailResponse,
  CreateCheckoutRequest,
  CheckoutSessionResponse,
  ConfirmPaymentRequest,
  StripeConfig,
  AdBoost,
  PaymentStats,
  ProductStats,
} from "../types/payment";

class PaymentService extends BaseApiService {
  // ==================== Payment Products ====================

  /**
   * Get all available payment products
   * @param productType - Optional filter by product type (FEATURED, BOOST, etc.)
   */
  async getProducts(productType?: string): Promise<PaymentProduct[]> {
    const queryString = productType ? buildQueryString({ type: productType }) : "";
    const url = `${API_CONFIG.ENDPOINTS.PAYMENTS.PRODUCTS}${queryString}`;
    return this.get<PaymentProduct[]>(url, false); // Public endpoint
  }

  /**
   * Get a specific product by ID
   */
  async getProduct(productId: string): Promise<PaymentProduct> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.PAYMENTS.PRODUCT_DETAIL, { id: productId });
    return this.get<PaymentProduct>(url, false);
  }

  /**
   * Get available products for a specific ad
   */
  async getProductsForAd(adSlug: string): Promise<PaymentProduct[]> {
    const url = `${API_CONFIG.ENDPOINTS.PAYMENTS.PRODUCTS_FOR_AD}${buildQueryString({ ad_slug: adSlug })}`;
    return this.get<PaymentProduct[]>(url, false);
  }

  // ==================== Payment Operations ====================

  /**
   * Create a Stripe checkout session
   */
  async createCheckout(data: CreateCheckoutRequest): Promise<CheckoutSessionResponse> {
    const url = API_CONFIG.ENDPOINTS.PAYMENTS.CHECKOUT;
    return this.post<CheckoutSessionResponse>(url, data, true);
  }

  /**
   * Confirm payment after successful Stripe checkout
   */
  async confirmPayment(data: ConfirmPaymentRequest): Promise<PaymentDetailResponse> {
    const url = API_CONFIG.ENDPOINTS.PAYMENTS.CONFIRM;
    return this.post<PaymentDetailResponse>(url, data, true);
  }

  /**
   * Get user's payment history
   */
  async getPaymentHistory(): Promise<Payment[]> {
    const url = API_CONFIG.ENDPOINTS.PAYMENTS.HISTORY;
    return this.get<Payment[]>(url, true);
  }

  /**
   * Get payment details by ID
   */
  async getPayment(paymentId: string): Promise<PaymentDetailResponse> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.PAYMENTS.PAYMENT_DETAIL, { id: paymentId });
    return this.get<PaymentDetailResponse>(url, true);
  }

  /**
   * Get receipt URL for a payment
   */
  async getReceipt(paymentId: string): Promise<{ receipt_url: string }> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.PAYMENTS.RECEIPT, { id: paymentId });
    return this.get<{ receipt_url: string }>(url, true);
  }

  // ==================== Ad Boosts ====================

  /**
   * Get all boosts for user's ads
   */
  async getBoosts(): Promise<AdBoost[]> {
    const url = API_CONFIG.ENDPOINTS.PAYMENTS.BOOSTS;
    return this.get<AdBoost[]>(url, true);
  }

  /**
   * Get active boosts only
   */
  async getActiveBoosts(): Promise<AdBoost[]> {
    const url = API_CONFIG.ENDPOINTS.PAYMENTS.ACTIVE_BOOSTS;
    return this.get<AdBoost[]>(url, true);
  }

  /**
   * Get boosts for a specific ad
   */
  async getBoostsForAd(adSlug: string): Promise<AdBoost[]> {
    const url = `${API_CONFIG.ENDPOINTS.PAYMENTS.BOOSTS_FOR_AD}${buildQueryString({ ad_slug: adSlug })}`;
    return this.get<AdBoost[]>(url, true);
  }

  // ==================== Stripe Configuration ====================

  /**
   * Get Stripe public configuration
   */
  async getStripeConfig(): Promise<StripeConfig> {
    const url = API_CONFIG.ENDPOINTS.PAYMENTS.CONFIG;
    return this.get<StripeConfig>(url, false); // Public endpoint
  }

  // ==================== Helper Methods ====================

  /**
   * Build success URL for Stripe checkout
   */
  buildSuccessUrl(adSlug?: string): string {
    const baseUrl = `${window.location.origin}/payment/success`;
    return adSlug ? `${baseUrl}?ad=${adSlug}` : baseUrl;
  }

  /**
   * Build cancel URL for Stripe checkout
   */
  buildCancelUrl(adSlug?: string): string {
    const baseUrl = `${window.location.origin}/payment/cancel`;
    return adSlug ? `${baseUrl}?ad=${adSlug}` : baseUrl;
  }

  /**
   * Format price for display
   */
  formatPrice(amount: number, currency: string = "USD"): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  }

  /**
   * Check if payment is expired
   */
  isPaymentExpired(expiresAt: string | null): boolean {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  }

  /**
   * Calculate days remaining
   */
  getDaysRemaining(expiresAt: string): number {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // ==================== Admin Methods ====================

  /**
   * Get payment statistics (admin only)
   */
  async getPaymentStats(): Promise<PaymentStats> {
    const url = API_CONFIG.ENDPOINTS.PAYMENTS.ADMIN.STATS;
    return this.get<PaymentStats>(url, true);
  }

  /**
   * Get statistics by product (admin only)
   */
  async getProductStats(): Promise<ProductStats[]> {
    const url = API_CONFIG.ENDPOINTS.PAYMENTS.ADMIN.BY_PRODUCT;
    return this.get<ProductStats[]>(url, true);
  }

  /**
   * Process a refund (admin only)
   */
  async processRefund(
    paymentId: string,
    data: { amount?: number; reason: string; admin_notes?: string }
  ): Promise<any> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.PAYMENTS.ADMIN.REFUND, { id: paymentId });
    return this.post(url, data, true);
  }

  /**
   * Sync products with Stripe (admin only)
   */
  async syncStripeProducts(): Promise<{ synced: string[]; errors: string[] }> {
    const url = API_CONFIG.ENDPOINTS.PAYMENTS.ADMIN.SYNC_STRIPE;
    return this.post<{ synced: string[]; errors: string[] }>(url, {}, true);
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;
