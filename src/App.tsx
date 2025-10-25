// src/App.tsx
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
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
import ProfilePage from "./pages/ProfilePage";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import { useToast } from "./contexts/ToastContext";
import MessagesPage from "./pages/MessagesPage";

function App() {
  const [isPostAdModalOpen, setIsPostAdModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [shouldOpenPostAdAfterLogin, setShouldOpenPostAdAfterLogin] =
    useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  // Get auth state from context
  const { isAuthenticated, user, logout } = useAuth();

  const handlePostAd = () => {
    // Block admin users from posting ads
    if (isAuthenticated && (user?.is_staff || user?.is_superuser)) {
      toast.info("Admin users cannot post ads. Please use a regular user account.");
      return;
    }
    
    if (isAuthenticated) {
      setIsPostAdModalOpen(true);
    } else {
      setShouldOpenPostAdAfterLogin(true);
      setIsSignInModalOpen(true);
    }
  };

  // Handle successful sign-in
  const handleSignInSuccess = () => {
    setIsSignInModalOpen(false);
    
    // Get fresh user data from localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      const isAdmin = userData.is_staff || userData.is_superuser;
      
      if (isAdmin) {
        navigate("/admin");
        return;
      }
    }
    
    // Only open post ad modal if user was specifically trying to post an ad
    if (shouldOpenPostAdAfterLogin) {
      setIsPostAdModalOpen(true);
      setShouldOpenPostAdAfterLogin(false);
    }
  };

  // Handle successful ad creation
  const handlePostAdSuccess = () => {
    console.log("Ad created successfully!");
    toast.success("Ad created successfully!");
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setIsPostAdModalOpen(false);
      setIsSignInModalOpen(false);
      setShouldOpenPostAdAfterLogin(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Listen for custom events from dashboard
  useEffect(() => {
    const handleOpenPostAdModal = () => {
      if (isAuthenticated) {
        setIsPostAdModalOpen(true);
      }
    };

    window.addEventListener("openPostAdModal", handleOpenPostAdModal);
    return () => {
      window.removeEventListener("openPostAdModal", handleOpenPostAdModal);
    };
  }, [isAuthenticated]);

  // Show loading spinner while checking auth status
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
  //         <p className="mt-2 text-gray-600">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <Header
        onPostAd={handlePostAd}
        onSignIn={() => setIsSignInModalOpen(true)}
        isLoggedIn={isAuthenticated}
        user={user}
        onSignOut={handleSignOut}
      />

      {/* Auto scroll to top on route change */}
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/city/:cityName" element={<CityPage />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/featured-ads" element={<FeaturedAdsPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute blockAdmin={true}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
  path="/messages/:conversationId"
  element={
    <ProtectedRoute>
      <MessagesPage />
    </ProtectedRoute>
  }
/>
      </Routes>

      <Footer />

      {/* Post Ad Modal */}
      <PostAdModal
        isOpen={isPostAdModalOpen}
        onClose={() => setIsPostAdModalOpen(false)}
        onSuccess={handlePostAdSuccess}
      />

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => {
          setIsSignInModalOpen(false);
          setShouldOpenPostAdAfterLogin(false); // Reset flag if user cancels
        }}
        onSignInSuccess={handleSignInSuccess}
      />
    </div>
  );
}

export default App;
