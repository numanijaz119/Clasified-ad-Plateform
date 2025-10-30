// src/components/common/BannerTestPage.tsx
import React from "react";
import {
  HeaderBanner,
  SidebarBanner,
  FooterBanner,
  BetweenAdsBanner,
  CategoryPageBanner,
  AdDetailBanner,
} from "./BannerLayouts";

const BannerTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Banner System Test Page</h1>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Header Banner</h2>
            <HeaderBanner />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Category Page Banner</h2>
              <CategoryPageBanner categoryId={1} />

              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Between Ads Banner</h2>
                <BetweenAdsBanner index={6} />
              </div>

              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Ad Detail Banner</h2>
                <AdDetailBanner />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Sidebar Banner</h2>
              <SidebarBanner />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Footer Banner</h2>
            <FooterBanner />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerTestPage;
