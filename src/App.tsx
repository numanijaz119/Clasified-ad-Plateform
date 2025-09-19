// src/App.tsx - UPDATED VERSION (matches your existing pattern)
import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import CityPage from "./pages/CityPage";
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";
import FeaturedAdsPage from "./pages/FeaturedAdsPage";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import Footer from "./components/Footer";
import PostAdModal from "./components/PostAdModal";
import SignInModal from "./components/SignInModal";
import { authService } from "./services/authService";

function App() {
  const [isPostAdModalOpen, setIsPostAdModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Initialize auth state using your existing auth service
        const { user: currentUser, isAuthenticated } =
          authService.initializeAuth();

        if (isAuthenticated && currentUser) {
          // Verify the token is still valid by calling the profile endpoint
          const userData = await authService.getProfile();
          setUser(userData);
          setIsLoggedIn(true);
        } else {
          // No valid auth data found
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Token is invalid or expired, logout
        authService.logout();
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Listen for auth events from your auth service
  useEffect(() => {
    const handleAuthLogin = (event: CustomEvent) => {
      setUser(event.detail);
      setIsLoggedIn(true);
    };

    const handleAuthLogout = () => {
      setUser(null);
      setIsLoggedIn(false);
    };

    window.addEventListener("auth:login", handleAuthLogin as EventListener);
    window.addEventListener("auth:logout", handleAuthLogout);

    return () => {
      window.removeEventListener(
        "auth:login",
        handleAuthLogin as EventListener
      );
      window.removeEventListener("auth:logout", handleAuthLogout);
    };
  }, []);

  const handlePostAd = () => {
    if (isLoggedIn) {
      setIsPostAdModalOpen(true);
    } else {
      setIsSignInModalOpen(true);
    }
  };

  const handleSignInSuccess = () => {
    // Get user data from auth service after successful login
    const userData = authService.getCurrentUser();
    setUser(userData);
    setIsLoggedIn(true);
    setIsSignInModalOpen(false);

    // If user was trying to post an ad, open that modal after sign in
    // Otherwise, they'll be navigated to dashboard by the modal
    setIsPostAdModalOpen(true);
  };

  const handleSignOut = () => {
    // Use your auth service logout method
    authService.logout();
    setIsLoggedIn(false);
    setUser(null);
    setIsPostAdModalOpen(false);
    setIsSignInModalOpen(false);
  };

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <Header
        onPostAd={handlePostAd}
        onSignIn={() => setIsSignInModalOpen(true)}
        isLoggedIn={isLoggedIn}
        user={user}
        onSignOut={handleSignOut}
      />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/city/:cityName" element={<CityPage />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/featured-ads" element={<FeaturedAdsPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<UserDashboard />} />
      </Routes>

      <Footer />

      {/* Post Ad Modal */}
      <PostAdModal
        isOpen={isPostAdModalOpen}
        onClose={() => setIsPostAdModalOpen(false)}
        isLoggedIn={isLoggedIn}
      />

      {/* Sign In Modal - Now properly refactored with smaller components */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onSignInSuccess={handleSignInSuccess}
      />
    </div>
  );
}

export default App;
