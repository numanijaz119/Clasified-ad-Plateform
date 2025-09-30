// Export all services
export { default as authService } from "./authService";
export { adsService } from "./adsService";
export { default as contentService } from "./contentService";
export { default as BaseApiService } from "./baseApiService";
export { adminService } from "./adminService";

// Re-export types for easy importing
export type {
  User,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  GoogleLoginRequest,
  LoginResponse,
  RegisterResponse,
  EmailVerificationRequest,
  EmailVerificationResponse,
  AuthState,
  AuthContextType,
} from "../types/auth";

export type {
  Ad,
  AdImage,
  AdCategory,
  AdCity,
  AdState,
  AdUser,
  CreateAdRequest,
  UpdateAdRequest,
  AdListParams,
  AdListResponse,
  AdAnalytics,
  DashboardAnalytics,
  AdFavorite,
  AdReport,
  CreateReportRequest,
  AdminAdListParams,
  AdminAnalytics,
  AdminAdAction,
} from "../types/ads";

export type {
  Category,
  City,
  State,
  ContentStats,
  LocationSearchResult,
  CategoryHierarchy,
} from "../types/content";

// Export API configuration
export { API_CONFIG } from "../config/api";

// Utility function to handle API errors consistently
export const handleApiError = (error: any): string => {
  if (error?.details?.detail) {
    return error.details.detail;
  }

  if (error?.details?.non_field_errors) {
    return error.details.non_field_errors[0];
  }

  if (error?.details) {
    // Handle field-specific errors
    const fieldErrors = Object.values(error.details).flat();
    if (fieldErrors.length > 0) {
      return fieldErrors[0] as string;
    }
  }

  return error?.message || "An unexpected error occurred";
};

// Utility function to format API responses
export const formatApiResponse = <T>(response: any): T => {
  return response.data || response;
};

// Utility function to build query params
export const buildQueryParams = (params: Record<string, any>): string => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((item) => queryParams.append(key, item.toString()));
      } else {
        queryParams.append(key, value.toString());
      }
    }
  });

  return queryParams.toString();
};
