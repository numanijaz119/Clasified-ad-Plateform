// src/App.tsx
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
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

function App() {
  const [isPostAdModalOpen, setIsPostAdModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  // Get auth state from context
  const { isAuthenticated, user, isLoading, logout } = useAuth();

  const handlePostAd = () => {
    if (isAuthenticated) {
      setIsPostAdModalOpen(true);
    } else {
      setIsSignInModalOpen(true);
    }
  };

  const handleSignInSuccess = () => {
    setIsSignInModalOpen(false);
    // If user was trying to post an ad, open that modal after sign in
    setIsPostAdModalOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setIsPostAdModalOpen(false);
      setIsSignInModalOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/city/:cityName" element={<CityPage />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/featured-ads" element={<FeaturedAdsPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>

      <Footer />

      {/* Post Ad Modal */}
      <PostAdModal
        isOpen={isPostAdModalOpen}
        onClose={() => setIsPostAdModalOpen(false)}
        isLoggedIn={isAuthenticated}
      />

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onSignInSuccess={handleSignInSuccess}
      />
    </div>
  );
}

export default App;
