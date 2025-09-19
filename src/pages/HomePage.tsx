import React from "react";
import Hero from "../components/Hero";
import FeaturedAds from "../components/FeaturedAds";
import {
  SideBanner,
  FlippingAd,
  InlineBanner,
  RecentListings,
  BottomBanner,
} from "../components/AdBanners";
import ListingModal from "../components/ListingModal";

const HomePage: React.FC = () => {
  const [selectedListing, setSelectedListing] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleListingClick = (listing: any) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
  };

  return (
    <>
      <main className="max-w-7xl mx-auto px-4">
        <div className="flex gap-4">
          {/* Left Sidebar with Ads */}
          <div className="hidden md:block lg:w-64 xl:w-72 md:w-48 flex-shrink-0">
            <div className="sticky top-24 space-y-4 z-10">
              <SideBanner />
              <FlippingAd size="medium" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <Hero />

            {/* Mobile Recent Listing component */}
            <div className="md:hidden">
              <RecentListings onListingClick={handleListingClick} />
            </div>

            {/* Mobile Ad */}
            <div className="md:hidden my-4">
              <SideBanner size="small" />
            </div>

            <FeaturedAds />

            {/* Inline Banner Ad */}
            <div className="mt-3 space-y-4">
              {/* Mobile flipping ad */}
              <div className=" md:hidden">
                <FlippingAd size="medium" />
              </div>

              <InlineBanner />
            </div>
          </div>

          {/* Right Sidebar with Ads */}
          <div className="hidden md:block lg:w-64 xl:w-72 md:w-48 flex-shrink-0">
            <div className="sticky top-24 space-y-2">
              {/* <SideBanner /> */}
              <RecentListings onListingClick={handleListingClick} />
            </div>
          </div>
        </div>

        {/* Bottom Banner Ad */}
        <BottomBanner />
      </main>

      {/* Listing Modal */}
      <ListingModal
        listing={selectedListing}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default HomePage;
