import React from "react";
import Hero from "../components/Hero";
import FeaturedAds from "../components/FeaturedAds";
// import AdBanners from "../components/AdBanners";
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
          <div className="hidden md:block w-48 flex-shrink-0">
            <div className="sticky top-24 space-y-4 z-10">
              <SideBanner />
              <FlippingAd size="large" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <Hero />

            <FeaturedAds />

            {/* Inline Banner Ad */}
            <div className="mt-3 space-y-4">
              {/* Mobile flipping ad */}
              <div className=" md:hidden">
                <FlippingAd size="large" />
              </div>

              <InlineBanner />
            </div>
          </div>

          {/* Right Sidebar with Ads */}
          <div className="hidden md:block w-48 flex-shrink-0">
            <div className="sticky top-24 space-y-2">
              <SideBanner />
              <RecentListings onListingClick={handleListingClick} />
            </div>
          </div>
        </div>

        {/* <div className="my-4"> */}

        {/* Bottom Banner Ad */}
        <BottomBanner />
        {/* </div> */}
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
