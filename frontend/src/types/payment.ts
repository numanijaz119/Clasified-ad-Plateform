// frontend/src/types/payment.ts

export interface PaymentProduct {
  id: string;
  name: string;
  product_type: 'FEATURED' | 'BOOST' | 'MEMBERSHIP' | 'RENEWAL';
  description: string;
  price: number;
  duration_days: number | null;
  duration_display: string;
  boost_multiplier: number;
  is_active: boolean;
  sort_order: number;
}

export interface Payment {
  id: string;
  user_email: string;
  product_name: string;
  product_type: string;
  ad_title?: string;
  ad_slug?: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELED';
  payment_method: string;
  payment_date: string | null;
  is_active: boolean;
  is_refundable: boolean;
  applied_at: string | null;
  expires_at: string | null;
  receipt_url?: string;
  created_at: string;
}

export interface PaymentDetailResponse extends Payment {
  product: PaymentProduct;
  stripe_payment_intent_id: string;
  stripe_checkout_session_id?: string;
  stripe_charge_id?: string;
  refund_amount: number;
  refund_reason?: string;
  refunded_at?: string;
  invoice_url?: string;
  remaining_refundable_amount: number;
  metadata: Record<string, any>;
  updated_at: string;
}

export interface CreateCheckoutRequest {
  product_id: string;
  ad_id?: string;
  success_url: string;
  cancel_url: string;
}

export interface CheckoutSessionResponse {
  checkout_url: string;
  session_id: string;
  payment_id: string;
}

export interface ConfirmPaymentRequest {
  session_id: string;
}

export interface StripeConfig {
  public_key: string;
  currency: string;
}

export interface AdBoost {
  id: string;
  ad_title: string;
  ad_slug: string;
  product_name: string;
  boost_multiplier: number;
  started_at: string;
  expires_at: string;
  is_active: boolean;
  remaining_time: number;
  views_during_boost: number;
  created_at: string;
}

export interface PaymentStats {
  total_revenue: number;
  total_payments: number;
  total_refunds: number;
  pending_payments: number;
  completed_payments: number;
  failed_payments: number;
  average_payment: number;
}

export interface ProductStats {
  product_id: string;
  product_name: string;
  product_type: string;
  total_sales: number;
  total_revenue: number;
}

// Form types
export interface PaymentFormData {
  product_id: string;
  ad_id?: string;
}

export interface PaymentFormErrors {
  product_id?: string;
  ad_id?: string;
  payment?: string;
}

// Paginated response type
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
