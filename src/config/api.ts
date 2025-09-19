// src/config/api.ts
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  ENDPOINTS: {
    // Authentication endpoints
    AUTH: {
      REGISTER: "/api/auth/register/",
      LOGIN: "/api/auth/login/",
      GOOGLE_LOGIN: "/api/auth/google-login/",
      VERIFY_EMAIL: "/api/auth/verify-email/",
      PROFILE: "/api/auth/profile/",
      PROFILE_UPDATE: "/api/auth/profile/update/",
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
      LIST: "/api/ads/",
      CREATE: "/api/ads/",
      DETAIL: "/api/ads/:slug/",
      UPDATE_DELETE: "/api/ads/:slug/edit/",
      SEARCH: "/api/ads/search/",
      FEATURED: "/api/ads/featured/",
      USER_ADS: "/api/ads/my-ads/",
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
