// src/components/AdCard.tsx
import React from "react";
import { Eye, Clock, Star, MapPin, Heart } from "lucide-react";
import Badge from "./ui/Badge";

interface AdCardProps {
  ad: {
    id: number;
    title: string;
    category: { name: string };
    display_price: string;
    city: { name: string };
    state: { code: string };
    primary_image?: { image: string };
    view_count: number;
    time_since_posted: string;
    plan?: string;
    is_featured_active?: boolean;
    is_owner?: boolean;
    user_id?: number;
    description?: string;
  };
  user?: { id: number } | null;
  onClick: () => void;
  showFeaturedBadge?: boolean;
}

/**
 * Reusable AdCard component with:
 * - Blue border for owned ads
 * - Featured badge support
 * - Lazy loading for images
 * - Accessibility features
 * - SEO-friendly markup
 */
const AdCard: React.FC<AdCardProps> = ({ ad, user, onClick, showFeaturedBadge = true }) => {
  // Check if current user owns this ad
  const isOwnAd = user && (ad.is_owner || ad.user_id === user.id);

  // Determine if ad is featured
  const isFeatured = ad.plan === "featured" || ad.is_featured_active;

  return (
    <article
      onClick={onClick}
      className={`group bg-white rounded-lg shadow-sm transition-all cursor-pointer hover:shadow-md border-2 ${
        isOwnAd ? "border-blue-500" : "border-gray-200 hover:border-orange-300"
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`View details for ${ad.title}`}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
        {ad.primary_image?.image ? (
          <img
            src={ad.primary_image.image}
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-gray-400"
            role="img"
            aria-label="No image available"
          >
            <span className="text-sm">No image</span>
          </div>
        )}

        {/* Featured Badge */}
        {showFeaturedBadge && isFeatured && (
          <div
            className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg"
            role="status"
            aria-label="Featured listing"
          >
            <Star className="h-3 w-3 fill-current" aria-hidden="true" />
            <span>Featured</span>
          </div>
        )}

        {/* Owner Badge */}
        {isOwnAd && (
          <div
            className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg"
            role="status"
            aria-label="Your listing"
          >
            Your Ad
          </div>
        )}

        {/* Favorite Button - Hidden for now, can be activated later */}
        {/* <button
          className="absolute bottom-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Add to favorites"
          onClick={(e) => {
            e.stopPropagation();
            // Handle favorite action
          }}
        >
          <Heart className="h-4 w-4 text-gray-600" />
        </button> */}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Category Badge */}
        <Badge variant="secondary" className="mb-2 text-xs">
          {ad.category.name}
        </Badge>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm group-hover:text-orange-600 transition-colors">
          {ad.title}
        </h3>

        {/* Price */}
        <p className="text-orange-600 font-bold text-base mb-2">{ad.display_price}</p>

        {/* Location */}
        <div className="flex items-center text-gray-600 text-xs mb-2">
          <MapPin className="h-3 w-3 mr-1" aria-hidden="true" />
          <span>
            {ad.city.name}, {ad.state.code}
          </span>
        </div>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center justify-between w-full space-x-3">
            <div className="flex items-center space-x-1" title="View count">
              <Eye className="h-3 w-3" aria-hidden="true" />
              <span>{ad.view_count}</span>
            </div>
            <div className="flex items-center space-x-1" title="Posted time">
              <Clock className="h-3 w-3" aria-hidden="true" />
              <span>{ad.time_since_posted}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default AdCard;
