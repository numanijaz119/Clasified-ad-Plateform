import React from "react";
import Hero from "../components/Hero";
import FeaturedAds from "../components/FeaturedAds";
import { FlippingAd, RecentListings } from "../components/AdBanners";
import { FooterBanner, SidebarBanner } from "../components/common/BannerLayouts";

const HomePage: React.FC = () => {
  return (
    <>
      <main className="max-w-7xl mx-auto mb-4 px-4">
        <div className="flex gap-4">
          {/* Left Sidebar with Ads */}
          <div className="hidden md:block lg:w-64 xl:w-72 md:w-48 flex-shrink-0">
            <div className="sticky top-24 space-y-4 z-10">
              <SidebarBanner />
              <FlippingAd size="medium" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <Hero />

            {/* Mobile Recent Listing component */}
            <div className="md:hidden">
              <RecentListings />
            </div>

            <FeaturedAds />

            {/* Mobile Bottom FlippingAd */}
            <div className="mt-3 space-y-4">
              {/* Mobile flipping ad */}
              <div className=" md:hidden">
                <FlippingAd size="medium" />
              </div>
            </div>

            {/* Footer Banner Ad */}
            <div className="overflow-hidden">
              <FooterBanner />
            </div>
          </div>

          {/* Right Sidebar with Ads */}
          <div className="hidden md:block lg:w-64 xl:w-72 md:w-48 flex-shrink-0">
            <div className="sticky top-24 space-y-2">
              <RecentListings />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default HomePage;
