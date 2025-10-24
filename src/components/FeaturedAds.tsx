// src/components/FeaturedAds.tsx
// UPDATED: Only added blue border for user's own ads, no other UI changes

import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Eye, Clock, Star, Heart } from "lucide-react";
import { useFeaturedAds } from "../hooks/useFeaturedAds";
import { useListingModal } from "../hooks/useListingModal";
import { useAuth } from "../contexts/AuthContext";
import ListingModal from "./ListingModal";
import Button from "./ui/Button";
import Badge from "./ui/Badge";

const FeaturedAds: React.FC = () => {
  const { isAuthenticated, user } = useAuth(); // Added user to check ownership
  const { ads, loading, error, refetch } = useFeaturedAds({ page_size: 3 });
  const { selectedListing, isModalOpen, handleListingClick, handleCloseModal } =
    useListingModal();

  const handleAdClick = (ad: any) => {
    handleListingClick(ad);
  };

  return (
    <section className="py-3">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-0.5">
            Featured Ads
          </h2>
          <p className="text-xs text-gray-600">
            Premium listings from our community
          </p>
        </div>
        <Link to="/featured-ads">
          <Button>View All → </Button>
        </Link>
      </div>

      {/* Error State - Show title and button but display error below */}
      {error ? (
        <div>
          <div className="text-center py-8">
            <div className="text-red-600 mb-4" role="alert">
              <p className="text-sm font-medium mb-2">
                Unable to load featured ads
              </p>
              <p className="text-xs">{error}</p>
            </div>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
              aria-label="Retry loading featured ads"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Loading featured ads...</p>
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <Star className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No featured ads available
            </h3>
            <p className="text-gray-600">
              Check back soon for premium listings!
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Featured Ads Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad) => {
              // Check if current user owns this ad
              const isOwnAd = user && (ad.is_owner || ad.user_id === user.id);
              
              return (
                <div
                  key={ad.id}
                  onClick={() => handleAdClick(ad)}
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

                    {/* Favorite Button */}
                    <button className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
                      <Heart className="h-4 w-4 text-gray-600" />
                    </button>
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

                    {/* Price */}
                    <div className="text-orange-600 font-bold text-base mb-2">
                      {ad.display_price}
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-gray-600 mb-1">
                      <MapPin className="h-2.5 w-2.5 mr-0.5" />
                      <span className="text-xs">
                        {ad.city.name}, {ad.state.code}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-2.5 w-2.5" />
                        <span>{ad.view_count} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{ad.time_since_posted}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Listing Modal */}
      <ListingModal
        listing={selectedListing}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isLoggedIn={isAuthenticated}
      />
    </section>
  );
};

export default FeaturedAds;