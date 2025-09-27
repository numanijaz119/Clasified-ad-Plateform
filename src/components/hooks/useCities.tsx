// src/hooks/useCities.ts
import { useState, useEffect, useCallback } from "react";
import { contentService } from "../../services";

interface City {
  id: number;
  name: string;
  state: number;
  state_name?: string;
  state_code?: string;
  latitude?: number;
  longitude?: number;
  is_major: boolean;
  is_active: boolean;
  created_at: string;
}

interface UseCitiesReturn {
  cities: City[];
  loading: boolean;
  error: string | null;
  refetch: (stateCode?: string) => Promise<void>;
}

export const useCities = (
  stateCode?: string,
  useCache: boolean = true
): UseCitiesReturn => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCities = useCallback(
    async (filterStateCode?: string) => {
      try {
        setLoading(true);
        setError(null);

        // Service now handles pagination extraction
        const data = await contentService.getCities(
          filterStateCode || stateCode,
          useCache
        );

        // Sort: major cities first, then alphabetically
        const sortedCities = [...data].sort((a, b) => {
          if (a.is_major !== b.is_major) {
            return a.is_major ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });

        setCities(sortedCities);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load cities";
        setError(errorMessage);
        console.error("Error fetching cities:", err);
      } finally {
        setLoading(false);
      }
    },
    [stateCode, useCache]
  );

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  return {
    cities,
    loading,
    error,
    refetch: fetchCities,
  };
};
