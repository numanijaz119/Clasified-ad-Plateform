// src/components/FeaturedAds.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, Eye, Clock } from "lucide-react";
import { useFeaturedAds } from "../hooks/useFeaturedAds";
import AdCardSkeleton from "./skeletons/AdCardSkeleton";

const FeaturedAds: React.FC = () => {
  const { ads, loading, error, refetch } = useFeaturedAds({ limit: 6 });

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-600 mb-4" role="alert">
              {error}
            </p>
            <button
              onClick={refetch}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              aria-label="Retry loading featured ads"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white" aria-labelledby="featured-heading">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2
              id="featured-heading"
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              Featured Listings
            </h2>
            <p className="text-gray-600">Premium ads from verified sellers</p>
          </div>
          <Link
            to="/featured"
            className="hidden md:block px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            View All
          </Link>
        </div>

        {/* Featured Ads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <AdCardSkeleton count={3} />
          ) : ads.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No featured ads available</p>
            </div>
          ) : (
            ads.map((ad) => (
              <Link
                key={ad.id}
                to={`/ad/${ad.slug}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Ad Image */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  {ad.primary_image?.image ? (
                    <img
                      src={ad.primary_image.image}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}

                  {/* Featured Badge */}
                  <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Featured
                  </div>
                </div>

                {/* Ad Content */}
                <div className="p-4">
                  {/* Category Badge */}
                  <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium mb-2">
                    {ad.category.name}
                  </span>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors">
                    {ad.title}
                  </h3>

                  {/* Price */}
                  <p className="text-2xl font-bold text-orange-500 mb-3">
                    {ad.display_price}
                  </p>

                  {/* Location */}
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">
                      {ad.city.name}, {ad.state.code}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{ad.view_count.toLocaleString()} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{ad.time_since_posted}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* View All Button (Mobile) */}
        <div className="mt-8 text-center md:hidden">
          <Link
            to="/featured"
            className="inline-block px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            View All Featured Ads
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedAds;
