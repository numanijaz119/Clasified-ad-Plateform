// src/services/adsService.ts - FRONTEND-ONLY FIX
// Works with existing backend without any changes

import BaseService from "./baseApiService";
import { API_CONFIG } from "../config/api";
import type {
  Ad,
  CreateAdRequest,
  UpdateAdRequest,
  AdListParams,
  AdListResponse,
  AdAnalytics,
  DashboardAnalytics,
  AdImage,
} from "../types/ads";

class AdsService extends BaseService {
  /**
   * Create new ad - FIXED to work with backend's nested serializer
   * Backend expects images as nested array, NOT as FormData files
   */
  async createAd(adData: CreateAdRequest): Promise<Ad> {
    try {

      // Step 1: Create ad WITHOUT images first
      const adPayload: Record<string, any> = {
        title: adData.title.trim(),
        description: adData.description.trim(),
        category: adData.category,
        city: adData.city,
        price_type: adData.price_type,
        condition: adData.condition,
        hide_phone: adData.hide_phone || false,
        status: "pending",
      };

      // Add price for fixed/negotiable
      if (
        adData.price &&
        (adData.price_type === "fixed" || adData.price_type === "negotiable")
      ) {
        adPayload.price = adData.price;
      }

      // Add contact info
      if (adData.contact_phone) {
        adPayload.contact_phone = adData.contact_phone.replace(/\D/g, "");
      }
      if (adData.contact_email) {
        adPayload.contact_email = adData.contact_email;
      }

      // Add optional fields
      if (adData.keywords?.trim()) {
        adPayload.keywords = adData.keywords.trim();
      }
      if (adData.plan) {
        adPayload.plan = adData.plan;
      }

      // Create ad (JSON, no images yet)
      const createResponse = await this.post<Ad>(
        API_CONFIG.ENDPOINTS.ADS.CREATE,
        adPayload,
        true
      );

      if (!createResponse.data) {
        throw new Error("Failed to create ad");
      }

      const createdAd = createResponse.data;

      // Backend may return different response structures
      // Check for id or slug to identify the ad
      const adIdentifier = createdAd.id || createdAd.slug;

      if (!adIdentifier) {
        console.warn("⚠️ Ad created but no ID/slug returned");
        console.warn("Response data:", JSON.stringify(createdAd));
        // Ad is created but we can't upload images without ID
        // Return what we have
        return createdAd;
      }

      // Step 2: Upload images separately to the dedicated images endpoint
      if (adData.images && adData.images.length > 0) {

        // For image upload, we need the numeric ID
        // If we only have slug, we need to fetch the full ad details
        let adId: number;

        if (createdAd.id) {
          adId = createdAd.id;
        } else if (createdAd.slug) {
          // Fetch full ad details to get the ID
          const fullAd = await this.getAd(createdAd.slug);
          adId = fullAd.id;
          // Update createdAd with full details
          Object.assign(createdAd, fullAd);
        } else {
          console.error("Cannot upload images: no ad ID or slug");
          return createdAd;
        }

        try {
          const uploadedImages = await this.uploadImagesToAd(
            adId,
            adData.images
          );

          // Merge images into ad object
          createdAd.images = uploadedImages;

          // Set primary image
          if (uploadedImages.length > 0) {
            createdAd.primary_image = uploadedImages[0];
          }
        } catch (imageError: any) {
          console.warn("Image upload failed:", imageError);
          // Ad is created, but images failed
          // Don't throw - let user know ad is created but images failed
        }
      }

      return createdAd;
    } catch (error: any) {
      console.error("Create ad error:", error);

      if (error.response?.data) {
        throw {
          message: "Request failed",
          status: error.response.status,
          details: error.response.data,
        };
      }

      throw error;
    }
  }

  /**
   * Upload images to existing ad using the images endpoint
   * This is a separate API call after ad creation
   */
  private async uploadImagesToAd(
    adId: number,
    images: File[]
  ): Promise<AdImage[]> {
    const uploadedImages: AdImage[] = [];

    // Upload images one by one (or in batches if backend supports)
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const formData = new FormData();

      formData.append("ad", adId.toString());
      formData.append("image", image, image.name);
      formData.append("is_primary", (i === 0).toString());
      formData.append("sort_order", i.toString());

      try {
        const response = await this.post<AdImage>(
          API_CONFIG.ENDPOINTS.ADS.IMAGES,
          formData,
          true // requireAuth
        );

        if (response.data) {
          uploadedImages.push(response.data);
        }
      } catch (error: any) {
        console.error(`✗ Failed to upload image ${i + 1}:`, error);
        // Continue with other images
      }
    }

    return uploadedImages;
  }

  /**
   * Update existing ad
   */
  async updateAd(adData: UpdateAdRequest): Promise<Ad> {
    try {
      const { slug, ...updateData } = adData;

      const payload: Record<string, any> = {};

      if (updateData.title) payload.title = updateData.title.trim();
      if (updateData.description)
        payload.description = updateData.description.trim();
      if (updateData.category) payload.category = updateData.category;
      if (updateData.city) payload.city = updateData.city;
      if (updateData.price_type) payload.price_type = updateData.price_type;
      if (updateData.condition) payload.condition = updateData.condition;
      if (updateData.keywords) payload.keywords = updateData.keywords.trim();
      if (updateData.price !== undefined) payload.price = updateData.price;
      if (updateData.contact_phone)
        payload.contact_phone = updateData.contact_phone.replace(/\D/g, "");
      if (updateData.contact_email)
        payload.contact_email = updateData.contact_email;
      if (updateData.hide_phone !== undefined)
        payload.hide_phone = updateData.hide_phone;

      const url = API_CONFIG.ENDPOINTS.ADS.UPDATE.replace(":slug", slug);
      const response = await this.patch<Ad>(url, payload, true);

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
   * Upload additional images to existing ad
   */
  async uploadAdImages(adId: number, images: File[]): Promise<AdImage[]> {
    return this.uploadImagesToAd(adId, images);
  }

  /**
   * Delete ad image
   */
  async deleteAdImage(imageId: number): Promise<void> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.ADS.IMAGES}${imageId}/`;
      await this.delete(url, true);
    } catch (error: any) {
      console.error("Delete image error:", error);
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

      throw new Error("Failed to fetch ad");
    } catch (error: any) {
      console.error("Get ad error:", error);
      throw error;
    }
  }

  /**
   * Get ads list with filtering
   */
  async getAds(params?: AdListParams): Promise<AdListResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            if (Array.isArray(value)) {
              value.forEach((v) => queryParams.append(key, v.toString()));
            } else {
              queryParams.append(key, value.toString());
            }
          }
        });
      }

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
   * Search ads
   */
  async searchAds(params?: AdListParams): Promise<AdListResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            if (Array.isArray(value)) {
              value.forEach((v) => queryParams.append(key, v.toString()));
            } else {
              queryParams.append(key, value.toString());
            }
          }
        });
      }

      const url = `${API_CONFIG.ENDPOINTS.ADS.SEARCH}${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;
      const response = await this.get<AdListResponse>(url, false);

      if (response.data) {
        return response.data;
      }

      throw new Error("Failed to search ads");
    } catch (error: any) {
      console.error("Search ads error:", error);
      throw error;
    }
  }

  /**
   * Get user's own ads
   */
  async getMyAds(params?: AdListParams): Promise<AdListResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `${API_CONFIG.ENDPOINTS.ADS.MY_ADS}${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;
      const response = await this.get<AdListResponse>(url, true);

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
   * Get user's own ads
   */
  async getMyAds(params?: AdListParams): Promise<AdListResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `${API_CONFIG.ENDPOINTS.ADS.USER_ADS}${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;
      const response = await this.get<AdListResponse>(url, true);

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
   * Delete ad
   */
  async deleteAd(slug: string): Promise<void> {
    try {
      const url = API_CONFIG.ENDPOINTS.ADS.DELETE.replace(":slug", slug);
      await this.delete(url, true);
    } catch (error: any) {
      console.error("Delete ad error:", error);
      throw error;
    }
  }

  /**
   * Get ad analytics
   */
  async getAdAnalytics(slug: string, days: number = 30): Promise<AdAnalytics> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.ADS.ANALYTICS.replace(
        ":slug",
        slug
      )}?days=${days}`;
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
   * Get dashboard analytics
   */
  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    try {
      const response = await this.get<DashboardAnalytics>(
        API_CONFIG.ENDPOINTS.ADS.DASHBOARD_ANALYTICS,
        true
      );

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
   * Get featured ads
   */
  async getFeaturedAds(params?: {
    page_size?: number;
    categorySlug?: string;
    cityId?: number;
    stateCode?: string;
    sort_by?: string;
  }): Promise<Ad[]> {
    try {
      const queryParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `${API_CONFIG.ENDPOINTS.ADS.FEATURED}${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;
      const response = await this.get<Ad[]>(url, false);

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
   * Track contact view
   */
  async trackContactView(slug: string): Promise<void> {
    try {
      const url = API_CONFIG.ENDPOINTS.ADS.CONTACT_VIEW.replace(":slug", slug);
      await this.post(url, {}, false);
    } catch (error: any) {
      // Don't throw - tracking failures shouldn't break UX
    }
  }

  /**
   * Promote ad to featured
   */
  async promoteAd(
    slug: string,
    paymentData: { payment_method: string; payment_id?: string }
  ): Promise<{ message: string; featured_expires_at: string }> {
    try {
      const url = API_CONFIG.ENDPOINTS.ADS.PROMOTE.replace(":slug", slug);
      const response = await this.post<{
        message: string;
        featured_expires_at: string;
      }>(url, paymentData, true);

      if (response.data) {
        return response.data;
      }

      throw new Error("Failed to promote ad");
    } catch (error: any) {
      console.error("Promote ad error:", error);
      throw error;
    }
  }

  /**
   * Add ad to favorites
   */
  async addToFavorites(adId: number): Promise<void> {
    try {
      await this.post(API_CONFIG.ENDPOINTS.ADS.FAVORITES, { ad: adId }, true);
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
      await this.delete(`${API_CONFIG.ENDPOINTS.ADS.FAVORITES}remove/`, true, {
        ad: adId,
      });
    } catch (error: any) {
      console.error("Remove from favorites error:", error);
      throw error;
    }
  }

  /**
   * Report ad
   */
  async reportAd(
    adId: number,
    data: { reason: string; description: string }
  ): Promise<any> {
    try {
      const response = await this.post(
        API_CONFIG.ENDPOINTS.ADS.REPORTS,
        { ad: adId, ...data },
        true
      );
      return response.data;
    } catch (error: any) {
      console.error("Report ad error:", error);
      throw error;
    }
  }

  /**
   * Get user's submitted reports
   */
  async getMyReports(): Promise<any> {
    try {
      const response = await this.get(
        API_CONFIG.ENDPOINTS.ADS.REPORTS,
        true
      );
      return response.data;
    } catch (error: any) {
      console.error("Get my reports error:", error);
      throw error;
    }
  }
}

export const adsService = new AdsService();
