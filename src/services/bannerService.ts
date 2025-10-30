// src/services/bannerService.ts
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

      const url = `${API_CONFIG.ENDPOINTS.CONTENT.BANNERS}${queryParams.toString() ? "?" + queryParams.toString() : ""
        }`;

      const response = await this.get<PublicBanner[]>(url, false);

      if (response.data) {
        // Ensure image URLs are absolute
        return response.data.map(banner => ({
          ...banner,
          image: banner.image && !banner.image.startsWith('http')
            ? `${API_CONFIG.BASE_URL}${banner.image}`
            : banner.image
        }));
      }

      return [];
    } catch (error: any) {
      return []; // Return empty array on error instead of throwing
    }
  }

  /**
   * Track banner impression
   */
  async trackImpression(bannerId: number): Promise<void> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.CONTENT.BANNERS}track-impression/`;
      const data = {
        banner_id: bannerId,
        page_url: window.location.href,
      };

      await this.post(url, data, false);
    } catch (error) {
      // Silently fail - don't disrupt user experience
    }
  }

  /**
   * Track banner click
   */
  async trackClick(bannerId: number): Promise<void> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.CONTENT.BANNERS}track-click/`;
      const data = {
        banner_id: bannerId,
        referrer: document.referrer,
      };

      await this.post(url, data, false);
    } catch (error) {
      // Silently fail - don't disrupt user experience
    }
  }
}

export const bannerService = new BannerService();
