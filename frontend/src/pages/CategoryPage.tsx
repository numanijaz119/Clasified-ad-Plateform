// src/pages/CategoryPage.tsx
import React, { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Search, MapPin } from "lucide-react";
import { FlippingAd, RecentListings } from "../components/AdBanners";
import ListingModal from "../components/ListingModal";
import AdCard from "../components/AdCard";
import { useAds } from "../hooks/useAds";
import { useCities } from "../hooks/useCities";
import { useCategoryBySlug } from "../hooks/";
import { adsService } from "../services";
import { useAuth } from "../contexts/AuthContext";
import {
  CategoryPageBanner,
  FooterBanner,
  HeaderBanner,
  BetweenAdsBanner,
  SidebarBanner,
} from "../components/common/BannerLayouts";
import PageHeader from "../components/PageHeader";

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
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

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
    return ["all", ...citiesData.map(city => city.name)];
  }, [citiesData]);

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

  const handleListingClick = async (ad: any) => {
    try {
      // Transform ad data to Listing format
      const listing: Listing = {
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
      };

      // Open modal immediately with basic data
      setSelectedListing(listing);
      setIsModalOpen(true);

      // Fetch detailed ad data
      const detailedAd = (await adsService.getAd(ad.slug)) as any;

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
        phone: detailedAd.hide_phone ? "" : detailedAd.contact_phone || "",
        email: detailedAd.contact_email_display || "",
      };

      setSelectedListing(enhancedListing);
    } catch (error) {
      console.error("Error fetching ad details:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto my-4 px-4">
        <div className="flex gap-2 md:gap-4 lg:gap-6">
          {/* Left Sidebar with Ads */}
          <div className="md:w-48 xl:w-72 lg:w-64 hidden md:block flex-shrink-0">
            <div className="sticky top-24 space-y-4 z-10">
              <div className="block">
                <SidebarBanner categoryId={category?.id} />
              </div>
              <FlippingAd size="medium" />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Results Summary */}
            {/* <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600" role="status">
                {selectedCity !== "all" && (
                  <span className="text-orange-600 ml-2">
                    • Filtered by: {cities.find(c => c === selectedCity) || selectedCity}
                  </span>
                )}
              </p>
            </div> */}

            {/* Header Banner (Desktop) */}
            <div className=" mx-2">
              <HeaderBanner categoryId={category?.id} />
            </div>

            <PageHeader title="Category" description="Browse listings in this category" />

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
                    placeholder="Search listings..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                    aria-label="Search listings"
                  />
                </div>
              </div>

              {/* Filter Dropdowns */}
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label
                    htmlFor="category-filter"
                    className="block text-xs font-medium text-gray-700 mb-1"
                  >
                    Category
                  </label>
                  <select
                    id="category-filter"
                    value={categoryName || ""}
                    disabled
                    className="px-3 py-1.5 border border-gray-300 rounded-md bg-gray-100 text-gray-600 text-sm"
                    aria-label="Category filter (disabled)"
                  >
                    <option value={categoryName}>{category?.name || categoryName}</option>
                  </select>
                </div>

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
                    className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                    disabled={citiesLoading}
                    aria-label="Filter by city"
                  >
                    {cities.map(city => (
                      <option key={city} value={city}>
                        {city === "all" ? "All Cities" : city}
                      </option>
                    ))}
                  </select>
                </div>

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
                    className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                    aria-label="Sort listings"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="most_viewed">Most Viewed</option>
                  </select>
                </div>
              </div>
            </div>
            <p className="mb-2">{loading ? "Loading..." : `${ads.length} listings found`}</p>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4" role="alert">
                <p className="text-red-800 text-sm font-medium">Error loading listings</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <button
                  onClick={() => refetch()}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Listings Grid */}
            {!error && (
              <div>
                {loading ? (
                  <div className="text-center py-12" role="status">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-4">Loading listings...</p>
                  </div>
                ) : ads.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your filters to see more results.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCity("all");
                        setSortBy("newest");
                      }}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Ads Grid with Banner Injection */}
                    {(() => {
                      // Determine banner interval: 6 if >= 6 ads, 3 if >= 3 ads, all ads if < 3
                      const totalAds = ads.length;
                      const bannerInterval = totalAds >= 6 ? 6 : totalAds >= 3 ? 3 : totalAds;

                      return Array.from({
                        length: Math.ceil(ads.length / bannerInterval),
                      }).map((_, chunkIndex) => {
                        const startIndex = chunkIndex * bannerInterval;
                        const endIndex = Math.min(startIndex + bannerInterval, ads.length);
                        const chunkAds = ads.slice(startIndex, endIndex);

                        return (
                          <React.Fragment key={chunkIndex}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                              {chunkAds.map(ad => (
                                <AdCard
                                  key={ad.id}
                                  ad={ad}
                                  user={user}
                                  onClick={() => handleListingClick(ad)}
                                  showFeaturedBadge={true}
                                />
                              ))}
                            </div>

                            {/* Inject Banner Between Chunks */}
                            {endIndex < ads.length && (
                              <div className="mb-6">
                                <BetweenAdsBanner categoryId={category?.id} />
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

            {/* Category Page Banner */}
            <div className="mb-4 hidden md:block">
              <CategoryPageBanner categoryId={category?.id} />
            </div>

            {/* Footer Banner */}
            <div className="hidden md:block">
              <FooterBanner categoryId={category?.id} />
            </div>
          </div>

          {/* Right Sidebar (Desktop) */}
          <aside
            className="hidden md:block md:w-48 xl:w-72 lg:w-60 flex-shrink-0"
            aria-label="Sidebar"
          >
            <div className="sticky top-24 space-y-4">
              <RecentListings />
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile Recent Listings */}
      <div className="md:hidden mx-4 mb-4">
        <RecentListings />
      </div>

      {/* Mobile Flipping Ad */}
      <div className="md:hidden m-4 mt-0">
        <FlippingAd size="medium" />
      </div>

      {/* Listing Modal */}
      <ListingModal
        listing={selectedListing}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isLoggedIn={isAuthenticated}
      />

      {/* Category Page Banner */}
      <div className="mb-4 mx-4 block md:hidden">
        <CategoryPageBanner categoryId={category?.id} />
      </div>

      {/* Footer Banner */}
      <div className="block mx-4 mb-4 md:hidden">
        <FooterBanner categoryId={category?.id} />
      </div>
    </div>
  );
};

export default CategoryPage;
