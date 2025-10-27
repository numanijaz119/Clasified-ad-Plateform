// src/services/adminBannerService.ts
import BaseApiService from "./baseApiService";
import { API_CONFIG, buildUrl } from "../config/api";
import type {
  AdminBanner,
  AdminBannerListParams,
  AdminBannerListResponse,
  AdminBannerCreateRequest,
  AdminBannerUpdateRequest,
  AdminBannerToggleResponse,
  AdminBannerAnalytics,
} from "../types/admin";

class AdminBannerService extends BaseApiService {
  /**
   * Get list of banners with filtering and pagination
   */
  async getBanners(params?: AdminBannerListParams): Promise<AdminBannerListResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `${API_CONFIG.ENDPOINTS.ADMIN.BANNERS_LIST}${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;

      const response = await this.get<AdminBannerListResponse>(url);
      return response.data || { count: 0, next: null, previous: null, results: [] };
    } catch (error: any) {
      console.error("Get admin banners error:", error);
      throw error;
    }
  }

  /**
   * Get banner details
   */
  async getBanner(id: number): Promise<AdminBanner> {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.ADMIN.BANNER_DETAIL, { id: id.toString() });
      const response = await this.get<AdminBanner>(url);
      
      if (!response.data) {
        throw new Error("Banner not found");
      }
      
      return response.data;
    } catch (error: any) {
      console.error("Get admin banner error:", error);
      throw error;
    }
  }

  /**
   * Create new banner
   */
  async createBanner(data: AdminBannerCreateRequest): Promise<AdminBanner> {
    try {
      const formData = new FormData();
      
      // Add text fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'image') {
          if (Array.isArray(value)) {
            value.forEach(item => formData.append(key, item.toString()));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Add image file if present
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await this.post<AdminBanner>(
        API_CONFIG.ENDPOINTS.ADMIN.BANNER_CREATE,
        formData
      );

      if (!response.data) {
        throw new Error("Failed to create banner");
      }

      return response.data;
    } catch (error: any) {
      console.error("Create admin banner error:", error);
      throw error;
    }
  }

  /**
   * Update banner
   */
  async updateBanner(id: number, data: AdminBannerUpdateRequest): Promise<AdminBanner> {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.ADMIN.BANNER_UPDATE, { id: id.toString() });
      
      const formData = new FormData();
      
      // Add text fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'image') {
          if (Array.isArray(value)) {
            value.forEach(item => formData.append(key, item.toString()));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Add image file if present
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await this.put<AdminBanner>(url, formData);

      if (!response.data) {
        throw new Error("Failed to update banner");
      }

      return response.data;
    } catch (error: any) {
      console.error("Update admin banner error:", error);
      throw error;
    }
  }

  /**
   * Delete banner
   */
  async deleteBanner(id: number): Promise<void> {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.ADMIN.BANNER_DELETE, { id: id.toString() });
      await this.delete(url);
    } catch (error: any) {
      console.error("Delete admin banner error:", error);
      throw error;
    }
  }

  /**
   * Toggle banner active status
   */
  async toggleBanner(id: number): Promise<AdminBannerToggleResponse> {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.ADMIN.BANNER_TOGGLE, { id: id.toString() });
      const response = await this.post<AdminBannerToggleResponse>(url, {});

      if (!response.data) {
        throw new Error("Failed to toggle banner");
      }

      return response.data;
    } catch (error: any) {
      console.error("Toggle admin banner error:", error);
      throw error;
    }
  }

  /**
   * Get banner analytics
   */
  async getBannerAnalytics(id: number): Promise<AdminBannerAnalytics> {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.ADMIN.BANNER_ANALYTICS, { id: id.toString() });
      const response = await this.get<AdminBannerAnalytics>(url);

      if (!response.data) {
        throw new Error("Failed to get banner analytics");
      }

      return response.data;
    } catch (error: any) {
      console.error("Get banner analytics error:", error);
      throw error;
    }
  }
}

export const adminBannerService = new AdminBannerService();