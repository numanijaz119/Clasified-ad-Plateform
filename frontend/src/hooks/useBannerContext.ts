// src/hooks/useBannerContext.ts
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export const useBannerContext = () => {
  const location = useLocation();
  const [stateCode, setStateCode] = useState<string>();
  const [categoryId, setCategoryId] = useState<number>();

  useEffect(() => {
    // Get state from URL or context
    const params = new URLSearchParams(location.search);
    const urlState = params.get("state");
    const urlCategory = params.get("category");

    // Try to get from localStorage if not in URL
    const savedState = !urlState ? localStorage.getItem("userState") : null;

    // Default to IL if no state is found
    const effectiveState = urlState || savedState || "IL";

    setStateCode(effectiveState);
    setCategoryId(urlCategory ? parseInt(urlCategory) : undefined);

    // Save the effective state to localStorage
    if (effectiveState) {
      localStorage.setItem("userState", effectiveState);
    }
  }, [location]);

  return { stateCode, categoryId };
};
