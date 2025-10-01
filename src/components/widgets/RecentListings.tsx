import React from "react";
import { useAds } from "../../hooks/useAds";
import { useListingModal } from "../../hooks/useListingModal";
import { useAuth } from "../../contexts/AuthContext";
import ListingModal from "../ListingModal";


interface RecentListingsProps {
  // No longer need onListingClick prop as we'll use the modal hook
}

const RecentListings: React.FC<RecentListingsProps> = () => {
  const { isAuthenticated } = useAuth();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  
  // Fetch 10 most recent ads from API
  const { ads, loading, error } = useAds({
    sort_by: "newest",
    page_size: 10,
  });
  
  // Use reusable modal hook
  const {
    selectedListing,
    isModalOpen,
    handleListingClick,
    handleCloseModal,
  } = useListingModal();


  React.useEffect(() => {
    if (ads && ads.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex >= ads.length - 1 ? 0 : prevIndex + 1
        );
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [ads]);

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h3 className="text-sm font-semibold mb-3 text-gray-800 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          Recent Listings
        </h3>
        
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-600 text-sm mb-2">Failed to load recent listings</p>
            <p className="text-gray-500 text-xs">{error}</p>
          </div>
        ) : ads && ads.length > 0 ? (
          <div className="relative overflow-hidden h-48">
            <div
              className="transition-transform duration-500 ease-in-out"
              style={{ transform: `translateY(-${currentIndex * 26}px)` }}
            >
              {ads.map((ad) => (
                <div
                  key={ad.id}
                  className="h-9 flex items-center justify-between py-1 mb-1 cursor-pointer hover:bg-gray-50 transition-colors rounded px-2 border-l-2 border-transparent hover:border-orange-500"
                  onClick={() => handleListingClick(ad)}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate hover:text-orange-600 transition-colors leading-tight">
                      {ad.title}
                    </h4>
                    <div className="text-xs text-gray-500 truncate">
                      {ad.category.name} • {ad.city.name}, {ad.state.code}
                    </div>
                  </div>
                  <div className="flex flex-col items-end text-xs text-gray-500 ml-2">
                    <span className="font-semibold text-orange-600 text-sm">
                      {ad.display_price}
                    </span>
                    <span className="text-xs">{ad.time_since_posted}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">No recent listings available</p>
          </div>
        )}
      </div>
      
      {/* Listing Modal */}
      <ListingModal
        listing={selectedListing}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isLoggedIn={isAuthenticated}
      />
    </>
  );
};

export default RecentListings;
export type { RecentListingsProps };
