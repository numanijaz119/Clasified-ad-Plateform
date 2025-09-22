// src/types/ads.ts

// Base Ad types
export interface AdImage {
  id: number;
  image: string;
  caption?: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
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
}

export interface AdCity {
  id: number;
  name: string;
  slug: string;
  state: number;
  state_name: string;
  state_code: string;
  is_active: boolean;
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

export interface Ad {
  id: number;
  title: string;
  slug: string;
  description: string;
  price?: number;
  currency: string;
  contact_phone: string;
  contact_email: string;
  plan: "free" | "featured";
  status: "pending" | "approved" | "rejected" | "expired" | "deleted";
  view_count: number;
  contact_views: number;
  created_at: string;
  updated_at: string;
  expires_at: string;
  approved_at?: string;
  category: AdCategory;
  city: AdCity;
  state: AdState;
  user: AdUser;
  images: AdImage[];
  primary_image?: AdImage;
  is_favorite?: boolean;
  is_owner?: boolean;
}

// Request/Response types
export interface CreateAdRequest {
  title: string;
  description: string;
  price?: number;
  currency: string;
  category: number;
  city: number;
  contact_phone: string;
  contact_email: string;
  plan: "free" | "featured";
  images?: File[];
}

export interface UpdateAdRequest extends Partial<CreateAdRequest> {
  slug: string;
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
  plan?: "free" | "featured";
  status?: "pending" | "approved" | "rejected" | "expired" | "deleted";
  sort_by?: "newest" | "oldest" | "alphabetical" | "price_low" | "price_high" | "relevance";
  has_images?: boolean;
  has_phone?: boolean;
  is_featured?: boolean;
  posted_since?: string;
}

export interface AdListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Ad[];
}

export interface AdAnalytics {
  total_views: number;
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

// Admin types
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
