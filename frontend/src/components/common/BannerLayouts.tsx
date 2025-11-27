// src/components/common/BannerLayouts.tsx
import React from "react";
import BannerDisplay from "./BannerDisplay";
import { useBannerContext } from "../../hooks/useBannerContext";

interface BannerLayoutProps {
  stateCode?: string;
  categoryId?: number;
  cityId?: number;
}

// Header Banner - Full width, responsive
export const HeaderBanner: React.FC<BannerLayoutProps> = ({ stateCode, categoryId, cityId }) => {
  const { stateCode: contextStateCode, categoryId: contextCategoryId } = useBannerContext();
  const effectiveStateCode = stateCode || contextStateCode;
  const effectiveCategoryId = categoryId || contextCategoryId;

  return (
    <div className="w-full bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto pb-4">
        <BannerDisplay
          position="header"
          stateCode={effectiveStateCode}
          categoryId={effectiveCategoryId}
          cityId={cityId}
          className="mx-auto"
        />
      </div>
    </div>
  );
};

// Sidebar Banner - Sticky on desktop
export const SidebarBanner: React.FC<BannerLayoutProps> = ({ stateCode, categoryId, cityId }) => {
  const { stateCode: contextStateCode, categoryId: contextCategoryId } = useBannerContext();
  const effectiveStateCode = stateCode || contextStateCode;
  const effectiveCategoryId = categoryId || contextCategoryId;

  return (
    <aside className="hidden mb-4 lg:block w-64 xl:w-72 flex-shrink-0 overflow-hidden">
      <div className="sticky top-20 space-y-4">
        <BannerDisplay
          position="sidebar"
          stateCode={effectiveStateCode}
          categoryId={effectiveCategoryId}
          cityId={cityId}
          className="w-full"
        />
      </div>
    </aside>
  );
};

// Footer Banner - Full width
export const FooterBanner: React.FC<BannerLayoutProps> = ({ stateCode, categoryId, cityId }) => {
  const { stateCode: contextStateCode, categoryId: contextCategoryId } = useBannerContext();
  const effectiveStateCode = stateCode || contextStateCode;
  const effectiveCategoryId = categoryId || contextCategoryId;

  return (
    <div className="w-full mt-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <BannerDisplay
          position="footer"
          stateCode={effectiveStateCode}
          categoryId={effectiveCategoryId}
          cityId={cityId}
          className="mx-auto"
        />
      </div>
    </div>
  );
};

// Between Ads Banner - Inline with content
export const BetweenAdsBanner: React.FC<BannerLayoutProps & { index?: number }> = ({
  stateCode,
  categoryId,
  cityId,
  index,
}) => {
  const { stateCode: contextStateCode, categoryId: contextCategoryId } = useBannerContext();
  const effectiveStateCode = stateCode || contextStateCode;
  const effectiveCategoryId = categoryId || contextCategoryId;

  // If index is provided, only show between every 6 ads (but not at index 0)
  if (index !== undefined && (index % 6 !== 0 || index === 0)) return null;

  return (
    <div className="col-span-full my-4 overflow-hidden">
      <BannerDisplay
        position="between_ads"
        stateCode={effectiveStateCode}
        categoryId={effectiveCategoryId}
        cityId={cityId}
        className="max-w-4xl mx-auto"
      />
    </div>
  );
};

// Category Page Banner - Top of category pages
export const CategoryPageBanner: React.FC<BannerLayoutProps> = ({
  stateCode,
  categoryId,
  cityId,
}) => {
  const { stateCode: contextStateCode, categoryId: contextCategoryId } = useBannerContext();
  const effectiveStateCode = stateCode || contextStateCode;
  const effectiveCategoryId = categoryId || contextCategoryId;

  return (
    <div className="mb-4 overflow-hidden">
      <BannerDisplay
        position="category_page"
        stateCode={effectiveStateCode}
        categoryId={effectiveCategoryId}
        cityId={cityId}
        className="w-full mx-auto"
      />
    </div>
  );
};

// Ad Detail Banner - On ad detail pages
export const AdDetailBanner: React.FC<BannerLayoutProps> = ({ stateCode, categoryId, cityId }) => {
  const { stateCode: contextStateCode, categoryId: contextCategoryId } = useBannerContext();
  const effectiveStateCode = stateCode || contextStateCode;
  const effectiveCategoryId = categoryId || contextCategoryId;

  return (
    <div className="my-4 overflow-hidden">
      <BannerDisplay
        position="ad_detail"
        stateCode={effectiveStateCode}
        categoryId={effectiveCategoryId}
        cityId={cityId}
        className="w-full mx-auto"
      />
    </div>
  );
};

// Mobile Bottom Banner - Fixed at bottom on mobile
export const MobileBottomBanner: React.FC<BannerLayoutProps> = ({
  stateCode,
  categoryId,
  cityId,
}) => {
  const { stateCode: contextStateCode, categoryId: contextCategoryId } = useBannerContext();
  const effectiveStateCode = stateCode || contextStateCode;
  const effectiveCategoryId = categoryId || contextCategoryId;
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
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          stateCode={effectiveStateCode}
          categoryId={effectiveCategoryId}
          cityId={cityId}
          className="w-full"
        />
      </div>
    </div>
  );
};
