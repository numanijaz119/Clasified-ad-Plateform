// src/hooks/useAuthRedirect.ts
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Hook to handle redirects after successful authentication
 * Reads the redirect parameter from URL and navigates to intended destination
 */
export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Only proceed if user is authenticated and not loading
    if (!isAuthenticated || isLoading) {
      return;
    }

    // Get redirect parameter from URL
    const searchParams = new URLSearchParams(location.search);
    const redirectTo = searchParams.get("redirect");

    if (redirectTo) {
      try {
        // Decode and validate the redirect URL
        const decodedRedirect = decodeURIComponent(redirectTo);

        // Security check: ensure redirect is to internal path
        if (decodedRedirect.startsWith("/") && !decodedRedirect.startsWith("//")) {
          // Remove the redirect parameter from current URL
          searchParams.delete("redirect");
          const newSearch = searchParams.toString();
          const currentPathWithoutRedirect = location.pathname + (newSearch ? `?${newSearch}` : "");

          // Replace current history entry to clean up URL
          window.history.replaceState(null, "", currentPathWithoutRedirect);

          // Navigate to intended destination
          navigate(decodedRedirect, { replace: true });
        }
      } catch (error) {
        console.warn("Invalid redirect parameter:", error);
      }
    }
  }, [isAuthenticated, isLoading, location, navigate]);
};

export default useAuthRedirect;
