// src/components/Hero.tsx
import React, { useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cloud, MapPin } from "lucide-react";
import SearchBar from "./SearchBar";
import { useCities } from "../hooks/useCities";
import { useCategories } from "../hooks/useCategories";

const Hero: React.FC = () => {
  const {
    cities: citiesData,
    loading: citiesLoading,
    error: citiesError,
  } = useCities();
  const {
    categories: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories(true);

  // DEBUG: Log what we get from backend
  useEffect(() => {
    console.log("=== CITIES DEBUG ===");
    console.log("Loading:", citiesLoading);
    console.log("Error:", citiesError);
    console.log("Cities Data:", citiesData);
    if (citiesData && citiesData.length > 0) {
      console.log("First City:", citiesData[0]);
      console.log("First City Image:", citiesData[0].image);
    }
  }, [citiesData, citiesLoading, citiesError]);

  // FALLBACK IMAGE - Used only if backend image is missing or fails to load
  const FALLBACK_CITY_IMAGE =
    "https://images.pexels.com/photos/2224861/pexels-photo-2224861.jpeg?auto=compress&cs=tinysrgb&w=400";

  // Icon/emoji mapping for categories
  const categoryEmojiMap: Record<string, string> = {
    briefcase: "💼",
    jobs: "💼",
    home: "🏠",
    "real-estate": "🏠",
    car: "🚗",
    vehicles: "🚗",
    shopping: "🛍️",
    "buy-sell": "🛍️",
    wrench: "🔧",
    services: "🔧",
    education: "🎓",
    calendar: "📅",
    events: "📅",
    "community-events": "📅",
    heart: "❤️",
    health: "❤️",
    "health-wellness": "❤️",
    users: "💑",
    matrimonial: "💑",
    utensils: "🍽️",
    food: "🍽️",
    "food-dining": "🍽️",
    gamepad: "🎮",
    entertainment: "🎮",
  };

  // Color mapping for categories
  const colorMap: Record<string, string> = {
    jobs: "from-blue-500 to-blue-600",
    "real-estate": "from-green-500 to-green-600",
    vehicles: "from-red-500 to-red-600",
    "buy-sell": "from-purple-500 to-purple-600",
    services: "from-orange-500 to-orange-600",
    education: "from-indigo-500 to-indigo-600",
    events: "from-pink-500 to-pink-600",
    "community-events": "from-pink-500 to-pink-600",
    health: "from-teal-500 to-teal-600",
    "health-wellness": "from-teal-500 to-teal-600",
    community: "from-yellow-500 to-yellow-600",
    matrimonial: "from-rose-500 to-rose-600",
    food: "from-rose-500 to-rose-600",
    "food-dining": "from-rose-500 to-rose-600",
    entertainment: "from-violet-500 to-violet-600",
  };

  // Helper function to get full image URL from backend
  const getCityImageUrl = (city: any): string => {
    // Backend uses 'photo' or 'photo_url' field, not 'image'
    const imageUrl = city.photo_url || city.photo || city.image;
    console.log("getCityImageUrl called for:", city.name, "photo:", imageUrl);

    if (!imageUrl) {
      console.log("No image field, using fallback");
      return FALLBACK_CITY_IMAGE;
    }

    // If image is already a full URL (starts with http)
    if (imageUrl.startsWith("http")) {
      console.log("Full URL detected:", imageUrl);
      return imageUrl;
    }

    // If it's a relative path, prepend the API base URL
    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    const fullUrl = `${API_BASE_URL}${imageUrl}`;
    console.log("Building full URL:", fullUrl);
    return fullUrl;
  };

  // Process cities: major first, limit to 8, use backend images
  const cities = useMemo(() => {
    if (!citiesData || citiesData.length === 0) return [];

    const majorCities = citiesData.filter((c) => c.is_major).slice(0, 8);

    if (majorCities.length >= 8) {
      return majorCities.map((city) => ({
        name: city.name,
        count: "Loading...",
        image: getCityImageUrl(city),
      }));
    }

    const otherCities = citiesData
      .filter((c) => !c.is_major)
      .slice(0, 8 - majorCities.length);

    return [...majorCities, ...otherCities].map((city) => ({
      name: city.name,
      count: "Loading...",
      image: getCityImageUrl(city),
    }));
  }, [citiesData]);

  // Process categories: limit to 8, map icons and colors from backend
  const categories = useMemo(() => {
    if (!categoriesData || categoriesData.length === 0) return [];

    return categoriesData.slice(0, 8).map((cat) => ({
      name: cat.name,
      slug: cat.slug,
      icon:
        categoryEmojiMap[cat.icon.toLowerCase()] ||
        categoryEmojiMap[cat.slug.toLowerCase()] ||
        "📋",
      color: colorMap[cat.slug.toLowerCase()] || "from-gray-500 to-gray-600",
      count: cat.ads_count || cat.state_ads_count || 0,
    }));
  }, [categoriesData]);

  return (
    <section className="pt-2 pb-3">
      {/* Top Banner with Weather */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            <div className="w-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 font-medium h-20">
              <div className="text-center">
                <div className="text-sm font-semibold mb-1">
                  Advertisement Space
                </div>
                <div className="text-xs">728 x 90 - Top Banner</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-4">
        <SearchBar className="my-0 mx-auto" />
      </div>

      {/* Side by Side: Cities and Categories */}
      <div className="mb-4">
        {/* Browse by Cities */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 text-center">
            Browse by Illinois Cities
          </h2>

          {/* Loading State */}
          {citiesLoading && (
            <div className="grid grid-cols-4 xl:grid-rows-1 grid-rows-2 xl:grid-cols-8 gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-24 rounded-lg"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {citiesError && !citiesLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600 text-sm">{citiesError}</p>
            </div>
          )}

          {/* Empty State */}
          {!citiesLoading && !citiesError && cities.length === 0 && (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No cities available</p>
            </div>
          )}

          {/* Cities Grid - EXACT ORIGINAL LAYOUT */}
          {!citiesLoading && !citiesError && cities.length > 0 && (
            <div className="grid grid-cols-4 xl:grid-rows-1 grid-rows-2 xl:grid-cols-8 gap-2">
              {cities.map((city, index) => (
                <Link
                  to={`/city/${encodeURIComponent(city.name)}`}
                  key={index}
                  className="group relative overflow-hidden rounded-lg bg-white shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 hover:scale-105"
                >
                  <div className="relative">
                    <img
                      src={city.image}
                      alt={city.name}
                      loading="lazy"
                      className="w-full h-24 object-cover group-hover:scale-125 transition-transform duration-500"
                      onError={(e) => {
                        console.log(
                          "Image failed to load for:",
                          city.name,
                          "URL:",
                          city.image
                        );
                        const target = e.target as HTMLImageElement;
                        target.src = FALLBACK_CITY_IMAGE;
                      }}
                      onLoad={() => {
                        console.log(
                          "Image loaded successfully for:",
                          city.name
                        );
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/60" />
                    <div className="absolute bottom-0 left-0 right-0 p-1">
                      <h3 className="text-white font-bold text-xs mb-0.5 truncate group-hover:text-orange-200 transition-colors">
                        {city.name}
                      </h3>
                      <p className="text-white/90 text-xs truncate group-hover:text-orange-100 transition-colors">
                        {city.count}
                      </p>
                    </div>
                    <div className="absolute inset-0 bg-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-1 right-1 w-4 h-4 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-orange-500 text-xs">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Browse by Categories - Dynamic from Backend */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 text-center">
            Browse Categories
          </h2>

          {/* Loading State */}
          {categoriesLoading && (
            <div className="grid grid-cols-4 xl:grid-rows-1 grid-rows-2 xl:grid-cols-8 gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-20 rounded-lg"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {categoriesError && !categoriesLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600 text-sm">{categoriesError}</p>
            </div>
          )}

          {/* Empty State */}
          {!categoriesLoading &&
            !categoriesError &&
            categories.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">No categories available</p>
              </div>
            )}

          {/* Categories Grid - EXACT ORIGINAL LAYOUT with Dynamic Data */}
          {!categoriesLoading && !categoriesError && categories.length > 0 && (
            <div className="grid grid-cols-4 xl:grid-rows-1 grid-rows-2 xl:grid-cols-8 gap-2">
              {categories.map((category, index) => (
                <Link
                  to={`/category/${category.slug}`}
                  key={index}
                  className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-15 transition-opacity duration-300`}
                  />
                  <div className="relative p-1.5 text-center">
                    <div
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br ${category.color} text-white mb-1 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <span className="text-xs">{category.icon}</span>
                    </div>
                    <h3 className="text-xs font-semibold text-gray-900 mb-0.5 truncate">
                      {category.name}
                    </h3>
                    <div className="flex items-center justify-center space-x-1">
                      <span className="text-xs font-bold text-gray-900">
                        {category.count.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">ads</span>
                    </div>
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${category.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
