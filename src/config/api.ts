// src/config/api.ts
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  ENDPOINTS: {
    // Authentication endpoints
    AUTH: {
      REGISTER: "/api/auth/register/",
      LOGIN: "/api/auth/login/",
      LOGOUT: "/api/auth/logout/",
      GOOGLE_LOGIN: "/api/auth/google-login/",
      VERIFY_EMAIL: "/api/auth/verify-email/",
      RESEND_VERIFICATION: "/api/auth/verify-email/resend/",
      PROFILE: "/api/auth/profile/",
      PROFILE_UPDATE: "/api/auth/profile/update/",
      FORGOT_PASSWORD: "/api/auth/password/forgot/",
      RESET_PASSWORD: "/api/auth/password/reset/",
      CHANGE_PASSWORD: "/api/auth/password/change/",
      DELETE_ACCOUNT: "/api/auth/delete-account/",
      REFRESH_TOKEN: "/api/auth/token/refresh/",
    },
    // Content endpoints
    CONTENT: {
      CATEGORIES: "/api/content/categories/",
      CITIES: "/api/content/cities/",
      STATES: "/api/content/states/",
    },
    // Ads endpoints
    ADS: {
      LIST: "/api/ads/ads/",
      CREATE: "/api/ads/ads/",
      DETAIL: "/api/ads/ads/:slug/",
      UPDATE: "/api/ads/ads/:slug/",
      DELETE: "/api/ads/ads/:slug/",
      SEARCH: "/api/ads/ads/search/",
      FEATURED: "/api/ads/ads/featured/",
      USER_ADS: "/api/ads/ads/my_ads/",
      ANALYTICS: "/api/ads/ads/:slug/analytics/",
      CONTACT_VIEW: "/api/ads/ads/:slug/contact_view/",
      PROMOTE: "/api/ads/ads/:slug/promote/",
      IMAGES: "/api/ads/images/",
      FAVORITES: "/api/ads/favorites/",
      REMOVE_FAVORITE: "/api/ads/favorites/remove/",
      REPORTS: "/api/ads/reports/",
      DASHBOARD_ANALYTICS: "/api/ads/dashboard/analytics/",
      ADMIN_ANALYTICS: "/api/ads/admin/analytics/",
      ADMIN_ADS: "/api/ads/admin/ads/",
      ADMIN_AD_ACTION: "/api/ads/admin/ads/:id/action/",
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
