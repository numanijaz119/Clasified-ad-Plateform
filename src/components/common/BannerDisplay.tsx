// src/components/common/BannerDisplay.tsx
import React, { useEffect, useState, useRef } from "react";
import type { PublicBanner, BannerPosition } from "../../types/banners";
import { bannerService } from "../../services/bannerService";
import { ExternalLink } from "lucide-react";

interface BannerDisplayProps {
  position: BannerPosition;
  stateCode?: string;
  categoryId?: number;
  className?: string;
}

const BannerDisplay: React.FC<BannerDisplayProps> = ({
  position,
  stateCode,
  categoryId,
  className = "",
}) => {
  const [banners, setBanners] = useState<PublicBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const impressionTracked = useRef<Set<number>>(new Set());

  useEffect(() => {
    loadBanners();
  }, [position, stateCode, categoryId]);

  // Track impressions when banner is visible
  useEffect(() => {
    if (banners.length > 0) {
      const currentBanner = banners[currentIndex];
      if (currentBanner && !impressionTracked.current.has(currentBanner.id)) {
        bannerService.trackImpression(currentBanner.id);
        impressionTracked.current.add(currentBanner.id);
      }
    }
  }, [banners, currentIndex]);

  // Auto-rotate banners every 10 seconds
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const params = {
        position,
        state: stateCode,
        category: categoryId,
      };
      console.log(`Loading banners for position: ${position}`, params);
      const data = await bannerService.getBanners(params);
      console.log(`Loaded ${data.length} banners for position: ${position}`, data);
      setBanners(data);
    } catch (error) {
      console.error("Failed to load banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBannerClick = (banner: PublicBanner) => {
    bannerService.trackClick(banner.id);
    if (banner.click_url) {
      if (banner.open_new_tab) {
        window.open(banner.click_url, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = banner.click_url;
      }
    }
  };

  if (loading) {
    return (
      <div
        className={`animate-pulse bg-gray-200 rounded-lg ${className}`}
        style={{ minHeight: "100px" }}
        aria-label="Loading banner"
      />
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  // Get responsive dimensions based on position
  const getDimensionClasses = () => {
    switch (position) {
      case "header":
        return "h-24 md:h-24 max-h-24";
      case "sidebar":
        return "h-48 sm:h-56 md:h-64 max-h-64 w-full max-w-xs";
      case "footer":
        return "h-20 sm:h-24 md:h-28 max-h-28";
      case "between_ads":
        return "h-24 sm:h-28 md:h-32 max-h-32";
      case "category_page":
        return "h-32 sm:h-36 md:h-40 max-h-40";
      case "ad_detail":
        return "h-28 sm:h-32 md:h-36 max-h-36";
      default:
        return "h-32 max-h-32";
    }
  };

  return (
    <div
      className={`banner-container relative w-full overflow-hidden ${getDimensionClasses()} ${className}`}
      role="complementary"
      aria-label={`Advertisement: ${currentBanner.title}`}
    >
      {currentBanner.banner_type === "image" && currentBanner.image && (
        <div
          className={`relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow h-full ${
            currentBanner.click_url ? "cursor-pointer" : ""
          }`}
          onClick={() =>
            currentBanner.click_url && handleBannerClick(currentBanner)
          }
          onKeyDown={(e) => {
            if (
              currentBanner.click_url &&
              (e.key === "Enter" || e.key === " ")
            ) {
              e.preventDefault();
              handleBannerClick(currentBanner);
            }
          }}
          role={currentBanner.click_url ? "button" : "img"}
          tabIndex={currentBanner.click_url ? 0 : undefined}
          aria-label={currentBanner.title}
        >
          <img
            src={currentBanner.image}
            alt={currentBanner.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {currentBanner.click_url && (
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-md">
              <ExternalLink
                className="h-4 w-4 text-gray-700"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
      )}

      {currentBanner.banner_type === "html" && currentBanner.html_content && (
        <div
          className="html-banner rounded-lg overflow-hidden h-full flex flex-col"
          onClick={() =>
            currentBanner.click_url && handleBannerClick(currentBanner)
          }
          role={currentBanner.click_url ? "button" : "region"}
          tabIndex={currentBanner.click_url ? 0 : undefined}
        >
          <div
            className="flex-1 overflow-hidden"
            dangerouslySetInnerHTML={{ __html: currentBanner.html_content }}
          />
        </div>
      )}

      {currentBanner.banner_type === "text" && currentBanner.text_content && (
        <div
          className={`text-banner p-2 sm:p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-center ${
            currentBanner.click_url
              ? "cursor-pointer hover:border-orange-300"
              : ""
          }`}
          onClick={() =>
            currentBanner.click_url && handleBannerClick(currentBanner)
          }
          onKeyDown={(e) => {
            if (
              currentBanner.click_url &&
              (e.key === "Enter" || e.key === " ")
            ) {
              e.preventDefault();
              handleBannerClick(currentBanner);
            }
          }}
          role={currentBanner.click_url ? "button" : "region"}
          tabIndex={currentBanner.click_url ? 0 : undefined}
        >
          <div className="flex items-center justify-between">
            <p className="text-gray-800 leading-relaxed flex-1 text-sm sm:text-base line-clamp-2">
              {currentBanner.text_content}
            </p>
            {currentBanner.click_url && (
              <ExternalLink
                className="h-4 w-4 text-orange-600 flex-shrink-0 ml-2"
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      )}

      {/* Banner indicator dots */}
      {banners.length > 1 && (
        <div
          className="flex justify-center gap-1.5 mt-2"
          role="tablist"
          aria-label="Banner navigation"
        >
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-6 bg-orange-500"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Show banner ${index + 1}`}
              aria-selected={index === currentIndex}
              role="tab"
            />
          ))}
        </div>
      )}

      {/* Accessibility: Sponsored label */}
      <div className="sr-only" role="note">
        Sponsored content
      </div>
    </div>
  );
};

export default React.memo(BannerDisplay);
