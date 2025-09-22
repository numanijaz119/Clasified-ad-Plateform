// src/types/content.ts

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
  created_at: string;
  updated_at: string;
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
  created_at: string;
  updated_at: string;
}

export interface State {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  cities?: City[];
  ad_count?: number;
  created_at: string;
  updated_at: string;
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
