// src/hooks/useStates.ts
import { useState, useEffect, useCallback } from "react";
import { contentService } from "../services";

interface State {
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
  created_at: string;
}

interface UseStatesReturn {
  states: State[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useStates = (useCache: boolean = true): UseStatesReturn => {
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await contentService.getStates(useCache);

      // Filter only active states
      const activeStates = data.filter((state: State) => state.is_active);

      // Sort alphabetically by name
      const sortedStates = activeStates.sort((a, b) => a.name.localeCompare(b.name));

      setStates(sortedStates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load states";
      setError(errorMessage);
      console.error("Error fetching states:", err);
    } finally {
      setLoading(false);
    }
  }, [useCache]);

  useEffect(() => {
    fetchStates();
  }, [fetchStates]);

  return {
    states,
    loading,
    error,
    refetch: fetchStates,
  };
};
