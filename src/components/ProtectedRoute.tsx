// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./ui/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  fallbackPath?: string;
}

/**
 * ProtectedRoute component that handles authentication checks smoothly
 * without causing CLS (Cumulative Layout Shift)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  fallbackPath = "/",
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show simple loading spinner with full height to prevent layout shift
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" text="Checking authentication..." />
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    // Store the intended destination for redirect after login
    const from = location.pathname + location.search;
    return (
      <Navigate
        to={`${fallbackPath}?redirect=${encodeURIComponent(from)}`}
        replace
      />
    );
  }

  // Check admin requirement (assuming admin check based on email or user properties)
  // You can modify this logic based on your actual admin role implementation
  if (requireAdmin && isAuthenticated) {
    const isAdmin =
      user?.email?.includes("admin") ||
      user?.email?.endsWith("@admin.com") ||
      // Add other admin detection logic here
      false;

    if (!isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
