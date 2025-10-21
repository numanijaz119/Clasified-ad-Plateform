// src/config/api.ts
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  ENDPOINTS: {
    // ========================================================================
    // AUTHENTICATION ENDPOINTS
    // ========================================================================
    AUTH: {
      REGISTER: "/api/auth/register/",
      LOGIN: "/api/auth/login/",
      LOGOUT: "/api/auth/logout/",
      GOOGLE_LOGIN: "/api/auth/google-login/",
      VERIFY_EMAIL: "/api/auth/verify-email/",
      RESEND_VERIFICATION: "/api/auth/verify-email/resend/",
      PROFILE: "/api/auth/profile/",
      PROFILE_UPDATE: "/api/auth/profile/update/",
      PRIVACY_SETTINGS: "/api/auth/profile/privacy/",
      DELETE_AVATAR: "/api/auth/profile/avatar/delete/",
      FORGOT_PASSWORD: "/api/auth/password/forgot/",
      RESET_PASSWORD: "/api/auth/password/reset/",
      CHANGE_PASSWORD: "/api/auth/password/change/",
      DELETE_ACCOUNT: "/api/auth/delete-account/",
      REFRESH_TOKEN: "/api/auth/token/refresh/",
    },

    // ========================================================================
    // CONTENT ENDPOINTS
    // ========================================================================
    CONTENT: {
      // States
      STATES: "/api/content/states/",
      STATE_DETAIL: "/api/content/states/:code/",
      CURRENT_STATE: "/api/content/current-state/",

      // Cities
      CITIES: "/api/content/cities/",
      CITIES_SIMPLE: "/api/content/cities/simple/",

      // Categories
      CATEGORIES: "/api/content/categories/",
      CATEGORIES_SIMPLE: "/api/content/categories/simple/",
      CATEGORY_DETAIL: "/api/content/categories/:slug/",

      // Banners - NEW
      BANNERS: "/api/content/banners/",
      // Query params: ?position=header&state=IL&category=1
    },

    // ========================================================================
    // ADS ENDPOINTS
    // ========================================================================
    ADS: {
      // Core Ad Operations (ViewSet Standard Routes)
      LIST: "/api/ads/ads/",
      // Filters: ?category=1&city=2&price_min=100&price_max=500&condition=new,like_new
      // &posted_since=7&search_states=IL,TX,FL
      // Sort: ?sort_by=newest|oldest|alphabetical|price_low|price_high

      CREATE: "/api/ads/ads/",

      DETAIL: "/api/ads/ads/:slug/",

      UPDATE: "/api/ads/ads/:slug/",

      DELETE: "/api/ads/ads/:slug/",

      // Custom Actions
      SEARCH: "/api/ads/ads/search/",
      // Query params: ?search=keyword&category=1&city=2&price_min=100&price_max=500
      // Sort: ?sort_by=newest|oldest|alphabetical|price_low|price_high|relevance

      FEATURED: "/api/ads/ads/featured/",
      // Sort: ?sort_by=newest|oldest|alphabetical

      USER_ADS: "/api/ads/ads/my_ads/",
      // Filters: ?category=1&city=2&status=approved&plan=featured
      // Sort: ?sort_by=newest|oldest|alphabetical|status

      // Analytics & Tracking
      ANALYTICS: "/api/ads/ads/:slug/analytics/",
      CONTACT_VIEW: "/api/ads/ads/:slug/contact_view/",
      PROMOTE: "/api/ads/ads/:slug/promote/",
      DASHBOARD_ANALYTICS: "/api/ads/dashboard/analytics/",

      // Image Management (ViewSet Standard Routes)
      IMAGES: "/api/ads/images/",
      IMAGE_DETAIL: "/api/ads/images/:id/",
      IMAGE_UPDATE: "/api/ads/images/:id/",
      IMAGE_DELETE: "/api/ads/images/:id/",
      SET_PRIMARY_IMAGE: "/api/ads/images/:id/set-primary/",

      // Favorites (ViewSet Routes)
      FAVORITES: "/api/ads/favorites/",
      FAVORITE_DETAIL: "/api/ads/favorites/:id/",
      REMOVE_FAVORITE: "/api/ads/favorites/remove/",

      // Reports (ViewSet Routes)
      REPORTS: "/api/ads/reports/",
      REPORT_DETAIL: "/api/ads/reports/:id/",
    },

    // ========================================================================
// MESSAGING ENDPOINTS
// ========================================================================
MESSAGING: {
  // Conversations
  CONVERSATIONS: "/api/messaging/conversations/",
  CONVERSATION_DETAIL: "/api/messaging/conversations/:id/",
  CONVERSATION_MARK_READ: "/api/messaging/conversations/:id/mark_all_read/",
  CONVERSATION_ARCHIVE: "/api/messaging/conversations/:id/archive/",
  CONVERSATION_BLOCK: "/api/messaging/conversations/:id/block/",
  CONVERSATIONS_UNREAD: "/api/messaging/conversations/unread_count/",
  CONVERSATIONS_STATS: "/api/messaging/conversations/stats/",
  
  // Messages
  MESSAGES: "/api/messaging/messages/",
  MESSAGE_DETAIL: "/api/messaging/messages/:id/",
  MESSAGE_MARK_READ: "/api/messaging/messages/:id/mark_read/",
  MESSAGES_MARK_ALL_READ: "/api/messaging/messages/mark_all_read/",
  
  // Notifications
  NOTIFICATIONS: "/api/messaging/notifications/",
  NOTIFICATION_DETAIL: "/api/messaging/notifications/:id/",
  NOTIFICATION_MARK_READ: "/api/messaging/notifications/:id/mark_read/",
  NOTIFICATIONS_MARK_ALL_READ: "/api/messaging/notifications/mark_all_read/",
  NOTIFICATIONS_UNREAD: "/api/messaging/notifications/unread_count/",
  NOTIFICATIONS_CLEAR: "/api/messaging/notifications/clear_all/",
},

    // ========================================================================
    // ADMINISTRATOR ENDPOINTS
    // ========================================================================
    ADMIN: {
      // Dashboard
      DASHBOARD_STATS: "/api/administrator/dashboard/stats/",

      // Ads Management (ViewSet)
      ADS_LIST: "/api/administrator/ads/",
      // Filters: ?status=pending&state=IL&category=1&user_email=john@example.com
      // &has_images=true&min_views=100&is_featured=true
      // Search: ?search=keyword
      // Sort: ?ordering=-created_at

      AD_DETAIL: "/api/administrator/ads/:id/",
      AD_UPDATE: "/api/administrator/ads/:id/",
      AD_DELETE: "/api/administrator/ads/:id/",
      AD_ACTION: "/api/administrator/ads/:id/action/",
      // Actions: approve, reject, delete, feature, unfeature

      BULK_AD_ACTION: "/api/administrator/ads/bulk_action/",

      // User Management (ViewSet)
      USERS_LIST: "/api/administrator/users/",
      // Filters: ?status=active&email_verified=true&has_ads=true
      // Search: ?search=email
      // Sort: ?ordering=-created_at

      USER_DETAIL: "/api/administrator/users/:id/",
      USER_UPDATE: "/api/administrator/users/:id/",
      USER_DELETE: "/api/administrator/users/:id/",
      USER_ACTION: "/api/administrator/users/:id/action/",
      // Actions: ban, suspend, activate

      USER_ACTIVITY: "/api/administrator/users/:id/activity/",
      BULK_USER_ACTION: "/api/administrator/users/bulk_action/",

      // Reports Management (ViewSet)
      REPORTS_LIST: "/api/administrator/reports/",
      // Filters: ?status=pending&reason=spam
      // Sort: ?ordering=-created_at

      REPORT_DETAIL: "/api/administrator/reports/:id/",
      REPORT_UPDATE: "/api/administrator/reports/:id/",
      REPORT_DELETE: "/api/administrator/reports/:id/",
      REPORT_ACTION: "/api/administrator/reports/:id/action/",
      // Actions: approve, dismiss

      BULK_REPORT_ACTION: "/api/administrator/reports/bulk_action/",

      // Analytics
      ANALYTICS_OVERVIEW: "/api/administrator/analytics/overview/",
      ANALYTICS_USERS: "/api/administrator/analytics/users/",
      ANALYTICS_REVENUE: "/api/administrator/analytics/revenue/",
      ANALYTICS_GEOGRAPHIC: "/api/administrator/analytics/geographic/",
      ANALYTICS_CATEGORIES: "/api/administrator/analytics/categories/",

      // Banner Management (ViewSet)
      BANNERS_LIST: "/api/administrator/banners/",
      // Filters: ?is_active=true&placement=homepage&state=IL
      // Sort: ?ordering=-created_at

      BANNER_CREATE: "/api/administrator/banners/",
      BANNER_DETAIL: "/api/administrator/banners/:id/",
      BANNER_UPDATE: "/api/administrator/banners/:id/",
      BANNER_DELETE: "/api/administrator/banners/:id/",
      BANNER_TOGGLE: "/api/administrator/banners/:id/toggle/",
      BANNER_ANALYTICS: "/api/administrator/banners/:id/analytics/",

      // Content Management
      STATES_LIST: "/api/administrator/states/",
      STATE_DETAIL: "/api/administrator/states/:id/",
      STATE_UPDATE: "/api/administrator/states/:id/",
      STATE_DELETE: "/api/administrator/states/:id/",

      CATEGORIES_LIST: "/api/administrator/categories/",
      CATEGORIES_STATS: "/api/administrator/categories/stats/",
      // Query params: ?state=IL (or 'all')

      CATEGORY_CREATE: "/api/administrator/categories/create/",
      CATEGORY_DETAIL: "/api/administrator/categories/:id/",
      CATEGORY_UPDATE: "/api/administrator/categories/:id/",
      CATEGORY_DELETE: "/api/administrator/categories/:id/",

      CITY_CREATE: "/api/administrator/cities/create/",
      CITY_DETAIL: "/api/administrator/cities/:id/",
      CITY_UPDATE: "/api/administrator/cities/:id/",
      CITY_DELETE: "/api/administrator/cities/:id/",

      // System Settings
      SETTINGS: "/api/administrator/settings/",
      SETTINGS_UPDATE: "/api/administrator/settings/update/",

      // Data Export
      EXPORT_ADS: "/api/administrator/export/ads/",
      EXPORT_USERS: "/api/administrator/export/users/",
      EXPORT_REPORTS: "/api/administrator/export/reports/",
      EXPORT_ANALYTICS: "/api/administrator/export/analytics/",

      // System Utilities
      CLEAR_CACHE: "/api/administrator/cache/clear/",
      MAINTENANCE_MODE: "/api/administrator/maintenance/",
    },
  },
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};



// Request headers
export const getHeaders = (includeAuth: boolean = true) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (includeAuth) {
    const token = localStorage.getItem("access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Multipart form data headers (for file uploads)
export const getMultipartHeaders = (includeAuth: boolean = true) => {
  const headers: Record<string, string> = {
    Accept: "application/json",
    // Don't set Content-Type for multipart - browser will set it with boundary
  };

  if (includeAuth) {
    const token = localStorage.getItem("access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Response types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  details?: Record<string, any>;
}

// Helper function to replace URL parameters
export const buildUrl = (
  endpoint: string,
  params: Record<string, string | number>
): string => {
  let url = endpoint;
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, String(value));
  });
  return url;
};

// Helper function to build query string
export const buildQueryString = (
  params: Record<string, string | number | boolean | string[]>
): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};
