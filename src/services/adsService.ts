// src/services/adsService.ts
import BaseApiService from "./baseApiService";
import { API_CONFIG } from "../config/api";

// Ads Types
export interface AdImage {
  id: number;
  image: string;
  caption?: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Ad {
  id: number;
  title: string;
  slug: string;
  description: string;
  price?: number;
  currency: string;
  contact_phone: string;
  contact_email: string;
  plan: "free" | "featured";
  status: "pending" | "approved" | "rejected" | "expired" | "deleted";
  view_count: number;
  created_at: string;
  updated_at: string;
  expires_at: string;
  approved_at?: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  city: {
    id: number;
    name: string;
    slug: string;
  };
  state: {
    id: number;
    name: string;
    code: string;
  };
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
  };
  images: AdImage[];
  primary_image?: AdImage;
}

export interface CreateAdRequest {
  title: string;
  description: string;
  price?: number;
  currency: string;
  category: number;
  city: number;
  contact_phone: string;
  contact_email: string;
  plan: "free" | "featured";
  images?: File[];
}

export interface UpdateAdRequest extends Partial<CreateAdRequest> {
  slug: string;
}

export interface AdListParams {
  page?: number;
  category?: string;
  city?: string;
  state?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  plan?: "free" | "featured";
  ordering?: string;
}

export interface AdListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Ad[];
}

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
        adData.images.forEach((image, index) => {
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
        updateData.images.forEach((image, index) => {
          formData.append(`images`, image);
        });
      }

      const url = API_CONFIG.ENDPOINTS.ADS.UPDATE_DELETE.replace(":slug", slug);

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
      const url = API_CONFIG.ENDPOINTS.ADS.UPDATE_DELETE.replace(":slug", slug);

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
  async uploadAdImages(slug: string, images: File[]): Promise<AdImage[]> {
    try {
      const formData = new FormData();

      images.forEach((image, index) => {
        formData.append(`images`, image);
      });

      const url = `${API_CONFIG.ENDPOINTS.ADS.UPDATE_DELETE.replace(
        ":slug",
        slug
      )}/images/`;

      const response = await this.post<AdImage[]>(url, formData, true);

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
  async deleteAdImage(adSlug: string, imageId: number): Promise<void> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.ADS.UPDATE_DELETE.replace(
        ":slug",
        adSlug
      )}/images/${imageId}/`;

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
  async setPrimaryImage(adSlug: string, imageId: number): Promise<void> {
    try {
      const url = `${API_CONFIG.ENDPOINTS.ADS.UPDATE_DELETE.replace(
        ":slug",
        adSlug
      )}/images/${imageId}/set-primary/`;

      await this.patch(url, {}, true);

      console.log("Primary image set successfully");
    } catch (error: any) {
      console.error("Set primary image error:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const adsService = new AdsService();
export default adsService;
