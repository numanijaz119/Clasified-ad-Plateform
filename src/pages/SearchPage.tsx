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
} from "lucide-react";
import {
  MobileBanner,
  FlippingAd,
  SideBanner,
  InlineBanner,
  BottomBanner,
} from "../components/AdBanners";
import ListingModal from "../components/ListingModal";
import { adsService } from "../services";
import { useCategories } from "../hooks/useCategories";
import { useCities } from "../hooks/useCities";

// API response interface
interface Listing {
  id: number;
  slug: string;
  title: string;
  description: string;
  display_price: string;
  price_type: "fixed" | "negotiable" | "contact";
  condition: string;
  category: {
    id: number;
    name: string;
    icon: string;
  };
  city: {
    id: number;
    name: string;
    photo_url?: string;
  };
  state: {
    id: number;
    name: string;
    code: string;
  };
  plan: "free" | "featured";
  view_count: number;
  primary_image?: string | null;
  time_since_posted: string;
  is_featured_active: boolean;
  created_at: string;
}

// Modal interface (what ListingModal expects)
interface ModalListing {
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

interface SearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  total_pages: number;
  current_page: number;
  results: Listing[];
  state_context: {
    code: string;
    name: string;
    domain: string;
    meta_title: string;
    meta_description: string;
  };
}

const SearchPage: React.FC = () => {
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
  const [showFilters, setShowFilters] = useState(false);
  const [selectedListing, setSelectedListing] = useState<ModalListing | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // API state
  const [listings, setListings] = useState<Listing[]>([]);
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
        params.category = selectedCategory;
      }

      if (selectedCity !== "all") {
        params.city = selectedCity;
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
        setListings(response.results);
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

  const handleListingClick = (listing: Listing) => {
    // Transform API listing to match modal interface
    const modalListing: ModalListing = {
      id: listing.id,
      title: listing.title,
      category: listing.category.name,
      price: listing.display_price,
      location: `${listing.city.name}, ${listing.state.code}`,
      image:
        listing.primary_image ||
        "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: listing.view_count,
      timeAgo: listing.time_since_posted,
      postedDate: new Date(listing.created_at),
      featured: listing.is_featured_active,
      description: listing.description,
      // Add any additional fields if available
      phone: undefined, // API doesn't provide contact info in search results
      email: undefined,
    };

    setSelectedListing(modalListing);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Ad Banner */}
      <div className=" bg-white border-b border-gray-200">
        <div className="px-4 py-2">
          <MobileBanner />
        </div>
      </div>

      {/* Tablet Ad Banner */}
      {/* <div className="hidden md:block lg:hidden bg-white border-b border-gray-200">
        <div className="px-4 py-2">
          <FlippingAd size="medium" />
        </div>
      </div> */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-2 md:gap-4 lg:gap-6">
          {/* Left Sidebar with Ads */}
          <div className=" md:w-48   xl:w-72 lg:w-64 hidden md:block flex-shrink-0">
            <div className="sticky top-24 space-y-4 z-10">
              <div className="block lg:hidden">
                {/* <FlippingAd size="small" /> */}
              </div>
              <div className="hidden lg:block">
                <SideBanner />
              </div>
              <FlippingAd size="medium" />
              {/* <div className="hidden md:block">
                <FlippingAd size="small" />
              </div> */}
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
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 text-sm"
                    disabled={categoriesLoading}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
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
                      <option key={city.id} value={city.id}>
                        {city.name}
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
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </select>
                </div>

                <div>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
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

            {/* Listings List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-h-[80vh] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                  <span className="ml-2 text-gray-600">
                    Loading search results...
                  </span>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-red-400 mb-4">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    Error loading results
                  </h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={fetchAds}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
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
                              {listing.is_featured_active && (
                                <Star className="h-4 w-4 text-orange-500 fill-current flex-shrink-0" />
                              )}
                              <h3 className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                                {listing.title}
                              </h3>
                            </div>
                          </div>
                          <div className="flex items-center self-end lg:self-auto space-x-4 text-xs text-gray-500 ml-4">
                            <span className="font-semibold text-orange-600">
                              {listing.display_price}
                            </span>
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {listing.category.name}
                            </span>
                            <span className="bg-blue-100 px-2 py-1 rounded text-xs">
                              {listing.city.name}, {listing.state.code}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Eye className="h-3 w-3" />
                              <span>{listing.view_count}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{listing.time_since_posted}</span>
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
              )}

              {/* No Results - only show when not loading and no error */}
              {!loading && !error && filteredListings.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-600">
                    {searchQuery ? (
                      <>
                        No listings found for "<strong>{searchQuery}</strong>".
                        Try different keywords or adjust your filters.
                      </>
                    ) : (
                      "Try adjusting your filters to see more results."
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-700">
                  <span>
                    Showing page {currentPage} of {totalPages} ({totalCount}{" "}
                    total results)
                  </span>
                </div>

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

                  {/* Page numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            currentPage === pageNum
                              ? "bg-orange-500 text-white"
                              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
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

          {/* Right Sidebar with Ads */}
          <div className="md:w-48  hidden md:block  xl:w-72 lg:w-60 flex-shrink-0">
            <div className="sticky top-24 space-y-4 z-10">
              <FlippingAd size="medium" />
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

export default SearchPage;
