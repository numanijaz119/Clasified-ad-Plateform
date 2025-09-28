// src/hooks/useFeaturedAds.ts
import { useState, useEffect, useCallback } from "react";
import { adsService } from "../services";

interface Ad {
  id: number;
  slug: string;
  title: string;
  description: string;
  price: number;
  price_type: "fixed" | "negotiable" | "contact";
  display_price: string;
  condition?: "new" | "used" | "like_new";
  category: {
    id: number;
    name: string;
    icon: string;
  };
  city: {
    id: number;
    name: string;
  };
  state: {
    id: number;
    name: string;
    code: string;
  };
  plan: "free" | "featured";
  primary_image?: {
    id: number;
    image: string;
    caption?: string;
  };
  view_count: number;
  time_since_posted: string;
  is_featured_active: boolean;
  created_at: string;
}

interface UseFeaturedAdsReturn {
  ads: Ad[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface FeaturedAdsParams {
  page_size?: number;
  categorySlug?: string;
  cityId?: number;
  stateCode?: string;
}

export const useFeaturedAds = (
  params?: FeaturedAdsParams
): UseFeaturedAdsReturn => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedAds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const queryParams: any = {
        sort_by: "newest",
        ...params,
      };

      const response = await adsService.getFeaturedAds(queryParams);

      // Check if response has results
      if (response && response.results) {
        setAds(response.results);
      } else if (Array.isArray(response)) {
        setAds(response);
      } else {
        setAds([]);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load featured ads";
      setError(errorMessage);
      console.error("Error fetching featured ads:", err);
    } finally {
      setLoading(false);
    }
  }, [params?.page_size, params?.categorySlug, params?.cityId, params?.stateCode]);

  useEffect(() => {
    fetchFeaturedAds();
  }, [fetchFeaturedAds]);

  return {
    ads,
    loading,
    error,
    refetch: fetchFeaturedAds,
  };
};
