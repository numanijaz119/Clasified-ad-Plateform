// src/pages/CategoryPage.tsx
import React, { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Eye, Clock, Star, Search } from "lucide-react";
import {
  MobileBanner,
  FlippingAd,
  SideBanner,
  InlineBanner,
  BottomBanner,
  RecentListings,
} from "../components/AdBanners";
import ListingModal from "../components/ListingModal";
import { useAds } from "../hooks/useAds";
import { useCities } from "../hooks/useCities";
import { useCategoryBySlug } from "../hooks/";
import { adsService } from "../services";
import { useAuth } from "../contexts/AuthContext";
import {
  AdDetailBanner,
  CategoryPageBanner,
  HeaderBanner,
  SidebarBanner,
} from "../components/common/BannerLayouts";

interface Listing {
  id: number;
  title: string;
  category: string;
  price: string;
  location: string;
  image: string;
  views: number;
  timeAgo: string;
  postedDate: Date;
  featured: boolean;
  description: string;
  phone?: string;
  email?: string;
  images?: string[];
}

const CategoryPage: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch cities dynamically
  const { cities: citiesData, loading: citiesLoading } = useCities();

  // Get category by slug to get the ID
  const { category } = useCategoryBySlug(categoryName);

  // Fetch ads based on filters using category ID
  const { ads, loading, error, refetch } = useAds({
    category: category?.id,
    city: selectedCity !== "all" ? parseInt(selectedCity) : undefined,
    search: searchQuery || undefined,
    sort_by: sortBy as any,
  });

  // Refetch when filters change
  useEffect(() => {
    if (!category?.id) return;

    refetch({
      category: category.id,
      city: selectedCity !== "all" ? parseInt(selectedCity) : undefined,
      search: searchQuery || undefined,
      sort_by: sortBy as any,
    });
  }, [category?.id, selectedCity, searchQuery, sortBy]);

  // Build cities array for dropdown
  const cities = useMemo(() => {
    return ["all", ...citiesData.map((city) => city.name)];
  }, [citiesData]);

  // Transform backend ads to Listing interface
  const mockListings: Listing[] = useMemo(() => {
    return ads.map((ad) => ({
      id: ad.id,
      title: ad.title,
      category: ad.category.name,
      price: ad.display_price,
      location: `${ad.city.name}, ${ad.state.code}`,
      image: ad.primary_image?.image || "/placeholder.svg",
      views: ad.view_count,
      timeAgo: ad.time_since_posted,
      postedDate: new Date(ad.created_at),
      featured: ad.plan === "featured",
      description: ad.description,
      phone: "",
      email: "",
    }));
  }, [ads]);

  const filteredListings = useMemo(() => {
    return mockListings;
  }, [mockListings]);

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      Jobs: "💼",
      "Real Estate": "🏠",
      Vehicles: "🚗",
      "Buy & Sell": "🛍️",
      Services: "🔧",
      Education: "🎓",
      "Community Events": "📅",
      "Health & Wellness": "❤️",
      Matrimonial: "💑",
      "Food & Dining": "🍽️",
      Entertainment: "🎮",
    };
    return icons[category] || "📋";
  };

  const handleListingClick = async (listing: Listing) => {
    try {
      // Open modal immediately with basic data
      setSelectedListing(listing);
      setIsModalOpen(true);

      // Find the original ad data to get the slug
      const originalAd = ads.find((ad) => ad.id === listing.id);
      if (!originalAd?.slug) return;

      // Fetch detailed ad data
      const detailedAd = (await adsService.getAd(originalAd.slug)) as any;

      // Get all images from detailed response
      const images =
        detailedAd.images?.length > 0
          ? detailedAd.images.map((img: any) => img.image)
          : [listing.image];

      // Update modal with enhanced data
      const enhancedListing: Listing = {
        ...listing,
        images,
        description: detailedAd.description || listing.description,
        phone: detailedAd.hide_phone ? undefined : detailedAd.contact_phone,
        email: detailedAd.contact_email_display,
      };

      setSelectedListing(enhancedListing);
    } catch (error) {
      console.error("Error fetching ad details:", error);
      // Modal already shows basic data, so user still sees something
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Ad Banner */}
      <div className=" bg-white border-b border-gray-200">
        <div className="px-4 py-2">
          {/* <MobileBanner /> */}
          <HeaderBanner />
        </div>
      </div>

      {/* Mobile FlippingAd */}
      {/* <div className=" md:hidden m-4 mb-0">
        <FlippingAd size="medium" />
      </div> */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-2 md:gap-4 lg:gap-6">
          {/* Left Sidebar with Ads */}
          <div className="md:w-48 hidden md:block  xl:w-72 lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-4 z-10">
              <div className="block">
                {/* <SideBanner /> */}
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
                  <span className="font-medium">Back</span>
                </Link>
              </div>

              <div className="flex items-center mb-1">
                <span className="text-3xl mr-3">
                  {getCategoryIcon(categoryName || "")}
                </span>
                <h1 className="text-xl font-bold text-gray-900">
                  {categoryName} Listings
                </h1>
              </div>
              <p className="text-sm text-gray-600">
                {loading
                  ? "Loading..."
                  : `${filteredListings.length} listings found`}{" "}
                • Sorted by date posted
              </p>
              {selectedCity !== "all" && (
                <p className="text-sm text-orange-600">
                  Filtered by:{" "}
                  {cities.find((c) => c === selectedCity) || selectedCity}
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
                    placeholder="Search listings..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                  />
                </div>
              </div>

              {/* Filter Dropdowns - Single Line */}
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={categoryName || "Jobs"}
                    disabled
                    className="px-3 py-1.5 border border-gray-300 rounded-md bg-gray-100 text-gray-600 text-sm"
                  >
                    <option value={categoryName}>{categoryName}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                    disabled={citiesLoading}
                  >
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city === "all" ? "All Cities" : city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                </div>

                <div>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCity("all");
                      setSortBy("newest");
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Listings List - Single Line Titles */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-h-[80vh] overflow-y-auto">
              <div className="divide-y divide-gray-200">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    <p className="mt-2 text-sm text-gray-600">
                      Loading listings...
                    </p>
                  </div>
                ) : (
                  filteredListings.map((listing, index) => (
                    <div key={listing.id}>
                      <div
                        className="p-3 hover:bg-gray-50 cursor-pointer transition-colors group"
                        onClick={() => handleListingClick(listing)}
                      >
                        <div className="flex flex-col lg:flex-row items-start gap-y-2 lg:gap-y-0 lg:items-center lg:justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                              {listing.featured && (
                                <Star className="h-4 w-4 text-orange-500 fill-current flex-shrink-0" />
                              )}
                              <h3 className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                                {listing.title}
                              </h3>
                            </div>
                          </div>
                          <div className="flex self-end lg:self-auto items-center space-x-4 text-xs text-gray-500 ml-4">
                            <span className="font-semibold text-orange-600">
                              {listing.price}
                            </span>
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {listing.location}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Eye className="h-3 w-3" />
                              <span>{listing.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{listing.timeAgo}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Inline Ad every 5 listings */}
                      {(index + 1) % 5 === 0 &&
                        index < filteredListings.length - 1 && (
                          <div className="p-2 bg-gray-50 border-t border-b border-gray-200">
                            {/* <InlineBanner /> */}
                            <CategoryPageBanner />
                          </div>
                        )}
                    </div>
                  ))
                )}
              </div>

              {/* No Results */}
              {!loading && filteredListings.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <span className="text-3xl">
                      {getCategoryIcon(categoryName || "")}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    No listings found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your filters to see more results.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar with Ads */}
          <div className="md:w-48 xl:w-72 lg:w-64 hidden md:block flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* <FlippingAd size="medium" />
              <FlippingAd size="small" /> */}
              <RecentListings />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom FlippingAd */}
      <div className="md:hidden m-4 mt-0">
        {/* <FlippingAd size="medium" /> */}
        <RecentListings />
      </div>

      {/* Bottom FlippingAd */}
      <div className="md:hidden m-4 mt-0">
        <FlippingAd size="medium" />
      </div>

      {/* Bottom Banner Ad */}
      <div className="mx-4">
        {/* <BottomBanner /> */}
        <AdDetailBanner />
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

export default CategoryPage;
