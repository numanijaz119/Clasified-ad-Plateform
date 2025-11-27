// src/pages/FeaturedAdsPage.tsx
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Star } from "lucide-react";
import { FlippingAd, RecentListings } from "../components/AdBanners";
import ListingModal from "../components/ListingModal";
import AdCard from "../components/AdCard";
import { useFeaturedAds } from "../hooks/useFeaturedAds";
import { useListingModal } from "../hooks/useListingModal";
import { useAuth } from "../contexts/AuthContext";
import { adsService } from "../services";
import {
  BetweenAdsBanner,
  FooterBanner,
  HeaderBanner,
  SidebarBanner,
} from "../components/common/BannerLayouts";
import PageHeader from "../components/PageHeader";

const FeaturedAdsPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Use dynamic data from API
  const { ads, loading, error, refetch } = useFeaturedAds({
    page_size: 50,
  });

  // Use reusable modal hook
  const { selectedListing, isModalOpen, handleListingClick, handleCloseModal } = useListingModal();

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

    let filtered = ads.filter(ad => {
      // Search query filter
      const matchesSearch =
        searchQuery === "" ||
        ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${ad.city.name}, ${ad.state.code}`.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === "all" || ad.category.name === selectedCategory;

      // City filter
      const matchesCity = selectedCity === "all" || ad.city.name.includes(selectedCity);

      return matchesSearch && matchesCategory && matchesCity;
    });

    // Sort listings
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortBy === "alphabetical") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "views") {
      filtered.sort((a, b) => b.view_count - a.view_count);
    }

    return filtered;
  }, [ads, searchQuery, selectedCategory, selectedCity, sortBy]);

  const handleAdClick = async (ad: any) => {
    try {
      // Open modal immediately with basic data
      handleListingClick(ad);

      // Fetch detailed ad data in background
      if (ad.slug) {
        const detailedAd = (await adsService.getAd(ad.slug)) as any;

        // Create enhanced listing with all images
        const images =
          detailedAd.images?.length > 0
            ? detailedAd.images.map((img: any) => img.image)
            : ad.primary_image?.image
              ? [ad.primary_image.image]
              : [];

        // The hook will handle updating the modal with enhanced data
      }
    } catch (error) {
      console.error("Error fetching ad details:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto my-4 px-4">
        <div className="flex gap-2 md:gap-4 lg:gap-6">
          {/* Left Sidebar with Ads */}
          <div className="md:w-48 xl:w-72 lg:w-64 hidden md:block flex-shrink-0">
            <div className="sticky top-24 space-y-4 z-10">
              <div className="block">
                <SidebarBanner
                  categoryId={selectedCategory !== "all" ? undefined : undefined}
                  cityId={selectedCity !== "all" ? undefined : undefined}
                />
              </div>
              <FlippingAd size="medium" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header Banner */}
            <div className="bg-white">
              <div>
                <HeaderBanner
                  categoryId={selectedCategory !== "all" ? undefined : undefined}
                  cityId={selectedCity !== "all" ? undefined : undefined}
                />
              </div>
            </div>

            <PageHeader title="FeaturedAds" description="Discover Featured Ads" />

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4">
              {/* Search Bar */}
              <div className="mb-3">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search featured ads..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    aria-label="Search featured ads"
                  />
                </div>
              </div>

              {/* Filter Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Category Filter */}
                <div>
                  <label
                    htmlFor="category-filter"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Category
                  </label>
                  <select
                    id="category-filter"
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    aria-label="Filter by category"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === "all" ? "All Categories" : cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <label
                    htmlFor="city-filter"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    City
                  </label>
                  <select
                    id="city-filter"
                    value={selectedCity}
                    onChange={e => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    aria-label="Filter by city"
                  >
                    {cities.map(city => (
                      <option key={city} value={city}>
                        {city === "all" ? "All Cities" : city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Filter */}
                <div>
                  <label
                    htmlFor="sort-filter"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Sort By
                  </label>
                  <select
                    id="sort-filter"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    aria-label="Sort listings"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="alphabetical">Alphabetical</option>
                    <option value="views">Most Viewed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4" role="alert">
                <p className="text-red-800 font-medium mb-2">Unable to load featured ads</p>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <button
                  onClick={refetch}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  aria-label="Retry loading featured ads"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12" role="status">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-4">Loading featured ads...</p>
              </div>
            )}

            {/* Listings Grid */}
            {!loading && !error && (
              <div>
                {filteredListings.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="text-center">
                      <div className="text-gray-400 mb-4">
                        <Star className="h-16 w-16 mx-auto" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No featured ads found
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Try adjusting your filters to see more results.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCategory("all");
                          setSelectedCity("all");
                          setSortBy("newest");
                        }}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Grid with Banner Injection */}
                    {(() => {
                      // Determine banner interval: 6 if >= 6 ads, 3 if >= 3 ads, all ads if < 3
                      const totalAds = filteredListings.length;
                      const bannerInterval = totalAds >= 6 ? 6 : totalAds >= 3 ? 3 : totalAds;

                      return Array.from({
                        length: Math.ceil(filteredListings.length / bannerInterval),
                      }).map((_, chunkIndex) => {
                        const startIndex = chunkIndex * bannerInterval;
                        const endIndex = Math.min(
                          startIndex + bannerInterval,
                          filteredListings.length
                        );
                        const chunkAds = filteredListings.slice(startIndex, endIndex);

                        return (
                          <React.Fragment key={chunkIndex}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                              {chunkAds.map(ad => (
                                <AdCard
                                  key={ad.id}
                                  ad={ad}
                                  user={user}
                                  onClick={() => handleAdClick(ad)}
                                  showFeaturedBadge={true}
                                />
                              ))}
                            </div>

                            {/* Inject Banner Between Chunks */}
                            {endIndex < filteredListings.length && (
                              <div className="w-full mb-6">
                                <BetweenAdsBanner
                                  categoryId={selectedCategory !== "all" ? undefined : undefined}
                                  cityId={selectedCity !== "all" ? undefined : undefined}
                                />
                              </div>
                            )}
                          </React.Fragment>
                        );
                      });
                    })()}
                  </>
                )}
              </div>
            )}

            {/* Bottom Banner Ad */}
            <div className="md:block hidden">
              <FooterBanner
                categoryId={selectedCategory !== "all" ? undefined : undefined}
                cityId={selectedCity !== "all" ? undefined : undefined}
              />
            </div>
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

      {/* Listing Modal */}
      <ListingModal
        listing={selectedListing}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isLoggedIn={isAuthenticated}
      />

      {/* Bottom Banner Ad */}
      <div className="md:hidden mx-4 mb-4">
        <FooterBanner
          categoryId={selectedCategory !== "all" ? undefined : undefined}
          cityId={selectedCity !== "all" ? undefined : undefined}
        />
      </div>
    </div>
  );
};

export default FeaturedAdsPage;
