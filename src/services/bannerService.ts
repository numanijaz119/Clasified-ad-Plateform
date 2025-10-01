import BaseApiService from "./baseApiService";
import { API_CONFIG } from "../config/api";
import type { PublicBanner, BannerListParams } from "../types/banners";

class BannerService extends BaseApiService {
  /**
   * Get public banners with optional filtering
   */
  async getBanners(params?: BannerListParams): Promise<PublicBanner[]> {
    try {
      const queryParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `${API_CONFIG.ENDPOINTS.CONTENT.BANNERS}${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;

      const response = await this.get<PublicBanner[]>(url, false);

      if (response.data) {
        return response.data;
      }

      return [];
    } catch (error: any) {
      console.error("Get banners error:", error);
      return []; // Return empty array on error instead of throwing
    }
  }

  /**
   * Track banner impression
   */
  async trackImpression(bannerId: number): Promise<void> {
    try {
      // This would be an endpoint to track impressions
      // For now, we'll just log it
      console.log(`Banner ${bannerId} impression tracked`);
    } catch (error) {
      console.error("Track impression error:", error);
    }
  }

  /**
   * Track banner click
   */
  async trackClick(bannerId: number): Promise<void> {
    try {
      // This would be an endpoint to track clicks
      // For now, we'll just log it
      console.log(`Banner ${bannerId} click tracked`);
    } catch (error) {
      console.error("Track click error:", error);
    }
  }
}

export const bannerService = new BannerService();
