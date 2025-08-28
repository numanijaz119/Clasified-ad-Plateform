import React from 'react';
import Hero from '../components/Hero';
import FeaturedAds from '../components/FeaturedAds';
import AdBanners from '../components/AdBanners';
import ListingModal from '../components/ListingModal';

const HomePage: React.FC = () => {
  const [selectedListing, setSelectedListing] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleListingClick = (listing) => {
    setSelectedListing(listing);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedListing(null);
  };

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4">
          {/* Left Sidebar with Ads */}
          <div className="hidden lg:block w-40 flex-shrink-0">
            <div className="sticky top-24 space-y-2">
              <AdBanners.SideBanner position="left" size="large" />
              <AdBanners.SideBanner position="left" size="medium" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <Hero />
            
            <FeaturedAds />
            
            {/* Inline Banner Ad */}
            <div className="my-3">
              <AdBanners.InlineBanner />
            </div>
          </div>

          {/* Right Sidebar with Ads */}
          <div className="hidden xl:block w-40 flex-shrink-0">
            <div className="sticky top-24 space-y-2">
              <AdBanners.SideBanner position="right" size="large" />
              <AdBanners.RecentListings onListingClick={handleListingClick} />
            </div>
          </div>
        </div>

        {/* Bottom Banner Ad */}
        <AdBanners.BottomBanner />
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