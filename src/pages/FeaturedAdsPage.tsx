// src/pages/FeaturedAdsPage.tsx
// UPDATED: Added blue border for user's own ads

import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Eye, Clock, Star, MapPin } from "lucide-react";
import {
  MobileBanner,
  FlippingAd,
  SideBanner,
  InlineBanner,
  BottomBanner,
  RecentListing,
  RecentListings,
} from "../components/AdBanners";
import ListingModal from "../components/ListingModal";
import { useFeaturedAds } from "../hooks/useFeaturedAds";
import { useListingModal } from "../hooks/useListingModal";
import { useAuth } from "../contexts/AuthContext";
import Badge from "../components/ui/Badge";
import {
  AdDetailBanner,
  BetweenAdsBanner,
  FooterBanner,
  HeaderBanner,
  SidebarBanner,
} from "../components/common/BannerLayouts";

const FeaturedAdsPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth(); // Added user to check ownership
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Use dynamic data from API
  const { ads, loading, error, refetch } = useFeaturedAds({
    page_size: 50, // Get more ads for the full page
  });

  // Use reusable modal hook
  const { selectedListing, isModalOpen, handleListingClick, handleCloseModal } =
    useListingModal();

  const categories = [
    "all",
    "Jobs",
    "Real Estate",
    "Vehicles",
    "Buy & Sell",
    "Services",
    "Education",
    "Community Events",
    "Health & Wellness",
    "Matrimonial",
    "Food & Dining",
    "Entertainment",
  ];

  const cities = [
    "all",
    "Chicago",
    "Aurora",
    "Naperville",
    "Bloomington-Normal",
    "Peoria",
    "Springfield",
    "Urbana-Champaign",
    "Rockford",
  ];

  const filteredListings = useMemo(() => {
    if (!ads) return [];

    let filtered = ads.filter((ad) => {
      // Search query filter
      const matchesSearch =
        searchQuery === "" ||
        ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${ad.city.name}, ${ad.state.code}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory =
        selectedCategory === "all" || ad.category.name === selectedCategory;

      // City filter
      const matchesCity =
        selectedCity === "all" || ad.city.name.includes(selectedCity);

      return matchesSearch && matchesCategory && matchesCity;
    });

    // Sort listings
    if (sortBy === "newest") {
      filtered.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sortBy === "oldest") {
      filtered.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (sortBy === "alphabetical") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "views") {
      filtered.sort((a, b) => b.view_count - a.view_count);
    }

    return filtered;
  }, [ads, searchQuery, selectedCategory, selectedCity, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Ad Banner */}
      <div className="md:hidden bg-white border-b border-gray-200">
        <div className="px-4 py-2">
          <HeaderBanner />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4">
        <div className="flex gap-2 md:gap-4 lg:gap-6">
          {/* Left Sidebar with Ads */}
          <div className="md:w-48 xl:w-72 lg:w-64 hidden md:block flex-shrink-0">
            <div className="sticky top-24 space-y-4 z-10">
              <div className="block">
                <SidebarBanner />
              </div>
              <FlippingAd size="medium" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <Link
                  to="/"
                  className="flex items-center text-orange-500 hover:text-orange-600 transition-colors mr-4 text-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  <span className="font-medium">Back to Home</span>
                </Link>
              </div>

              <div className="flex items-center mb-1">
                <Star className="h-5 w-5 text-orange-500 mr-2 fill-current" />
                <h1 className="text-xl font-bold text-gray-900">
                  Featured Advertisements
                </h1>
              </div>
              <p className="text-sm text-gray-600">
                {filteredListings.length} featured listings • Premium ads from
                our community
              </p>
              {selectedCategory !== "all" && (
                <p className="text-sm text-orange-600">
                  Filtered by category: {selectedCategory}
                </p>
              )}
              {selectedCity !== "all" && (
                <p className="text-sm text-orange-600">
                  Filtered by city: {selectedCity}
                </p>
              )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4">
              {/* Search Bar */}
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search featured ads..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Filter Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === "all" ? "All Categories" : cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  >
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city === "all" ? "All Cities" : city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="alphabetical">Alphabetical</option>
                    <option value="views">Most Viewed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading featured ads...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center">
                  <div className="text-red-600 mb-4">
                    <Star className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Unable to load featured ads
                  </h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={refetch}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Featured Listings Grid with Inline Banners */}
            {!loading && !error && (
              <div className="space-y-6">
                {Array.from({
                  length: Math.ceil(filteredListings.length / 6),
                }).map((_, chunkIndex) => {
                  const startIndex = chunkIndex * 6;
                  const endIndex = Math.min(
                    startIndex + 6,
                    filteredListings.length
                  );
                  const chunkAds = filteredListings.slice(startIndex, endIndex);

                  return (
                    <React.Fragment key={chunkIndex}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {chunkAds.map((ad) => {
                          // Check if current user owns this ad
                          const isOwnAd = user && (ad.is_owner || ad.user_id === user.id);

                          return (
                            <div
                              key={ad.id}
                              onClick={() => handleListingClick(ad)}
                              className={`group bg-white rounded-lg shadow-sm transition-all cursor-pointer hover:shadow-md border-2 ${
                                isOwnAd
                                  ? 'border-blue-500' // Blue border for own ads
                                  : 'border-gray-200 hover:border-orange-300' // Original styling
                              }`}
                            >
                              {/* Image */}
                              <div className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                                {ad.primary_image?.image ? (
                                  <img
                                    src={ad.primary_image.image}
                                    alt={ad.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    No image
                                  </div>
                                )}

                                {/* Featured Badge */}
                                <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                                  <Star className="h-3 w-3 fill-current" />
                                  <span>Featured</span>
                                </div>
                              </div>

                              {/* Content */}
                              <div className="p-3">
                                {/* Category Badge */}
                                <Badge variant="secondary" className="mb-2 text-xs">
                                  {ad.category.name}
                                </Badge>

                                {/* Title */}
                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm group-hover:text-orange-600 transition-colors">
                                  {ad.title}
                                </h3>

                                {/* Description */}
                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                  {ad.description}
                                </p>

                                {/* Price */}
                                <div className="text-orange-600 font-bold text-base mb-2">
                                  {ad.display_price}
                                </div>

                                {/* Location */}
                                <div className="flex items-center text-gray-600 mb-1">
                                  <MapPin className="h-3 w-3 mr-0.5" />
                                  <span className="text-xs">
                                    {ad.city.name}, {ad.state.code}
                                  </span>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                                  <div className="flex items-center space-x-1">
                                    <Eye className="h-3 w-3" />
                                    <span>{ad.view_count} views</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{ad.time_since_posted}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Inline Banner after every 6 ads (except the last chunk) */}
                      {endIndex < filteredListings.length && (
                        <div className="w-full">
                          <BetweenAdsBanner />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            {/* No Results */}
            {!loading && !error && filteredListings.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center">
                  <div className="text-gray-400 mb-4">
                    <Star className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No featured ads found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your filters to see more results.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar with Ads */}
          <div className="md:w-48 xl:w-72 lg:w-64 hidden md:block flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              <RecentListings />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile FlippingAd */}
      <div className="m-4 md:hidden">
        <FlippingAd size="medium" />
      </div>

      {/* Bottom Banner Ad */}
      <div className="mx-4">
        <FooterBanner />
      </div>

      {/* Listing Modal */}
      <ListingModal
        listing={selectedListing}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isLoggedIn={isAuthenticated}
      />
    </div>
  );
};

export default FeaturedAdsPage;