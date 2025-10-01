// src/types/ads.ts - FIXED VERSION

// Base Ad types
export interface AdImage {
  id: number;
  image: string;
  caption?: string;
  is_primary: boolean;
  sort_order: number;
  file_size?: number;
  width?: number;
  height?: number;
  created_at: string;
  updated_at?: string;
}

export interface AdCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parent?: number;
  is_active: boolean;
  sort_order: number;
  ads_count?: number;
}

export interface AdCity {
  id: number;
  name: string;
  slug?: string;
  state: number;
  state_name?: string;
  state_code?: string;
  is_active: boolean;
  is_major?: boolean;
}

export interface AdState {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
}

export interface AdUser {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  full_name: string;
  avatar?: string;
}

// FIXED: Updated condition type to match backend exactly
export type AdCondition =
  | "new"
  | "like_new"
  | "good"
  | "fair"
  | "poor"
  | "not_applicable";

export type AdPriceType = "fixed" | "negotiable" | "contact" | "free" | "swap";

export type AdStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "expired"
  | "sold";

export type AdPlan = "free" | "featured";

// Main Ad interface
export interface Ad {
  id: number;
  title: string;
  slug: string;
  description: string;
  price?: number;
  display_price?: string;
  price_type: AdPriceType;
  condition: AdCondition;
  contact_phone?: string;
  contact_email?: string;
  contact_email_display?: string;
  hide_phone: boolean;
  plan: AdPlan;
  status: AdStatus;
  view_count: number;
  unique_view_count?: number;
  contact_count?: number;
  favorite_count?: number;
  keywords?: string;
  time_since_posted?: string;
  is_featured_active?: boolean;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  approved_at?: string;
  rejection_reason?: string;
  category: AdCategory;
  city: AdCity;
  state: AdState;
  user: AdUser;
  images: AdImage[];
  primary_image?: AdImage;
  is_favorite?: boolean;
  is_owner?: boolean;
}

// FIXED: Updated CreateAdRequest to match backend serializer exactly
export interface CreateAdRequest {
  // Required fields
  title: string;
  description: string;
  category: number;
  city: number;

  // Pricing fields
  price?: number;
  price_type: AdPriceType;
  condition: AdCondition;

  // Contact fields
  contact_phone?: string;
  contact_email?: string;
  hide_phone?: boolean;

  // Optional fields
  keywords?: string;
  plan?: AdPlan;
  status?: AdStatus;

  // Images (handled separately in FormData)
  images?: File[];
}

export interface UpdateAdRequest {
  slug: string;
  title?: string;
  description?: string;
  price?: number;
  price_type?: AdPriceType;
  condition?: AdCondition;
  contact_phone?: string;
  contact_email?: string;
  hide_phone?: boolean;
  category?: number;
  city?: number;
  keywords?: string;
}

export interface AdListParams {
  page?: number;
  page_size?: number;
  category?: string | number;
  city?: string | number;
  state?: string | number;
  search?: string;
  price_min?: number;
  price_max?: number;
  price_type?: AdPriceType;
  condition?: AdCondition[];
  plan?: AdPlan;
  status?: AdStatus;
  sort_by?:
    | "newest"
    | "oldest"
    | "alphabetical"
    | "price_low"
    | "price_high"
    | "relevance";
  has_images?: boolean;
  has_phone?: boolean;
  is_featured?: boolean;
  posted_since?: number;
  posted_after?: string;
  posted_before?: string;
}

export interface AdListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  total_pages: number;
  current_page: number;
  results: Ad[];
}

export interface AdAnalytics {
  total_views: number;
  unique_views: number;
  contact_views: number;
  daily_views: Array<{
    date: string;
    views: number;
    contact_views: number;
  }>;
  weekly_views: Array<{
    week: string;
    views: number;
    contact_views: number;
  }>;
  monthly_views: Array<{
    month: string;
    views: number;
    contact_views: number;
  }>;
}

export interface DashboardAnalytics {
  total_ads: number;
  active_ads: number;
  pending_ads: number;
  expired_ads: number;
  total_views: number;
  total_contact_views: number;
  featured_ads: number;
  recent_activity: Array<{
    type: string;
    message: string;
    created_at: string;
  }>;
  top_performing_ads: Ad[];
}

export interface AdFavorite {
  id: number;
  ad: Ad;
  user: number;
  created_at: string;
}

export interface AdReport {
  id: number;
  ad: number;
  user: number;
  reason: string;
  description: string;
  status: "pending" | "reviewed" | "resolved";
  created_at: string;
  updated_at: string;
}

export interface CreateReportRequest {
  ad: number;
  reason: string;
  description?: string;
}

// Image upload specific types
export interface AdImageCreateRequest {
  image: File;
  caption?: string;
  is_primary?: boolean;
  sort_order?: number;
}

// Backend response after creating ad
export interface CreateAdResponse extends Ad {
  slug: string;
  status: AdStatus;
}

// Validation helper types
export interface AdValidationErrors {
  title?: string[];
  description?: string[];
  price?: string[];
  price_type?: string[];
  condition?: string[];
  category?: string[];
  city?: string[];
  contact_phone?: string[];
  contact_email?: string[];
  images?: string[];
  keywords?: string[];
  non_field_errors?: string[];
  [key: string]: string[] | undefined;
}

// Form state types for components
export interface PostAdFormState {
  title: string;
  description: string;
  category: string;
  city: string;
  price: string;
  price_type: AdPriceType;
  condition: AdCondition;
  contact_phone: string;
  contact_email: string;
  hide_phone: boolean;
  keywords: string;
}

export interface PostAdFormErrors {
  title?: string;
  description?: string;
  category?: string;
  city?: string;
  price?: string;
  price_type?: string;
  condition?: string;
  contact_phone?: string;
  contact_email?: string;
  contact?: string;
  images?: string;
  submit?: string;
  [key: string]: string | undefined;
}

// Admin specific types
export interface AdminAdListParams extends AdListParams {
  user?: number;
  has_reports?: boolean;
  reported_by?: number;
}

export interface AdminAnalytics {
  total_ads: number;
  total_users: number;
  total_categories: number;
  total_cities: number;
  pending_ads: number;
  approved_ads: number;
  rejected_ads: number;
  featured_ads: number;
  total_reports: number;
  pending_reports: number;
  recent_ads: Ad[];
  recent_reports: AdReport[];
  top_categories: Array<{
    category: AdCategory;
    ad_count: number;
  }>;
  top_cities: Array<{
    city: AdCity;
    ad_count: number;
  }>;
}

export interface AdminAdAction {
  action: "approve" | "reject" | "delete" | "feature" | "unfeature";
  reason?: string;
}
