import { useState, useCallback } from "react";
import { useAdDetails, type BasicAd, type ModalListing } from "./useAdDetails";

export const useListingModal = () => {
  const [selectedListing, setSelectedListing] = useState<ModalListing | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    loading,
    error,
    fetchAdDetails,
    transformToModalListing,
    createFallbackModalListing,
  } = useAdDetails();

  const handleListingClick = useCallback(
    async (basicAd: BasicAd) => {
      try {
        // Open modal immediately with basic data for better UX
        const fallbackListing = createFallbackModalListing(basicAd);
        setSelectedListing(fallbackListing);
        setIsModalOpen(true);

        // Fetch detailed data in the background
        const detailedAd = await fetchAdDetails(basicAd.slug);

        if (detailedAd) {
          // Update modal with detailed data
          const enhancedListing = transformToModalListing(detailedAd, basicAd);
          setSelectedListing(enhancedListing);
        }
        // If fetch fails, modal already shows fallback data
      } catch (err) {
        console.error("Error in handleListingClick:", err);
        // Modal is already open with fallback data, so user still sees something
      }
    },
    [fetchAdDetails, transformToModalListing, createFallbackModalListing]
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedListing(null);
  }, []);

  return {
    selectedListing,
    isModalOpen,
    loading,
    error,
    handleListingClick,
    handleCloseModal,
  };
};
