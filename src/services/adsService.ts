// src/services/adsService.ts
import BaseApiService from "./baseApiService";
import { API_CONFIG } from "../config/api";
import type {
  Ad,
  AdImage,
  CreateAdRequest,
  UpdateAdRequest,
  AdListParams,
  AdListResponse,
  AdAnalytics,
  DashboardAnalytics,
  CreateReportRequest,
} from "../types/ads";

class AdsService extends BaseApiService {
  /**
   * Get list of ads with filtering
   */
  async getAds(params: AdListParams = {}): Promise<AdListResponse> {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString());
        }
      });

      const url = `${API_CONFIG.ENDPOINTS.ADS.LIST}${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;

      const response = await this.get<AdListResponse>(url, false);

      if (response.data) {
        return response.data;
      }

      throw new Error("Failed to fetch ads");
    } catch (error: any) {
      console.error("Get ads error:", error);
      throw error;
    }
  }

  /**
   * Get single ad by slug
   */
  async getAd(slug: string): Promise<Ad> {
    try {
      const url = API_CONFIG.ENDPOINTS.ADS.DETAIL.replace(":slug", slug);
      const response = await this.get<Ad>(url, false);

      if (response.data) {
        return response.data;
      }

      throw new Error("Ad not found");
    } catch (error: any) {
      console.error("Get ad error:", error);
      throw error;
    }
  }

  /**
   * Create new ad
   */
  async createAd(adData: CreateAdRequest): Promise<Ad> {
    try {
      const formData = new FormData();

      // Add text fields
      Object.entries(adData).forEach(([key, value]) => {
        if (key !== "images" && value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Add images
      if (adData.images && adData.images.length > 0) {
        adData.images.forEach((image) => {
          formData.append(`images`, image);
        });
      }

      const response = await this.post<Ad>(
        API_CONFIG.ENDPOINTS.ADS.CREATE,
        formData,
        true
      );

      if (response.data) {
        return response.data;
      }

      throw new Error("Failed to create ad");
    } catch (error: any) {
      console.error("Create ad error:", error);
      throw error;
    }
  }

  /**
   * Update existing ad
   */
  async updateAd(adData: UpdateAdRequest): Promise<Ad> {
    try {
      const formData = new FormData();
      const { slug, ...updateData } = adData;

      // Add text fields
      Object.entries(updateData).forEach(([key, value]) => {
        if (key !== "images" && value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Add images if provided
      if (updateData.images && updateData.images.length > 0) {
        updateData.images.forEach((image) => {
          formData.append(`images`, image);
        });
      }

      const url = API_CONFIG.ENDPOINTS.ADS.UPDATE.replace(":slug", slug);

      const response = await this.put<Ad>(url, formData, true);

      if (response.data) {
        return response.data;
      }

      throw new Error("Failed to update ad");
    } catch (error: any) {
      console.error("Update ad error:", error);
      throw error;
    }
  }

  /**
   * Delete ad
   */
  async deleteAd(slug: string): Promise<void> {
    try {
      const url = API_CONFIG.ENDPOINTS.ADS.DELETE.replace(":slug", slug);

      await this.delete(url, true);

      console.log("Ad deleted successfully");
    } catch (error: any) {
      console.error("Delete ad error:", error);
      throw error;
    }
  }

  /**
   * Get user's own ads
   */
  async getUserAds(ordering: string = "-created_at"): Promise<Ad[]> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.ADS.USER_ADS}?ordering=${ordering}`;

      const response = await this.get<Ad[]>(url, true);

      if (response.data) {
        return response.data;
      }

      throw new Error("Failed to fetch user ads");
    } catch (error: any) {
      console.error("Get user ads error:", error);
      throw error;
    }
  }

  /**
   * Search ads
   */
  async searchAds(
    query: string,
    filters: AdListParams = {}
  ): Promise<AdListResponse> {
    try {
      const params = { ...filters, search: query };
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString());
        }
      });

      const url = `${
        API_CONFIG.ENDPOINTS.ADS.SEARCH
      }?${queryParams.toString()}`;

      const response = await this.get<AdListResponse>(url, false);

      if (response.data) {
        return response.data;
      }

      throw new Error("Search failed");
    } catch (error: any) {
      console.error("Search ads error:", error);
      throw error;
    }
  }

  /**
   * Get featured ads
   */
  async getFeaturedAds(): Promise<Ad[]> {
    try {
      const response = await this.get<Ad[]>(
        API_CONFIG.ENDPOINTS.ADS.FEATURED,
        false
      );

      if (response.data) {
        return response.data;
      }

      throw new Error("Failed to fetch featured ads");
    } catch (error: any) {
      console.error("Get featured ads error:", error);
      throw error;
    }
  }

  /**
   * Upload additional images to existing ad
   */
  async uploadAdImages(_slug: string, images: File[]): Promise<AdImage[]> {
    try {
      const formData = new FormData();

      images.forEach((image) => {
        formData.append(`images`, image);
      });

      const response = await this.post<AdImage[]>(
        API_CONFIG.ENDPOINTS.ADS.IMAGES,
        formData,
        true
      );

      if (response.data) {
        return response.data;
      }

      throw new Error("Failed to upload images");
    } catch (error: any) {
      console.error("Upload images error:", error);
      throw error;
    }
  }

  /**
   * Delete ad image
   */
  async deleteAdImage(_adSlug: string, imageId: number): Promise<void> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.ADS.IMAGES}/${imageId}/`;

      await this.delete(url, true);

      console.log("Image deleted successfully");
    } catch (error: any) {
      console.error("Delete image error:", error);
      throw error;
    }
  }

  /**
   * Set primary image for ad
   */
  async setPrimaryImage(_adSlug: string, imageId: number): Promise<void> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.ADS.IMAGES}/${imageId}/set-primary/`;

      await this.patch(url, {}, true);

      console.log("Primary image set successfully");
    } catch (error: any) {
      console.error("Set primary image error:", error);
      throw error;
    }
  }

  /**
   * Add ad to favorites
   */
  async addToFavorites(adId: number): Promise<void> {
    try {
      await this.post(API_CONFIG.ENDPOINTS.ADS.FAVORITES, { ad: adId }, true);
      console.log("Ad added to favorites");
    } catch (error: any) {
      console.error("Add to favorites error:", error);
      throw error;
    }
  }

  /**
   * Remove ad from favorites
   */
  async removeFromFavorites(adId: number): Promise<void> {
    try {
      await this.post(API_CONFIG.ENDPOINTS.ADS.REMOVE_FAVORITE, { ad: adId }, true);
      console.log("Ad removed from favorites");
    } catch (error: any) {
      console.error("Remove from favorites error:", error);
      throw error;
    }
  }

  /**
   * Get user's favorite ads
   */
  async getFavorites(): Promise<Ad[]> {
    try {
      const response = await this.get<Ad[]>(API_CONFIG.ENDPOINTS.ADS.FAVORITES, true);
      
      if (response.data) {
        return response.data;
      }

      throw new Error("Failed to fetch favorites");
    } catch (error: any) {
      console.error("Get favorites error:", error);
      throw error;
    }
  }

  /**
   * Report an ad
   */
  async reportAd(reportData: CreateReportRequest): Promise<void> {
    try {

      await this.post(API_CONFIG.ENDPOINTS.ADS.REPORTS, reportData, true);
      console.log("Ad reported successfully");
    } catch (error: any) {
      console.error("Report ad error:", error);
      throw error;
    }
  }

  /**
   * Get dashboard analytics for user
   */
  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    try {
      const response = await this.get<DashboardAnalytics>(API_CONFIG.ENDPOINTS.ADS.DASHBOARD_ANALYTICS, true);
      
      if (response.data) {
        return response.data;
      }

      throw new Error("Failed to fetch dashboard analytics");
    } catch (error: any) {
      console.error("Get dashboard analytics error:", error);
      throw error;
    }
  }

  /**
   * Get ad analytics (for ad owner)
   */
  async getAdAnalytics(slug: string): Promise<AdAnalytics> {
    try {
      const url = API_CONFIG.ENDPOINTS.ADS.ANALYTICS.replace(":slug", slug);
      const response = await this.get<AdAnalytics>(url, true);
      
      if (response.data) {
        return response.data;
      }

      throw new Error("Failed to fetch ad analytics");
    } catch (error: any) {
      console.error("Get ad analytics error:", error);
      throw error;
    }
  }

  /**
   * Track contact view for an ad
   */
  async trackContactView(slug: string): Promise<void> {
    try {
      const url = API_CONFIG.ENDPOINTS.ADS.CONTACT_VIEW.replace(":slug", slug);
      await this.post(url, {}, false);
      console.log("Contact view tracked");
    } catch (error: any) {
      console.error("Track contact view error:", error);
      throw error;
    }
  }

  /**
   * Promote ad to featured
   */
  async promoteAd(slug: string): Promise<void> {
    try {
      const url = API_CONFIG.ENDPOINTS.ADS.PROMOTE.replace(":slug", slug);
      await this.post(url, {}, true);
      console.log("Ad promoted to featured");
    } catch (error: any) {
      console.error("Promote ad error:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const adsService = new AdsService();
export default adsService;
