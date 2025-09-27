// src/types/content.ts (Complete file)

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  ads_count: number;
  state_ads_count?: number;
  created_at: string;
}

export interface City {
  id: number;
  name: string;
  slug?: string;
  state: number;
  state_name?: string;
  state_code?: string;
  latitude?: number;
  longitude?: number;
  is_major: boolean;
  is_active: boolean;
  ad_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface State {
  id: number;
  name: string;
  code: string;
  domain?: string;
  logo?: string;
  favicon?: string;
  meta_title?: string;
  meta_description?: string;
  is_active: boolean;
  cities_count?: number;
  cities?: City[];
  ad_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface ContentStats {
  total_categories: number;
  total_cities: number;
  total_states: number;
  total_ads: number;
  active_categories: number;
  active_cities: number;
  active_states: number;
}

export interface LocationSearchResult {
  cities: City[];
  states: State[];
}

export interface CategoryHierarchy {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  ad_count: number;
  children: CategoryHierarchy[];
  level: number;
}
