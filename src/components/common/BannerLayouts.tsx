// src/components/common/BannerLayouts.tsx
import React from "react";
import BannerDisplay from "./BannerDisplay";
import type { BannerPosition } from "../../types/banners";

interface BannerLayoutProps {
  stateCode?: string;
  categoryId?: number;
}

// Header Banner - Full width, responsive
export const HeaderBanner: React.FC<BannerLayoutProps> = ({
  stateCode,
  categoryId,
}) => {
  return (
    <div className="w-full bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <BannerDisplay
          position="header"
          stateCode={stateCode}
          categoryId={categoryId}
          className=""
        />
      </div>
    </div>
  );
};

// Sidebar Banner - Sticky on desktop
export const SidebarBanner: React.FC<BannerLayoutProps> = ({
  stateCode,
  categoryId,
}) => {
  return (
    <aside className="hidden lg:block flex-shrink-0">
      <div className="sticky top-20 space-y-4">
        <BannerDisplay
          position="sidebar"
          stateCode={stateCode}
          categoryId={categoryId}
          className="w-full"
        />
      </div>
    </aside>
  );
};

// Footer Banner - Full width
export const FooterBanner: React.FC<BannerLayoutProps> = ({
  stateCode,
  categoryId,
}) => {
  return (
    <div className="w-full bg-gray-50 border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <BannerDisplay
          position="footer"
          stateCode={stateCode}
          categoryId={categoryId}
          className="max-h-32"
        />
      </div>
    </div>
  );
};

// Between Ads Banner - Inline with content
export const BetweenAdsBanner: React.FC<
  BannerLayoutProps & { index?: number }
> = ({ stateCode, categoryId, index = 0 }) => {
  // Only show between every 6 ads
  if (index % 6 !== 0 || index === 0) return null;

  return (
    <div className="col-span-full my-6">
      <BannerDisplay
        position="between_ads"
        stateCode={stateCode}
        categoryId={categoryId}
        className="max-w-4xl mx-auto"
      />
    </div>
  );
};

// Category Page Banner - Top of category pages
export const CategoryPageBanner: React.FC<BannerLayoutProps> = ({
  stateCode,
  categoryId,
}) => {
  return (
    <div className="mb-6">
      <BannerDisplay
        position="category_page"
        stateCode={stateCode}
        categoryId={categoryId}
        className="w-full"
      />
    </div>
  );
};

// Ad Detail Banner - On ad detail pages
export const AdDetailBanner: React.FC<BannerLayoutProps> = ({
  stateCode,
  categoryId,
}) => {
  return (
    <div className="my-6">
      <BannerDisplay
        position="ad_detail"
        stateCode={stateCode}
        categoryId={categoryId}
        className="w-full"
      />
    </div>
  );
};

// Mobile Bottom Banner - Fixed at bottom on mobile
export const MobileBottomBanner: React.FC<BannerLayoutProps> = ({
  stateCode,
  categoryId,
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
      <div className="relative">
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-1 right-1 z-10 bg-gray-800/80 text-white rounded-full p-1 hover:bg-gray-900"
          aria-label="Close banner"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <BannerDisplay
          position="footer"
          stateCode={stateCode}
          categoryId={categoryId}
          className="max-h-20"
        />
      </div>
    </div>
  );
};
