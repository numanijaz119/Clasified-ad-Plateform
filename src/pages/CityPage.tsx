// src/pages/CityPage.tsx
import React, { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  Clock,
  Star,
  MapPin,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  MobileBanner,
  FlippingAd,
  SideBanner,
  InlineBanner,
  BottomBanner,
} from "../components/AdBanners";
import ListingModal from "../components/ListingModal";
import { useAds } from "../hooks/useAds";
import { useCategories } from "../hooks/useCategories";
import { useCities } from "../hooks/useCities";

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
}

const CityPage: React.FC = () => {
  const { cityName } = useParams<{ cityName: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch cities to get the city ID
  const { cities: citiesData } = useCities();

  // Find current city by name
  const currentCity = useMemo(() => {
    if (!citiesData || !cityName) return null;
    return citiesData.find(
      (c) => c.name.toLowerCase() === cityName.toLowerCase().replace(/-/g, " ")
    );
  }, [citiesData, cityName]);

  // Fetch categories for dropdown
  const { categories: categoriesData } = useCategories(true);

  // Fetch ads filtered by city with pagination
  const { ads, loading, error, totalCount, hasNext, hasPrevious, refetch } =
    useAds({
      city: currentCity?.id,
      category:
        selectedCategory !== "all" ? parseInt(selectedCategory) : undefined,
      search: searchQuery || undefined,
      sort_by: sortBy as any,
      page: currentPage,
    });

  // Transform backend ads to Listing format
  const mockListings: Listing[] = useMemo(() => {
    return ads.map((ad) => ({
      id: ad.id,
      title: ad.title,
      category: ad.category.name,
      price: ad.display_price,
      location: `${ad.city.name}, ${ad.state.code}`,
      image:
        ad.primary_image?.image ||
        "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: ad.view_count,
      timeAgo: ad.time_since_posted,
      postedDate: new Date(ad.created_at),
      featured: ad.plan === "featured",
      description: ad.description,
      phone: "",
      email: "",
    }));
  }, [ads]);

  // Build categories array for dropdown
  const categories = useMemo(() => {
    return ["all", ...categoriesData.map((cat) => cat.name)];
  }, [categoriesData]);

  // Refetch when filters or page change
  useEffect(() => {
    if (!currentCity?.id) return;

    refetch({
      city: currentCity.id,
      category:
        selectedCategory !== "all" ? parseInt(selectedCategory) : undefined,
      search: searchQuery || undefined,
      sort_by: sortBy as any,
      page: currentPage,
    });
  }, [currentCity?.id, selectedCategory, searchQuery, sortBy, currentPage]);

  const filteredListings = useMemo(() => {
    // Backend already filters, so we just use the results
    return mockListings;
  }, [mockListings]);

  const handleListingClick = (listing: Listing) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
  };

  const handlePreviousPage = () => {
    if (hasPrevious && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNext) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / 20); // 20 is default page size

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Ad Banner */}
      <div className=" bg-white border-b border-gray-200">
        <div className="px-4 py-2">
          <MobileBanner />
        </div>
      </div>

      {/* Mobile Ad */}
      <div className="md:hidden m-4 mb-0">
        <FlippingAd size="medium" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-2 md:gap-4 lg:gap-6">
          {/* Left Sidebar with Ads */}
          <div className=" md:w-48   xl:w-72 lg:w-64 hidden md:block flex-shrink-0">
            <div className="sticky top-24 space-y-4 z-10">
              <SideBanner />
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
                <MapPin className="h-5 w-5 text-orange-500 mr-2" />
                <h1 className="text-xl font-bold text-gray-900">
                  Listings in {cityName}
                </h1>
              </div>
              <p className="text-sm text-gray-600">
                {totalCount} listings found • Sorted by date posted
              </p>
              {selectedCategory !== "all" && (
                <p className="text-sm text-orange-600">
                  Filtered by category: {selectedCategory}
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
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // Reset to first page on search
                    }}
                    placeholder="Search listings..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                  />
                </div>
              </div>

              {/* Filter Dropdowns - Single Line */}
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <select
                    value={cityName || "Chicago"}
                    disabled
                    className="px-3 py-1.5 border border-gray-300 rounded-md bg-gray-100 text-gray-600 text-sm"
                  >
                    <option value={cityName}>{cityName}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setCurrentPage(1); // Reset to first page on category change
                    }}
                    className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
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
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1); // Reset to first page on sort change
                    }}
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
                      setSelectedCategory("all");
                      setSortBy("newest");
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Listings List - Single Line Titles */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-h-[75vh] overflow-y-auto">
              <div className="divide-y divide-gray-200">
                {filteredListings.map((listing, index) => (
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
                            <h3 className="text-sm line-clamp-1 font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                              {listing.title}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center self-end lg:self-auto space-x-4 text-xs text-gray-500 ml-4">
                          <span className="font-semibold text-orange-600">
                            {listing.price}
                          </span>
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {listing.category}
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
                          <InlineBanner />
                        </div>
                      )}
                  </div>
                ))}
              </div>

              {/* No Results */}
              {filteredListings.length === 0 && !loading && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <MapPin className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    No listings found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your filters to see more results.
                  </p>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading...</p>
                </div>
              )}
            </div>

            {/* Pagination - Only show if there are multiple pages */}
            {totalPages > 1 && !loading && (
              <div className="mt-4 flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} • {totalCount} total
                  listings
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={!hasPrevious || currentPage === 1}
                    className={`px-3 py-1.5 text-sm border border-gray-300 rounded-md flex items-center space-x-1 transition-colors ${
                      hasPrevious && currentPage > 1
                        ? "hover:bg-gray-50 text-gray-700"
                        : "text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>
                  <button
                    onClick={handleNextPage}
                    disabled={!hasNext}
                    className={`px-3 py-1.5 text-sm border border-gray-300 rounded-md flex items-center space-x-1 transition-colors ${
                      hasNext
                        ? "hover:bg-gray-50 text-gray-700"
                        : "text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar with Ads */}
          <div className="md:w-48  hidden md:block  xl:w-72 lg:w-60 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              <FlippingAd size="medium" />
            </div>
          </div>
        </div>
      </main>

      <div className="md:hidden m-4 mt-0">
        <FlippingAd size="medium" />
      </div>

      {/* Bottom Banner Ad */}
      <div className="mx-4">
        <BottomBanner />
      </div>

      {/* Listing Modal */}
      <ListingModal
        listing={selectedListing}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default CityPage;
