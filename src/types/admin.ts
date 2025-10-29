// src/types/admin.ts

import { AdStatus, AdPlan } from "./ads";
import { State } from "./content";

// ============================================================================
// DASHBOARD STATS
// ============================================================================

export interface AdminDashboardStats {
  ads: {
    total: number;
    active: number;
    pending: number;
    rejected: number;
    featured: number;
    new_this_week: number;
  };
  users: {
    total: number;
    active: number;
    suspended: number;
    banned: number;
    new_this_week: number;
  };
  engagement: {
    total_views: number;
    total_contacts: number;
    total_favorites: number;
  };
  moderation: {
    pending_reports: number;
  };
}

// ============================================================================
// ADS MANAGEMENT
// ============================================================================

export interface AdminAd {
  id: number;
  title: string;
  description: string;
  price: string; // Backend returns as string
  status: AdStatus;
  plan: AdPlan;
  view_count: number;
  contact_count: number;
  favorite_count: number;
  created_at: string;
  updated_at: string;
  expires_at: string;
  user_name: string;
  user_email: string;
  category_name: string;
  city_name: string;
  state_name: string;
  state_code: string;
  rejection_reason: string;
  admin_notes: string;
  days_ago: number;
  // Optional fields that might come in detail view
  slug?: string;
  primary_image?: { image: string };
  images?: Array<{ id: number; image: string; is_primary: boolean }>;
}

export interface AdminAdListParams {
  page?: number;
  page_size?: number;
  status?: AdStatus;
  state?: string;
  category?: number;
  user_email?: string;
  has_images?: boolean;
  min_views?: number;
  is_featured?: boolean;
  search?: string;
  ordering?: string;
}

export interface AdminAdListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminAd[];
}

export type AdminAdAction =
  | "approve"
  | "reject"
  | "delete"
  | "feature"
  | "unfeature";

export interface AdminAdActionRequest {
  action: AdminAdAction;
  reason?: string;
}

export interface AdminAdActionResponse {
  message: string;
  ad?: AdminAd;
}

export interface AdminBulkAdActionRequest {
  ad_ids: number[];
  action: AdminAdAction;
  reason?: string;
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_active: boolean;
  is_suspended: boolean;
  suspension_reason: string;
  email_verified: boolean;
  created_at: string;
  last_login: string | null;
  total_ads: number;
  active_ads: number;
  pending_ads: number;
  featured_ads: number;
  days_since_joined: number;
  status_display: "active" | "suspended" | "banned";
}

export interface AdminUserListParams {
  page?: number;
  page_size?: number;
  status?: "active" | "suspended" | "banned";
  email_verified?: boolean;
  has_ads?: boolean;
  search?: string;
  ordering?: string;
}

export interface AdminUserListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminUser[];
}

export type AdminUserAction = "ban" | "suspend" | "activate";

export interface AdminUserActionRequest {
  action: AdminUserAction;
  reason?: string;
}

export interface AdminUserActionResponse {
  message: string;
  user?: AdminUser;
}

export interface AdminUserActivity {
  id: number;
  action: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AdminBulkUserActionRequest {
  user_ids: number[];
  action: AdminUserAction;
  reason?: string;
}

// ============================================================================
// REPORTS MANAGEMENT
// ============================================================================

export interface AdminReport {
  id: number;
  ad: {
    id: number;
    title: string;
    slug: string;
  };
  reported_by: {
    id: number;
    email: string;
    full_name: string;
  };
  reason: string;
  description?: string;
  status: "pending" | "reviewed" | "resolved";
  admin_notes?: string;
  is_reviewed: boolean;
  reviewed_by?: {
    id: number;
    email: string;
    full_name: string;
  };
  reviewed_at?: string;
  created_at: string;
}

export interface AdminReportListParams {
  page?: number;
  page_size?: number;
  status?: "pending" | "reviewed" | "resolved";
  reason?: string;
  search?: string;
  ordering?: string;
}

export interface AdminReportListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminReport[];
}

export type AdminReportAction = "approve" | "dismiss";

export interface AdminReportActionRequest {
  action: AdminReportAction;
  admin_notes?: string;
}

export interface AdminReportActionResponse {
  message: string;
  report?: AdminReport;
}

export interface AdminBulkReportActionRequest {
  report_ids: number[];
  action: AdminReportAction;
  admin_notes?: string;
}

// ============================================================================
// BANNER MANAGEMENT
// ============================================================================

// src/types/admin.ts - ADD/UPDATE these Banner types

export type BannerPosition =
  | "header"
  | "sidebar"
  | "footer"
  | "between_ads"
  | "category_page"
  | "ad_detail";
export type BannerType = "image" | "html" | "text";

export interface AdminBanner {
  id: number;
  title: string;
  description?: string;
  banner_type: BannerType;
  image?: string;
  html_content?: string;
  text_content?: string;
  position: BannerPosition;
  target_states: number[];
  target_categories: number[];
  target_states_display?: Array<{ id: number; name: string }>;
  target_categories_display?: Array<{ id: number; name: string }>;
  click_url?: string;
  open_new_tab: boolean;
  is_active: boolean;
  is_currently_active: boolean;
  impressions: number;
  clicks: number;
  ctr: number;
  priority: number;
  start_date?: string;
  end_date?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminBannerListParams {
  page?: number;
  page_size?: number;
  is_active?: boolean;
  position?: BannerPosition;
  banner_type?: BannerType;
  ordering?: string;
}

export interface AdminBannerListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminBanner[];
}

export interface AdminBannerCreateRequest {
  title: string;
  description?: string;
  banner_type: BannerType;
  image?: File;
  html_content?: string;
  text_content?: string;
  position: BannerPosition;
  target_states?: number[];
  target_categories?: number[];
  click_url?: string;
  open_new_tab?: boolean;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
  priority?: number;
}

export interface AdminBannerUpdateRequest {
  title?: string;
  description?: string;
  banner_type?: BannerType;
  image?: File;
  html_content?: string;
  text_content?: string;
  position?: BannerPosition;
  target_states?: number[];
  target_categories?: number[];
  click_url?: string;
  open_new_tab?: boolean;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
  priority?: number;
}

export interface AdminBannerToggleResponse {
  message: string;
  is_active: boolean;
}

export interface AdminBannerAnalytics {
  banner_info: {
    id: number;
    title: string;
    total_impressions: number;
    total_clicks: number;
    ctr: number;
  };
  daily_impressions: Array<{
    day: string;
    impressions: number;
  }>;
  daily_clicks: Array<{
    day: string;
    clicks: number;
  }>;
}

// ============================================================================
// ANALYTICS
// ============================================================================

export interface AdminAnalyticsOverview {
  daily_ads: Array<{
    date: string;
    count: number;
  }>;
  status_distribution: Array<{
    status: string;
    count: number;
  }>;
  top_categories: Array<{
    category__name: string;
    count: number;
  }>;
  daily_views: Array<{
    date: string;
    count: number;
  }>;
  daily_contacts: Array<{
    date: string;
    count: number;
  }>;
}

export interface AdminAnalyticsUsers {
  daily_registrations: Array<{
    date: string;
    count: number;
  }>;
  status_distribution: {
    active: number;
    suspended: number;
    banned: number;
  };
  top_users: Array<{
    id: number;
    email: string;
    name: string;
    ad_count: number;
  }>;
}

export interface AdminAnalyticsRevenue {
  daily_revenue: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;
  total_revenue: number;
  featured_ads_count: number;
}

export interface AdminAnalyticsGeographic {
  state_distribution: Array<{
    state__code: string;
    state__name: string;
    count: number;
  }>;
  top_cities: Array<{
    city__name: string;
    state__code: string;
    count: number;
  }>;
}

export interface AdminAnalyticsCategories {
  categories: Array<{
    id: number;
    name: string;
    slug: string;
    total_ads: number;
    total_views: number;
    avg_price: number;
  }>;
}

// ============================================================================
// CONTENT MANAGEMENT
// ============================================================================

export interface AdminState extends State {
  ads_count?: number;
}

export interface AdminStateListResponse {
  results: AdminState[];
}

export interface AdminCategoryStats {
  id: number;
  name: string;
  slug: string;
  total_ads: number;
  active_ads: number;
  pending_ads: number;
  is_active?: boolean;
  icon?: string;
  description?: string;
  sort_order?: number;
}

export interface AdminCategoryStatsResponse {
  categories: AdminCategoryStats[];
}

export interface AdminCategoryCreateRequest {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  parent?: number;
  sort_order?: number;
}

export interface AdminCategoryUpdateRequest
  extends Partial<AdminCategoryCreateRequest> {
  is_active?: boolean;
}

export interface AdminCityCreateRequest {
  name: string;
  state: number;
  slug?: string;
  photo?: File;
  latitude?: number;
  longitude?: number;
  is_major?: boolean;
  is_active?: boolean;
}

export interface AdminCityUpdateRequest
  extends Partial<AdminCityCreateRequest> {
  is_active?: boolean;
}

// ============================================================================
// QUERY PARAMS
// ============================================================================

export interface AdminAnalyticsParams {
  state?: string;
  days?: number;
}

// ============================================================================
// SYSTEM SETTINGS
// ============================================================================

export interface AdminSettings {
  site_name: string;
  contact_email: string;
  support_phone: string;
  allow_registration: boolean;
  require_email_verification: boolean;
  auto_approve_ads: boolean;
  featured_ad_price: number;
  featured_ad_duration_days: number;
}
