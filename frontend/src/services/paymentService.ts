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
  PaginatedResponse,
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
    const response = await this.get<PaymentProduct[]>(url, false); // Public endpoint
    return response.data || [];
  }

  /**
   * Get a specific product by ID
   */
  async getProduct(productId: string): Promise<PaymentProduct> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.PAYMENTS.PRODUCT_DETAIL, { id: productId });
    const response = await this.get<PaymentProduct>(url, false);
    if (!response.data) throw new Error('Product not found');
    return response.data;
  }

  /**
   * Get available products for a specific ad
   */
  async getProductsForAd(adSlug: string): Promise<PaymentProduct[]> {
    const url = `${API_CONFIG.ENDPOINTS.PAYMENTS.PRODUCTS_FOR_AD}${buildQueryString({ ad_slug: adSlug })}`;
    const response = await this.get<PaymentProduct[]>(url, false);
    return response.data || [];
  }

  // ==================== Payment Operations ====================

  /**
   * Create a Stripe checkout session
   */
  async createCheckout(data: CreateCheckoutRequest): Promise<CheckoutSessionResponse> {
    const url = API_CONFIG.ENDPOINTS.PAYMENTS.CHECKOUT;
    const response = await this.post<CheckoutSessionResponse>(url, data, true);
    if (!response.data) throw new Error('Failed to create checkout session');
    return response.data;
  }

  /**
   * Confirm payment after successful Stripe checkout
   */
  async confirmPayment(data: ConfirmPaymentRequest): Promise<PaymentDetailResponse> {
    const url = API_CONFIG.ENDPOINTS.PAYMENTS.CONFIRM;
    const response = await this.post<PaymentDetailResponse>(url, data, true);
    if (!response.data) throw new Error('Failed to confirm payment');
    return response.data;
  }

  /**
   * Get user's payment history
   */
  async getPaymentHistory(): Promise<Payment[]> {
    const url = API_CONFIG.ENDPOINTS.PAYMENTS.HISTORY;
    const response = await this.get<Payment[] | PaginatedResponse<Payment>>(url, true);
    
    if (!response.data) return [];
    
    // Handle both paginated and non-paginated responses
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // If paginated, return the results array
    return response.data.results || [];
  }

  /**
   * Get payment details by ID
   */
  async getPayment(paymentId: string): Promise<PaymentDetailResponse> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.PAYMENTS.PAYMENT_DETAIL, { id: paymentId });
    const response = await this.get<PaymentDetailResponse>(url, true);
    if (!response.data) throw new Error('Payment not found');
    return response.data;
  }

  /**
   * Get receipt URL for a payment
   */
  async getReceipt(paymentId: string): Promise<{ receipt_url: string }> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.PAYMENTS.RECEIPT, { id: paymentId });
    const response = await this.get<{ receipt_url: string }>(url, true);
    if (!response.data) throw new Error('Receipt not found');
    return response.data;
  }

  // ==================== Ad Boosts ====================

  /**
   * Get all boosts for user's ads
   */
  async getBoosts(): Promise<AdBoost[]> {
    const url = API_CONFIG.ENDPOINTS.PAYMENTS.BOOSTS;
    const response = await this.get<AdBoost[]>(url, true);
    return response.data || [];
  }

  /**
   * Get active boosts only
   */
  async getActiveBoosts(): Promise<AdBoost[]> {
    const url = API_CONFIG.ENDPOINTS.PAYMENTS.ACTIVE_BOOSTS;
    const response = await this.get<AdBoost[]>(url, true);
    return response.data || [];
  }

  /**
   * Get boosts for a specific ad
   */
  async getBoostsForAd(adSlug: string): Promise<AdBoost[]> {
    const url = `${API_CONFIG.ENDPOINTS.PAYMENTS.BOOSTS_FOR_AD}${buildQueryString({ ad_slug: adSlug })}`;
    const response = await this.get<AdBoost[]>(url, true);
    return response.data || [];
  }

  // ==================== Stripe Configuration ====================

  /**
   * Get Stripe public configuration
   */
  async getStripeConfig(): Promise<StripeConfig> {
    const url = API_CONFIG.ENDPOINTS.PAYMENTS.CONFIG;
    const response = await this.get<StripeConfig>(url, false); // Public endpoint
    if (!response.data) throw new Error('Stripe configuration not found');
    return response.data;
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
    const response = await this.get<PaymentStats>(url, true);
    if (!response.data) throw new Error('Payment stats not found');
    return response.data;
  }

  /**
   * Get statistics by product (admin only)
   */
  async getProductStats(): Promise<ProductStats[]> {
    const url = API_CONFIG.ENDPOINTS.PAYMENTS.ADMIN.BY_PRODUCT;
    const response = await this.get<ProductStats[]>(url, true);
    return response.data || [];
  }

  /**
   * Process a refund (admin only)
   */
  async processRefund(
    paymentId: string,
    data: { amount?: number; reason: string; admin_notes?: string }
  ): Promise<any> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.PAYMENTS.ADMIN.REFUND, { id: paymentId });
    const response = await this.post(url, data, true);
    return response.data;
  }

  /**
   * Sync products with Stripe (admin only)
   */
  async syncStripeProducts(): Promise<{ synced: string[]; errors: string[] }> {
    const url = API_CONFIG.ENDPOINTS.PAYMENTS.ADMIN.SYNC_STRIPE;
    const response = await this.post<{ synced: string[]; errors: string[] }>(url, {}, true);
    if (!response.data) throw new Error('Failed to sync Stripe products');
    return response.data;
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;
