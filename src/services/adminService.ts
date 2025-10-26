// src/services/adminService.ts

import BaseApiService from "./baseApiService";
import { API_CONFIG } from "../config/api";
import {
  AdminDashboardStats,
  AdminAdListParams,
  AdminAdListResponse,
  AdminAdActionRequest,
  AdminAdActionResponse,
  AdminBulkAdActionRequest,
  AdminUserListParams,
  AdminUserListResponse,
  AdminUserActionRequest,
  AdminUserActionResponse,
  AdminUserActivity,
  AdminBulkUserActionRequest,
  AdminReportListParams,
  AdminReportListResponse,
  AdminReportActionRequest,
  AdminReportActionResponse,
  AdminBulkReportActionRequest,
  AdminBannerListParams,
  AdminBannerListResponse,
  AdminBannerCreateRequest,
  AdminBannerUpdateRequest,
  AdminBannerToggleResponse,
  AdminBannerAnalytics,
  AdminAnalyticsOverview,
  AdminAnalyticsUsers,
  AdminAnalyticsRevenue,
  AdminAnalyticsGeographic,
  AdminAnalyticsCategories,
  AdminAnalyticsParams,
  AdminStateListResponse,
  AdminCategoryStatsResponse,
  AdminCategoryCreateRequest,
  AdminCategoryUpdateRequest,
  AdminCityCreateRequest,
  AdminCityUpdateRequest,
} from "../types/admin";

class AdminService extends BaseApiService {
  // ============================================================================
  // DASHBOARD
  // ============================================================================

  async getDashboardStats(state?: string): Promise<AdminDashboardStats> {
    try {
      let url = API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD_STATS;
      if (state && state !== "all") {
        url += `?state=${state}`;
      }

      const response = await this.get<AdminDashboardStats>(url);
      return response.data!;
    } catch (error: any) {
      console.error("Get dashboard stats error:", error);
      throw error;
    }
  }

  // ============================================================================
  // ADS MANAGEMENT
  // ============================================================================

  async getAds(params?: AdminAdListParams): Promise<AdminAdListResponse> {
    try {
      let url = API_CONFIG.ENDPOINTS.ADMIN.ADS_LIST;

      if (params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, String(value));
          }
        });
        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }

      const response = await this.get<AdminAdListResponse>(url);
      return response.data!;
    } catch (error: any) {
      console.error("Get ads error:", error);
      throw error;
    }
  }

  async getAdDetail(id: number) {
    try {
      const url = API_CONFIG.ENDPOINTS.ADMIN.AD_DETAIL.replace(
        ":id",
        id.toString()
      );
      const response = await this.get(url);
      return response.data;
    } catch (error: any) {
      console.error("Get ad detail error:", error);
      throw error;
    }
  }

  async performAdAction(
    id: number,
    data: AdminAdActionRequest
  ): Promise<AdminAdActionResponse> {
    try {
      const url = API_CONFIG.ENDPOINTS.ADMIN.AD_ACTION.replace(
        ":id",
        id.toString()
      );
      const response = await this.post<AdminAdActionResponse>(url, data);
      return response.data!;
    } catch (error: any) {
      console.error("Perform ad action error:", error);
      throw error;
    }
  }

  async performBulkAdAction(data: AdminBulkAdActionRequest) {
    try {
      const response = await this.post(
        API_CONFIG.ENDPOINTS.ADMIN.BULK_AD_ACTION,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Perform bulk ad action error:", error);
      throw error;
    }
  }

  async deleteAd(id: number): Promise<void> {
    try {
      const url = API_CONFIG.ENDPOINTS.ADMIN.AD_DELETE.replace(
        ":id",
        id.toString()
      );
      await this.delete(url);
    } catch (error: any) {
      console.error("Delete ad error:", error);
      throw error;
    }
  }

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  async getUsers(params?: AdminUserListParams): Promise<AdminUserListResponse> {
    try {
      let url = API_CONFIG.ENDPOINTS.ADMIN.USERS_LIST;

      if (params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, String(value));
          }
        });
        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }

      const response = await this.get<AdminUserListResponse>(url);
      return response.data!;
    } catch (error: any) {
      console.error("Get users error:", error);
      throw error;
    }
  }

  async getUserDetail(id: number) {
    try {
      const url = API_CONFIG.ENDPOINTS.ADMIN.USER_DETAIL.replace(
        ":id",
        id.toString()
      );
      const response = await this.get(url);
      return response.data;
    } catch (error: any) {
      console.error("Get user detail error:", error);
      throw error;
    }
  }

  async performUserAction(
    id: number,
    data: AdminUserActionRequest
  ): Promise<AdminUserActionResponse> {
    try {
      const url = API_CONFIG.ENDPOINTS.ADMIN.USER_ACTION.replace(
        ":id",
        id.toString()
      );
      const response = await this.post<AdminUserActionResponse>(url, data);
      return response.data!;
    } catch (error: any) {
      console.error("Perform user action error:", error);
      throw error;
    }
  }

  async getUserActivity(id: number): Promise<AdminUserActivity[]> {
    try {
      const url = API_CONFIG.ENDPOINTS.ADMIN.USER_ACTIVITY.replace(
        ":id",
        id.toString()
      );
      const response = await this.get<AdminUserActivity[]>(url);
      return response.data!;
    } catch (error: any) {
      console.error("Get user activity error:", error);
      throw error;
    }
  }

  async performBulkUserAction(data: AdminBulkUserActionRequest) {
    try {
      const response = await this.post(
        API_CONFIG.ENDPOINTS.ADMIN.BULK_USER_ACTION,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Perform bulk user action error:", error);
      throw error;
    }
  }

  // ============================================================================
  // REPORTS MANAGEMENT
  // ============================================================================

  async getReports(
    params?: AdminReportListParams
  ): Promise<AdminReportListResponse> {
    try {
      let url = API_CONFIG.ENDPOINTS.ADMIN.REPORTS_LIST;

      if (params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, String(value));
          }
        });
        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }

      const response = await this.get<AdminReportListResponse>(url);
      return response.data!;
    } catch (error: any) {
      console.error("Get reports error:", error);
      throw error;
    }
  }

  async getReportDetail(id: number) {
    try {
      const url = API_CONFIG.ENDPOINTS.ADMIN.REPORT_DETAIL.replace(
        ":id",
        id.toString()
      );
      const response = await this.get(url);
      return response.data;
    } catch (error: any) {
      console.error("Get report detail error:", error);
      throw error;
    }
  }

  async performReportAction(
    id: number,
    data: AdminReportActionRequest
  ): Promise<AdminReportActionResponse> {
    try {
      const url = API_CONFIG.ENDPOINTS.ADMIN.REPORT_ACTION.replace(
        ":id",
        id.toString()
      );
      const response = await this.post<AdminReportActionResponse>(url, data);
      return response.data!;
    } catch (error: any) {
      console.error("Perform report action error:", error);
      throw error;
    }
  }

  async performBulkReportAction(data: AdminBulkReportActionRequest) {
    try {
      const response = await this.post(
        API_CONFIG.ENDPOINTS.ADMIN.BULK_REPORT_ACTION,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Perform bulk report action error:", error);
      throw error;
    }
  }

  // Alias for easier usage
  async handleReport(id: number, data: AdminReportActionRequest) {
    return this.performReportAction(id, data);
  }

  // ============================================================================
  // BANNER MANAGEMENT
  // ============================================================================

  async getBanners(
    params?: AdminBannerListParams
  ): Promise<AdminBannerListResponse> {
    try {
      let url = API_CONFIG.ENDPOINTS.ADMIN.BANNERS_LIST;

      if (params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, String(value));
          }
        });
        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }

      const response = await this.get<AdminBannerListResponse>(url);
      return response.data!;
    } catch (error: any) {
      console.error("Get banners error:", error);
      throw error;
    }
  }

  async getBannerDetail(id: number) {
    try {
      const url = API_CONFIG.ENDPOINTS.ADMIN.BANNER_DETAIL.replace(
        ":id",
        id.toString()
      );
      const response = await this.get(url);
      return response.data;
    } catch (error: any) {
      console.error("Get banner detail error:", error);
      throw error;
    }
  }

  async createBanner(data: AdminBannerCreateRequest) {
    try {
      const formData = new FormData();

      // Required fields
      formData.append("title", data.title);
      formData.append("banner_type", data.banner_type);
      formData.append("position", data.position);

      // Conditional required fields based on banner_type
      if (data.banner_type === "image" && data.image) {
        formData.append("image", data.image);
      }
      if (data.banner_type === "html" && data.html_content) {
        formData.append("html_content", data.html_content);
      }
      if (data.banner_type === "text" && data.text_content) {
        formData.append("text_content", data.text_content);
      }

      // Optional fields
      if (data.description) formData.append("description", data.description);
      if (data.click_url) formData.append("click_url", data.click_url);
      if (data.open_new_tab !== undefined) {
        formData.append("open_new_tab", data.open_new_tab.toString());
      }
      if (data.is_active !== undefined) {
        formData.append("is_active", data.is_active.toString());
      }
      if (data.start_date) formData.append("start_date", data.start_date);
      if (data.end_date) formData.append("end_date", data.end_date);
      if (data.priority !== undefined) {
        formData.append("priority", data.priority.toString());
      }

      // ManyToMany fields - append each ID separately
      if (data.target_states && data.target_states.length > 0) {
        data.target_states.forEach((stateId) => {
          formData.append("target_states", stateId.toString());
        });
      }
      if (data.target_categories && data.target_categories.length > 0) {
        data.target_categories.forEach((catId) => {
          formData.append("target_categories", catId.toString());
        });
      }

      const response = await this.post(
        API_CONFIG.ENDPOINTS.ADMIN.BANNER_CREATE,
        formData
      );
      return response.data;
    } catch (error: any) {
      console.error("Create banner error:", error);
      throw error;
    }
  }

  async updateBanner(id: number, data: AdminBannerUpdateRequest) {
    try {
      const url = API_CONFIG.ENDPOINTS.ADMIN.BANNER_UPDATE.replace(
        ":id",
        id.toString()
      );

      const formData = new FormData();

      // Only append fields that are provided
      if (data.title) formData.append("title", data.title);
      if (data.description !== undefined)
        formData.append("description", data.description);
      if (data.banner_type) formData.append("banner_type", data.banner_type);
      if (data.position) formData.append("position", data.position);

      // Content fields
      if (data.image) formData.append("image", data.image);
      if (data.html_content !== undefined)
        formData.append("html_content", data.html_content);
      if (data.text_content !== undefined)
        formData.append("text_content", data.text_content);

      // Optional fields
      if (data.click_url !== undefined)
        formData.append("click_url", data.click_url);
      if (data.open_new_tab !== undefined) {
        formData.append("open_new_tab", data.open_new_tab.toString());
      }
      if (data.is_active !== undefined) {
        formData.append("is_active", data.is_active.toString());
      }
      if (data.start_date !== undefined)
        formData.append("start_date", data.start_date);
      if (data.end_date !== undefined)
        formData.append("end_date", data.end_date);
      if (data.priority !== undefined) {
        formData.append("priority", data.priority.toString());
      }

      // ManyToMany fields
      if (data.target_states !== undefined) {
        if (data.target_states.length > 0) {
          data.target_states.forEach((stateId) => {
            formData.append("target_states", stateId.toString());
          });
        } else {
          // Send empty array to clear
          formData.append("target_states", "");
        }
      }
      if (data.target_categories !== undefined) {
        if (data.target_categories.length > 0) {
          data.target_categories.forEach((catId) => {
            formData.append("target_categories", catId.toString());
          });
        } else {
          formData.append("target_categories", "");
        }
      }

      const response = await this.put(url, formData);
      return response.data;
    } catch (error: any) {
      console.error("Update banner error:", error);
      throw error;
    }
  }

  async deleteBanner(id: number): Promise<void> {
    try {
      const url = API_CONFIG.ENDPOINTS.ADMIN.BANNER_DELETE.replace(
        ":id",
        id.toString()
      );
      await this.delete(url);
    } catch (error: any) {
      console.error("Delete banner error:", error);
      throw error;
    }
  }

  async toggleBanner(id: number): Promise<AdminBannerToggleResponse> {
    try {
      const url = API_CONFIG.ENDPOINTS.ADMIN.BANNER_TOGGLE.replace(
        ":id",
        id.toString()
      );
      const response = await this.post<AdminBannerToggleResponse>(url);
      return response.data!;
    } catch (error: any) {
      console.error("Toggle banner error:", error);
      throw error;
    }
  }

  async getBannerAnalytics(id: number): Promise<AdminBannerAnalytics> {
    try {
      const url = API_CONFIG.ENDPOINTS.ADMIN.BANNER_ANALYTICS.replace(
        ":id",
        id.toString()
      );
      const response = await this.get<AdminBannerAnalytics>(url);
      return response.data!;
    } catch (error: any) {
      console.error("Get banner analytics error:", error);
      throw error;
    }
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  async getAnalyticsOverview(
    params?: AdminAnalyticsParams
  ): Promise<AdminAnalyticsOverview> {
    try {
      let url = API_CONFIG.ENDPOINTS.ADMIN.ANALYTICS_OVERVIEW;

      if (params) {
        const queryParams = new URLSearchParams();
        if (params.state) queryParams.append("state", params.state);
        if (params.days) queryParams.append("days", params.days.toString());
        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }

      const response = await this.get<AdminAnalyticsOverview>(url);
      return response.data!;
    } catch (error: any) {
      console.error("Get analytics overview error:", error);
      throw error;
    }
  }

  async getAnalyticsUsers(
    params?: AdminAnalyticsParams
  ): Promise<AdminAnalyticsUsers> {
    try {
      let url = API_CONFIG.ENDPOINTS.ADMIN.ANALYTICS_USERS;

      if (params?.days) {
        url += `?days=${params.days}`;
      }

      const response = await this.get<AdminAnalyticsUsers>(url);
      return response.data!;
    } catch (error: any) {
      console.error("Get analytics users error:", error);
      throw error;
    }
  }

  async getAnalyticsRevenue(
    params?: AdminAnalyticsParams
  ): Promise<AdminAnalyticsRevenue> {
    try {
      let url = API_CONFIG.ENDPOINTS.ADMIN.ANALYTICS_REVENUE;

      if (params?.days) {
        url += `?days=${params.days}`;
      }

      const response = await this.get<AdminAnalyticsRevenue>(url);
      return response.data!;
    } catch (error: any) {
      console.error("Get analytics revenue error:", error);
      throw error;
    }
  }

  async getAnalyticsGeographic(): Promise<AdminAnalyticsGeographic> {
    try {
      const response = await this.get<AdminAnalyticsGeographic>(
        API_CONFIG.ENDPOINTS.ADMIN.ANALYTICS_GEOGRAPHIC
      );
      return response.data!;
    } catch (error: any) {
      console.error("Get analytics geographic error:", error);
      throw error;
    }
  }

  async getAnalyticsCategories(): Promise<AdminAnalyticsCategories> {
    try {
      const response = await this.get<AdminAnalyticsCategories>(
        API_CONFIG.ENDPOINTS.ADMIN.ANALYTICS_CATEGORIES
      );
      return response.data!;
    } catch (error: any) {
      console.error("Get analytics categories error:", error);
      throw error;
    }
  }

  // ============================================================================
  // CONTENT MANAGEMENT
  // ============================================================================

  async getStates(): Promise<AdminStateListResponse> {
    try {
      const response = await this.get<AdminStateListResponse>(
        API_CONFIG.ENDPOINTS.ADMIN.STATES_LIST
      );
      return response.data!;
    } catch (error: any) {
      console.error("Get states error:", error);
      throw error;
    }
  }

  async getCategoryStats(): Promise<AdminCategoryStatsResponse> {
    try {
      const response = await this.get<AdminCategoryStatsResponse>(
        API_CONFIG.ENDPOINTS.ADMIN.CATEGORIES_STATS
      );
      return response.data!;
    } catch (error: any) {
      console.error("Get category stats error:", error);
      throw error;
    }
  }

  async createCategory(data: AdminCategoryCreateRequest) {
    try {
      const response = await this.post(
        API_CONFIG.ENDPOINTS.ADMIN.CATEGORY_CREATE,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Create category error:", error);
      throw error;
    }
  }

  async updateCategory(id: number, data: AdminCategoryUpdateRequest) {
    try {
      const url = API_CONFIG.ENDPOINTS.ADMIN.CATEGORY_UPDATE.replace(
        ":id",
        id.toString()
      );
      const response = await this.put(url, data);
      return response.data;
    } catch (error: any) {
      console.error("Update category error:", error);
      throw error;
    }
  }

  async deleteCategory(id: number): Promise<void> {
    try {
      const url = API_CONFIG.ENDPOINTS.ADMIN.CATEGORY_DELETE.replace(
        ":id",
        id.toString()
      );
      await this.delete(url);
    } catch (error: any) {
      console.error("Delete category error:", error);
      throw error;
    }
  }

  async createCity(data: AdminCityCreateRequest) {
    try {
      const response = await this.post(
        API_CONFIG.ENDPOINTS.ADMIN.CITY_CREATE,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Create city error:", error);
      throw error;
    }
  }

  async updateCity(id: number, data: AdminCityUpdateRequest) {
    try {
      const url = API_CONFIG.ENDPOINTS.ADMIN.CITY_UPDATE.replace(
        ":id",
        id.toString()
      );
      const response = await this.put(url, data);
      return response.data;
    } catch (error: any) {
      console.error("Update city error:", error);
      throw error;
    }
  }

  async deleteCity(id: number): Promise<void> {
    try {
      const url = API_CONFIG.ENDPOINTS.ADMIN.CITY_DELETE.replace(
        ":id",
        id.toString()
      );
      await this.delete(url);
    } catch (error: any) {
      console.error("Delete city error:", error);
      throw error;
    }
  }

  // ============================================================================
  // DATA EXPORT
  // ============================================================================

  async exportAds(params?: any): Promise<Blob> {
    try {
      let url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADMIN.EXPORT_ADS}`;
      
      if (params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, String(value));
          }
        });
        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      return await response.blob();
    } catch (error: any) {
      console.error("Export ads error:", error);
      throw error;
    }
  }

  async exportUsers(params?: any): Promise<Blob> {
    try {
      let url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADMIN.EXPORT_USERS}`;
      
      if (params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, String(value));
          }
        });
        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      return await response.blob();
    } catch (error: any) {
      console.error("Export users error:", error);
      throw error;
    }
  }

  async exportReports(params?: any): Promise<Blob> {
    try {
      let url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADMIN.EXPORT_REPORTS}`;
      
      if (params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, String(value));
          }
        });
        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      return await response.blob();
    } catch (error: any) {
      console.error("Export reports error:", error);
      throw error;
    }
  }
}

// Export singleton instance
const adminService = new AdminService();
export { adminService };
