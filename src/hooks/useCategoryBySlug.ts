// src/hooks/useCategoryBySlug.ts
import { useState, useEffect } from "react";
import { useCategories } from "./useCategories";

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

export const useCategoryBySlug = (slug?: string) => {
  const { categories, loading } = useCategories(true);
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (!slug || loading) return;

    // Convert URL format to slug (e.g., "Jobs" -> "jobs", "Buy & Sell" -> "buy-sell")
    const normalizedSlug = slug
      .toLowerCase()
      .replace(/\s+&\s+/g, "-")
      .replace(/\s+/g, "-");

    const found = categories.find(cat => cat.slug === normalizedSlug);
    setCategory(found || null);
  }, [slug, categories, loading]);

  return { category, loading };
};
