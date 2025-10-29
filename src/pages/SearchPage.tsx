// src/pages/SearchPage.tsx
// UPDATED: Added blue border for user's own ads - PART 1 of 2

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  Clock,
  Star,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
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
import { adsService } from "../services";
import { useCategories } from "../hooks/useCategories";
import { useCities } from "../hooks/useCities";
import { useListingModal } from "../hooks/useListingModal";
import { useAuth } from "../contexts/AuthContext";
import type { BasicAd } from "../hooks/useAdDetails";
import {
  AdDetailBanner,
  BetweenAdsBanner,
  FooterBanner,
  HeaderBanner,
  SidebarBanner,
} from "../components/common/BannerLayouts";
import Badge from "../components/ui/Badge";

const SearchPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth(); // Added user to check ownership
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearchQuery =
    searchParams.get("search") || searchParams.get("q") || "";
  const categoryFilter = searchParams.get("category") || "all";
  const cityFilter = searchParams.get("city") || "all";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter);
  const [selectedCity, setSelectedCity] = useState(cityFilter);
  const [sortBy, setSortBy] = useState("newest");
  
  // Use the reusable listing modal hook
  const { selectedListing, isModalOpen, handleListingClick, handleCloseModal } =
    useListingModal();

  // API state
  const [listings, setListings] = useState<BasicAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(pageParam);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Get categories and cities from hooks
  const { categories: categoriesData, loading: categoriesLoading } =
    useCategories();
  const { cities: citiesData, loading: citiesLoading } = useCities();

  // Prepare categories and cities for dropdowns
  const categories = useMemo(() => {
    const cats = [{ id: "all", name: "All Categories" }];
    if (categoriesData) {
      cats.push(
        ...categoriesData.map((cat) => ({
          id: cat.id.toString(),
          name: cat.name,
        }))
      );
    }
    return cats;
  }, [categoriesData]);

  const cities = useMemo(() => {
    const cityList = [{ id: "all", name: "All Cities" }];
    if (citiesData) {
      cityList.push(
        ...citiesData.map((city) => ({
          id: city.id.toString(),
          name: city.name,
        }))
      );
    }
    return cityList;
  }, [citiesData]);

  // Fetch ads from API
  const fetchAds = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        page_size: 20,
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

       if (selectedCategory !== "all") {
        const categoryId = parseInt(selectedCategory, 10);
        if (!isNaN(categoryId)) {
          params.category = categoryId;
        }
      }

      if (selectedCity !== "all") {
        const cityId = parseInt(selectedCity, 10);
        if (!isNaN(cityId)) {
          params.city = cityId;
        }
      }
  

      // Map sort options to API format
      const sortMapping: Record<string, string> = {
        newest: "newest",
        oldest: "oldest",
        alphabetical: "alphabetical",
        price_low: "price_low",
        price_high: "price_high",
      };

      if (sortBy && sortMapping[sortBy]) {
        params.sort_by = sortMapping[sortBy];
      }

      const response = await adsService.getAds(params);

      if (response && response.results) {
        setListings(response.results as unknown as BasicAd[]);
        setTotalCount(response.count || 0);
        setTotalPages(response.total_pages || 1);
        setHasNext(!!response.next);
        setHasPrevious(!!response.previous);
      } else {
        setListings([]);
        setTotalCount(0);
        setTotalPages(1);
        setHasNext(false);
        setHasPrevious(false);
      }
    } catch (err) {
      console.error("Error fetching ads:", err);
      setError("Failed to load search results. Please try again.");
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect for search query
  useEffect(() => {
    const timeoutId = setTimeout(
      () => {
        fetchAds();
      },
      searchQuery ? 500 : 0
    ); // 500ms delay for search, immediate for other filters

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Immediate fetch for filters and sorting
  useEffect(() => {
    fetchAds();
  }, [selectedCategory, selectedCity, sortBy, currentPage]);

  // Since filtering is now done on the server, we just use the listings directly
  const filteredListings = listings;

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);

    // Update URL parameters
    const params = new URLSearchParams(searchParams);
    if (newPage > 1) {
      params.set("page", newPage.toString());
    } else {
      params.delete("page");
    }
    setSearchParams(params);

    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePreviousPage = () => {
    if (hasPrevious && currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNext && currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };
 return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Ad Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-2">
          <HeaderBanner />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-2 md:gap-4 lg:gap-6">
          {/* Left Sidebar with Ads */}
          <div className="md:w-48 xl:w-72 lg:w-64 hidden md:block flex-shrink-0">
            <div className="sticky top-24 space-y-4 z-10">
              <div className="block lg:hidden">
                {/* <FlippingAd size="small" /> */}
              </div>
              <div className="hidden lg:block">
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
                <Search className="h-5 w-5 text-orange-500 mr-2" />
                <h1 className="text-xl font-bold text-gray-900">
                  Search Results
                </h1>
              </div>
              <p className="text-sm text-gray-600">
                {searchQuery && (
                  <span>
                    Showing results for "<strong>{searchQuery}</strong>" •{" "}
                  </span>
                )}
                {filteredListings.length} listings found
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
                    placeholder="Search listings..."
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
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
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
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  >
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
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
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Listings Grid */}
            {!loading && !error && filteredListings.length > 0 && (
              <div>
                {/* Ads Grid with Banners */}
                {Array.from({
                  length: Math.ceil(filteredListings.length / 6),
                }).map((_, chunkIndex) => {
                  const startIndex = chunkIndex * 6;
                  const endIndex = Math.min(startIndex + 6, filteredListings.length);
                  const chunkListings = filteredListings.slice(startIndex, endIndex);

                  return (
                    <React.Fragment key={chunkIndex}>
                      {/* Grid of 6 ads */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {chunkListings.map((ad) => {
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
                                {ad.is_featured_active && (
                                  <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                                    <Star className="h-3 w-3 fill-current" />
                                    <span>Featured</span>
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="p-4">
                                {/* Category Badge */}
                                <Badge variant="secondary" className="mb-2 text-xs">
                                  {ad.category.name}
                                </Badge>

                                {/* Title */}
                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                                  {ad.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                  {ad.description}
                                </p>

                                {/* Price */}
                                <div className="text-orange-600 font-bold text-lg mb-3">
                                  {ad.display_price || "Contact for price"}
                                </div>

                                {/* Location */}
                                <div className="flex items-center text-gray-600 mb-3">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  <span className="text-sm truncate">
                                    {ad.city.name}, {ad.state.code}
                                  </span>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                                  <div className="flex items-center space-x-1">
                                    <Eye className="h-3 w-3" />
                                    <span>{ad.view_count} views</span>
                                  </div>
                                  {ad.time_since_posted && (
                                    <div className="flex items-center space-x-1">
                                      <Clock className="h-3 w-3" />
                                      <span>{ad.time_since_posted}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Inline Banner after every 6 ads (except the last chunk) */}
                      {endIndex < filteredListings.length && (
                        <div className="w-full mb-8">
                          <BetweenAdsBanner />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handlePreviousPage}
                        disabled={!hasPrevious}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          hasPrevious
                            ? "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                            : "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
                        }`}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </button>

                      <div className="hidden sm:flex space-x-1">
                        {getPageNumbers().map((pageNum, index) =>
                          pageNum === "..." ? (
                            <span
                              key={`ellipsis-${index}`}
                              className="px-3 py-2 text-gray-500"
                            >
                              ...
                            </span>
                          ) : (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum as number)}
                              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                currentPage === pageNum
                                  ? "bg-orange-500 text-white"
                                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        )}
                      </div>

                      <button
                        onClick={handleNextPage}
                        disabled={!hasNext}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          hasNext
                            ? "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                            : "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
                        }`}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No Results */}
            {!loading && !error && filteredListings.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search or filters
                  </p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading results...</p>
              </div>
            )}
          </div>

          {/* Right Sidebar with Ads */}
          <div className="md:w-48 hidden md:block xl:w-72 lg:w-60 flex-shrink-0">
            <div className="sticky top-24 space-y-4 z-10">
              <RecentListings />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom FlippingAd */}
      <div className="md:hidden m-4 mt-0">
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

export default SearchPage;




