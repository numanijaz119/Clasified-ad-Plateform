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
  blockAdmin?: boolean; // New: Block admin users from accessing this route
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
  blockAdmin = false,
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
    return <Navigate to={`${fallbackPath}?redirect=${encodeURIComponent(from)}`} replace />;
  }

  // Block admin users from accessing user-only routes (like user dashboard)
  if (blockAdmin && isAuthenticated) {
    const isAdmin = user?.is_staff || user?.is_superuser;
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    }
  }

  // Check admin requirement - user must be staff or superuser
  if (requireAdmin && isAuthenticated) {
    const isAdmin = user?.is_staff || user?.is_superuser;

    if (!isAdmin) {
      console.warn("Access denied: Admin privileges required");
      return <Navigate to="/" replace />;
    }
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
