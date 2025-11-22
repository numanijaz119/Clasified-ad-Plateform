// src/pages/SearchPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { FlippingAd, RecentListings } from "../components/AdBanners";
import ListingModal from "../components/ListingModal";
import AdCard from "../components/AdCard";
import { adsService } from "../services";
import { useCategories } from "../hooks/useCategories";
import { useCities } from "../hooks/useCities";
import { useListingModal } from "../hooks/useListingModal";
import { useAuth } from "../contexts/AuthContext";
import type { BasicAd } from "../hooks/useAdDetails";
import {
  BetweenAdsBanner,
  FooterBanner,
  HeaderBanner,
  SidebarBanner,
} from "../components/common/BannerLayouts";

const SearchPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearchQuery = searchParams.get("search") || searchParams.get("q") || "";
  const categoryFilter = searchParams.get("category") || "all";
  const cityFilter = searchParams.get("city") || "all";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter);
  const [selectedCity, setSelectedCity] = useState(cityFilter);
  const [sortBy, setSortBy] = useState("newest");

  const { selectedListing, isModalOpen, handleListingClick, handleCloseModal } = useListingModal();

  const [listings, setListings] = useState<BasicAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(pageParam);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const { categories: categoriesData, loading: categoriesLoading } = useCategories();
  const { cities: citiesData, loading: citiesLoading } = useCities();

  const categories = useMemo(() => {
    const cats = [{ id: "all", name: "All Categories" }];
    if (categoriesData) {
      cats.push(
        ...categoriesData.map(cat => ({
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
        ...citiesData.map(city => ({
          id: city.id.toString(),
          name: city.name,
        }))
      );
    }
    return cityList;
  }, [citiesData]);

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

  useEffect(() => {
    const timeoutId = setTimeout(
      () => {
        fetchAds();
      },
      searchQuery ? 500 : 0
    );

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    fetchAds();
  }, [selectedCategory, selectedCity, sortBy, currentPage]);

  const filteredListings = listings;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);

    const params = new URLSearchParams(searchParams);
    if (newPage > 1) {
      params.set("page", newPage.toString());
    } else {
      params.delete("page");
    }
    setSearchParams(params);

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

  // Determine banner interval based on total ads
  const getBannerInterval = () => {
    const totalAds = filteredListings.length;
    if (totalAds >= 6) return 6;
    if (totalAds >= 3) return 3;
    return totalAds > 0 ? totalAds : 6; // Default to 6 if no ads
  };

  const bannerInterval = getBannerInterval();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Back to home"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 capitalize">Search Anything</h1>
                <p className="text-sm text-gray-600">
                  {searchQuery && (
                    <span>
                      Showing results for "<strong>{searchQuery}</strong>" •{" "}
                    </span>
                  )}
                  {filteredListings.length} listings found
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:mb-6">
        <div className="flex gap-2 md:gap-4 lg:gap-6">
          <div className="md:w-48 xl:w-72 lg:w-64 hidden md:block flex-shrink-0">
            <div className="sticky top-24 space-y-4 z-10">
              <div className="hidden lg:block">
                <SidebarBanner
                  categoryId={selectedCategory !== "all" ? parseInt(selectedCategory) : undefined}
                  cityId={selectedCity !== "all" ? parseInt(selectedCity) : undefined}
                />
              </div>
              <FlippingAd size="medium" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="bg-white border-b border-gray-200">
              <div>
                <HeaderBanner
                  categoryId={selectedCategory !== "all" ? parseInt(selectedCategory) : undefined}
                  cityId={selectedCity !== "all" ? parseInt(selectedCity) : undefined}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4">
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search listings..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    aria-label="Search listings"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    onChange={e => {
                      setSelectedCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    aria-label="Filter by category"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
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
                    onChange={e => {
                      setSelectedCity(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    aria-label="Filter by city"
                  >
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="sort-by" className="block text-xs font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    id="sort-by"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    aria-label="Sort listings"
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

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4" role="alert">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {!loading && !error && filteredListings.length > 0 && (
              <div>
                {Array.from({
                  length: Math.ceil(filteredListings.length / bannerInterval),
                }).map((_, chunkIndex) => {
                  const startIndex = chunkIndex * bannerInterval;
                  const endIndex = Math.min(startIndex + bannerInterval, filteredListings.length);
                  const chunkListings = filteredListings.slice(startIndex, endIndex);

                  return (
                    <React.Fragment key={chunkIndex}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {chunkListings.map(ad => (
                          <AdCard
                            key={ad.id}
                            ad={ad}
                            user={user}
                            onClick={() => handleListingClick(ad)}
                            showFeaturedBadge={true}
                          />
                        ))}
                      </div>

                      {endIndex < filteredListings.length && (
                        <div className="w-full mb-8">
                          <BetweenAdsBanner
                            categoryId={
                              selectedCategory !== "all" ? parseInt(selectedCategory) : undefined
                            }
                            cityId={selectedCity !== "all" ? parseInt(selectedCity) : undefined}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}

                {totalPages > 1 && (
                  <nav className="mt-8 flex justify-center" aria-label="Pagination">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handlePreviousPage}
                        disabled={!hasPrevious}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          hasPrevious
                            ? "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                            : "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
                        }`}
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
                        Previous
                      </button>

                      <div className="hidden sm:flex space-x-1">
                        {getPageNumbers().map((pageNum, index) =>
                          pageNum === "..." ? (
                            <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
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
                              aria-label={`Go to page ${pageNum}`}
                              aria-current={currentPage === pageNum ? "page" : undefined}
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
                        aria-label="Next page"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
                      </button>
                    </div>
                  </nav>
                )}

                <div className="hidden md:block">
                  <FooterBanner />
                </div>
              </div>
            )}

            {!loading && !error && filteredListings.length === 0 && (
              <>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                  <div className="text-center">
                    <div className="text-gray-400 mb-4">
                      <Search className="h-16 w-16 mx-auto" aria-hidden="true" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">No results found</h2>
                    <p className="text-gray-600">Try adjusting your search or filters</p>
                  </div>
                </div>

                <div className="hidden md:block">
                  <FooterBanner
                    categoryId={selectedCategory !== "all" ? parseInt(selectedCategory) : undefined}
                    cityId={selectedCity !== "all" ? parseInt(selectedCity) : undefined}
                  />
                </div>
              </>
            )}

            {loading && (
              <div className="text-center py-12" role="status" aria-live="polite">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading results...</p>
              </div>
            )}
          </div>

          <div className="md:w-48 hidden md:block xl:w-72 lg:w-60 flex-shrink-0">
            <div className="sticky top-24 mt-2 space-y-4 z-10">
              <RecentListings />
            </div>
          </div>
        </div>
      </main>

      <div className="md:hidden m-4 mt-0">
        <FlippingAd size="medium" />
      </div>

      <div className="md:hidden mx-4 mb-4">
        <FooterBanner
          categoryId={selectedCategory !== "all" ? parseInt(selectedCategory) : undefined}
          cityId={selectedCity !== "all" ? parseInt(selectedCity) : undefined}
        />
      </div>

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
