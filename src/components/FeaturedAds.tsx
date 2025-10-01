// src/components/FeaturedAds.tsx
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
  const { isAuthenticated } = useAuth();
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
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No featured ads available</p>
        </div>
      ) : (
        <>
          {/* Featured Ads Grid - Simple 3 Column Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => handleAdClick(ad)}
              >
                {/* Image Container */}
                <div className="relative overflow-hidden">
                  <img
                    src={ad.primary_image?.image || "/placeholder.svg"}
                    alt={ad.title}
                    className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                  />

                  {/* Featured Badge */}
                  {ad.is_featured_active && (
                    <div className="absolute top-1 left-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-semibold flex items-center space-x-0.5">
                      <Star className="h-2 w-2 fill-current" />
                      <span>Featured</span>
                    </div>
                  )}

                  {/* Favorite Button */}
                  <button className="absolute top-1 right-1 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                    <Heart className="h-2.5 w-2.5 text-gray-600 hover:text-red-500 transition-colors" />
                  </button>

                  {/* Category Tag */}

                  <div className="absolute bottom-1 left-1">
                    <Badge variant="info">{ad.category.name}</Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-2">
                  <h3 className="text-xs font-semibold text-gray-900 mb-0.5 line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {ad.title}
                  </h3>

                  {/* Price */}
                  <div className="text-xs font-bold text-orange-600 mb-1">
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
            ))}
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
