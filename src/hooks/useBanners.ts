// src/hooks/useBanners.ts
import { useState, useEffect } from "react";
import { bannerService } from "../services/bannerService";
import type { PublicBanner, BannerPosition, BannerListParams } from "../types/banners";

interface UseBannersOptions {
  position: BannerPosition;
  stateCode?: string;
  categoryId?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseBannersReturn {
  banners: PublicBanner[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useBanners = ({
  position,
  stateCode,
  categoryId,
  autoRefresh = false,
  refreshInterval = 300000, // 5 minutes
}: UseBannersOptions): UseBannersReturn => {
  const [banners, setBanners] = useState<PublicBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBanners = async () => {
    try {
      setError(null);
      const params: BannerListParams = {
        position,
        state: stateCode,
        category: categoryId,
      };
      
      const data = await bannerService.getBanners(params);
      setBanners(data);
    } catch (err) {
      console.error("Failed to fetch banners:", err);
      setError("Failed to load banners");
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    setLoading(true);
    await fetchBanners();
  };

  useEffect(() => {
    fetchBanners();
  }, [position, stateCode, categoryId]);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchBanners, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, position, stateCode, categoryId]);

  return {
    banners,
    loading,
    error,
    refetch,
  };
};

// Hook for tracking banner interactions
export const useBannerTracking = () => {
  const trackImpression = async (bannerId: number) => {
    try {
      await bannerService.trackImpression(bannerId);
    } catch (error) {
      console.error("Failed to track impression:", error);
    }
  };

  const trackClick = async (bannerId: number) => {
    try {
      await bannerService.trackClick(bannerId);
    } catch (error) {
      console.error("Failed to track click:", error);
    }
  };

  return {
    trackImpression,
    trackClick,
  };
};