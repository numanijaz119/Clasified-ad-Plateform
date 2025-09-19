import BaseApiService from "./baseApiService";
import { API_CONFIG } from "../config/api";

// Content Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parent?: Category;
  children?: Category[];
  ad_count?: number;
  is_active: boolean;
  sort_order: number;
}

export interface City {
  id: number;
  name: string;
  slug: string;
  state: number;
  state_name?: string;
  state_code?: string;
  is_active: boolean;
  ad_count?: number;
}

export interface State {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  cities?: City[];
  ad_count?: number;
}

class ContentService extends BaseApiService {
  // Cache for frequently accessed data
  private categoriesCache: Category[] | null = null;
  private citiesCache: City[] | null = null;
  private statesCache: State[] | null = null;

  /**
   * Get all categories
   */
  async getCategories(useCache: boolean = true): Promise<Category[]> {
    try {
      if (useCache && this.categoriesCache) {
        return this.categoriesCache;
      }

      const response = await this.get<Category[]>(
        API_CONFIG.ENDPOINTS.CONTENT.CATEGORIES,
        false
      );

      if (response.data) {
        this.categoriesCache = response.data;
        return response.data;
      }

      throw new Error("Failed to fetch categories");
    } catch (error: any) {
      console.error("Get categories error:", error);
      throw error;
    }
  }

  /**
   * Get category by slug
   */
  async getCategory(slug: string): Promise<Category> {
    try {
      const response = await this.get<Category>(
        `${API_CONFIG.ENDPOINTS.CONTENT.CATEGORIES}${slug}/`,
        false
      );

      if (response.data) {
        return response.data;
      }

      throw new Error("Category not found");
    } catch (error: any) {
      console.error("Get category error:", error);
      throw error;
    }
  }

  /**
   * Get all cities
   */
  async getCities(
    stateCode?: string,
    useCache: boolean = true
  ): Promise<City[]> {
    try {
      if (useCache && this.citiesCache && !stateCode) {
        return this.citiesCache;
      }

      let url = API_CONFIG.ENDPOINTS.CONTENT.CITIES;
      if (stateCode) {
        url += `?state=${stateCode}`;
      }

      const response = await this.get<City[]>(url, false);

      if (response.data) {
        if (!stateCode) {
          this.citiesCache = response.data;
        }
        return response.data;
      }

      throw new Error("Failed to fetch cities");
    } catch (error: any) {
      console.error("Get cities error:", error);
      throw error;
    }
  }

  /**
   * Get city by slug
   */
  async getCity(slug: string): Promise<City> {
    try {
      const response = await this.get<City>(
        `${API_CONFIG.ENDPOINTS.CONTENT.CITIES}${slug}/`,
        false
      );

      if (response.data) {
        return response.data;
      }

      throw new Error("City not found");
    } catch (error: any) {
      console.error("Get city error:", error);
      throw error;
    }
  }

  /**
   * Get all states
   */
  async getStates(useCache: boolean = true): Promise<State[]> {
    try {
      if (useCache && this.statesCache) {
        return this.statesCache;
      }

      const response = await this.get<State[]>(
        API_CONFIG.ENDPOINTS.CONTENT.STATES,
        false
      );

      if (response.data) {
        this.statesCache = response.data;
        return response.data;
      }

      throw new Error("Failed to fetch states");
    } catch (error: any) {
      console.error("Get states error:", error);
      throw error;
    }
  }

  /**
   * Get state by code
   */
  async getState(code: string): Promise<State> {
    try {
      const response = await this.get<State>(
        `${API_CONFIG.ENDPOINTS.CONTENT.STATES}${code}/`,
        false
      );

      if (response.data) {
        return response.data;
      }

      throw new Error("State not found");
    } catch (error: any) {
      console.error("Get state error:", error);
      throw error;
    }
  }

  /**
   * Get cities by state
   */
  async getCitiesByState(stateCode: string): Promise<City[]> {
    return this.getCities(stateCode, false);
  }

  /**
   * Search locations (cities and states)
   */
  async searchLocations(
    query: string
  ): Promise<{ cities: City[]; states: State[] }> {
    try {
      const [cities, states] = await Promise.all([
        this.getCities(),
        this.getStates(),
      ]);

      const searchQuery = query.toLowerCase();

      const filteredCities = cities.filter(
        (city) =>
          city.name.toLowerCase().includes(searchQuery) ||
          city.slug.toLowerCase().includes(searchQuery)
      );

      const filteredStates = states.filter(
        (state) =>
          state.name.toLowerCase().includes(searchQuery) ||
          state.code.toLowerCase().includes(searchQuery)
      );

      return {
        cities: filteredCities,
        states: filteredStates,
      };
    } catch (error: any) {
      console.error("Search locations error:", error);
      throw error;
    }
  }

  /**
   * Clear all caches (useful when data might be stale)
   */
  clearCache(): void {
    this.categoriesCache = null;
    this.citiesCache = null;
    this.statesCache = null;
  }

  /**
   * Get content statistics
   */
  async getContentStats(): Promise<{
    total_categories: number;
    total_cities: number;
    total_states: number;
    total_ads: number;
  }> {
    try {
      const response = await this.get<{
        total_categories: number;
        total_cities: number;
        total_states: number;
        total_ads: number;
      }>(`${API_CONFIG.ENDPOINTS.CONTENT.CATEGORIES}stats/`, false);

      if (response.data) {
        return response.data;
      }

      throw new Error("Failed to fetch content statistics");
    } catch (error: any) {
      console.error("Get content stats error:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const contentService = new ContentService();
export default contentService;
