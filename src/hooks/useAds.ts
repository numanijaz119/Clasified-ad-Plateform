// src/hooks/useAds.ts
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

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Ad[];
}

interface UseAdsParams {
  category?: string;
  city?: number;
  state?: string;
  search?: string;
  price_min?: number;
  price_max?: number;
  condition?: string;
  sort_by?: "newest" | "oldest" | "price_low" | "price_high" | "alphabetical";
  page?: number;
  page_size?: number;
}

interface UseAdsReturn {
  ads: Ad[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
  refetch: (params?: UseAdsParams) => Promise<void>;
}

export const useAds = (initialParams?: UseAdsParams): UseAdsReturn => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [currentParams, setCurrentParams] = useState<UseAdsParams | undefined>(
    initialParams
  );

  const fetchAds = useCallback(
    async (params?: UseAdsParams) => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = params || currentParams || {};

        const response = await adsService.getAds(queryParams);

        if (response && response.results) {
          setAds(response.results);
          setTotalCount(response.count || 0);
          setHasNext(!!response.next);
          setHasPrevious(!!response.previous);
        } else if (Array.isArray(response)) {
          setAds(response);
          setTotalCount(response.length);
          setHasNext(false);
          setHasPrevious(false);
        } else {
          setAds([]);
          setTotalCount(0);
          setHasNext(false);
          setHasPrevious(false);
        }

        if (params) {
          setCurrentParams(params);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load ads";
        setError(errorMessage);
        console.error("Error fetching ads:", err);
      } finally {
        setLoading(false);
      }
    },
    [currentParams]
  );

  useEffect(() => {
    fetchAds();
  }, []);

  return {
    ads,
    loading,
    error,
    totalCount,
    hasNext,
    hasPrevious,
    refetch: fetchAds,
  };
};
