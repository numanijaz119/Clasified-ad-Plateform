// src/hooks/useCategories.ts
import { useState, useEffect, useCallback } from "react";
import { contentService } from "../../services";

interface Category {
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

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCategories = (activeOnly: boolean = true): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Service now handles pagination extraction
      const data = await contentService.getCategories();

      // Filter active categories if needed
      const filteredCategories = activeOnly ? data.filter((cat: Category) => cat.is_active) : data;

      // Sort by sort_order, then name
      const sortedCategories = filteredCategories.sort((a, b) => {
        if (a.sort_order !== b.sort_order) {
          return a.sort_order - b.sort_order;
        }
        return a.name.localeCompare(b.name);
      });

      setCategories(sortedCategories);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load categories";
      setError(errorMessage);
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};
