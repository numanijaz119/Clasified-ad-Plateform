import React, { useState } from "react";
import AdModal, { AdData } from "../modals/AdModal"; // Adjust path as needed

const FlippingAd: React.FC<{ size?: "small" | "medium" | "large" }> = ({
  size = "medium",
}) => {
  const [currentAdIndex, setCurrentAdIndex] = React.useState(0);
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);

  const ads = [
    {
      id: 1,
      title: "Premium Business Listing",
      subtitle: "Boost your visibility today",
      bgColor: "from-blue-500 to-blue-600",
      textColor: "text-white",
      buttonText: "Get Started",
      icon: "🚀",
    },
    {
      id: 2,
      title: "Featured Ad Placement",
      subtitle: "Get noticed by thousands",
      bgColor: "from-green-500 to-green-600",
      textColor: "text-white",
      buttonText: "Learn More",
      icon: "⭐",
    },
    {
      id: 3,
      title: "Professional Services",
      subtitle: "Connect with local experts",
      bgColor: "from-purple-500 to-purple-600",
      textColor: "text-white",
      buttonText: "Find Services",
      icon: "🔧",
    },
    {
      id: 4,
      title: "Real Estate Deals",
      subtitle: "Find your dream home",
      bgColor: "from-orange-500 to-orange-600",
      textColor: "text-white",
      buttonText: "Browse Homes",
      icon: "🏠",
    },
    {
      id: 5,
      title: "Job Opportunities",
      subtitle: "Advance your career",
      bgColor: "from-indigo-500 to-indigo-600",
      textColor: "text-white",
      buttonText: "View Jobs",
      icon: "💼",
    },
    {
      id: 6,
      title: "Vehicle Marketplace",
      subtitle: "Buy & sell with confidence",
      bgColor: "from-red-500 to-red-600",
      textColor: "text-white",
      buttonText: "Shop Now",
      icon: "🚗",
    },
    {
      id: 7,
      title: "Community Events",
      subtitle: "Stay connected locally",
      bgColor: "from-pink-500 to-pink-600",
      textColor: "text-white",
      buttonText: "Join Events",
      icon: "🎉",
    },
    {
      id: 8,
      title: "Education & Training",
      subtitle: "Learn new skills today",
      bgColor: "from-teal-500 to-teal-600",
      textColor: "text-white",
      buttonText: "Explore",
      icon: "📚",
    },
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [ads.length]);

  const handleAdClick = () => {
    setSelectedAd(ads[currentAdIndex]);
    setIsAdModalOpen(true);
  };

  const handleCloseAdModal = () => {
    setIsAdModalOpen(false);
    setSelectedAd(null);
  };

  const currentAd = ads[currentAdIndex];

  const sizeClasses = {
    small: "h-32 p-4",
    medium: "h-40 p-6",
    large: "h-48 p-8",
  };

  const textSizes = {
    small: {
      title: "text-sm",
      subtitle: "text-xs",
      button: "text-xs px-3 py-1",
    },
    medium: {
      title: "text-lg",
      subtitle: "text-sm",
      button: "text-sm px-4 py-2",
    },
    large: {
      title: "text-xl",
      subtitle: "text-base",
      button: "text-base px-6 py-3",
    },
  };

  return (
    <>
      <div
        className={`bg-gradient-to-r ${currentAd.bgColor} ${currentAd.textColor} rounded-lg shadow-lg ${sizeClasses[size]} transition-all duration-500 ease-in-out transform hover:scale-105 cursor-pointer overflow-hidden relative`}
        onClick={handleAdClick}
      >
        {/* Your existing component JSX */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">{currentAd.icon}</span>
                <h3 className={`font-bold ${textSizes[size].title}`}>
                  {currentAd.title}
                </h3>
              </div>
              <p className={`${textSizes[size].subtitle} opacity-90`}>
                {currentAd.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <button
              className={`bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg font-semibold transition-all duration-200 ${textSizes[size].button}`}
            >
              {currentAd.buttonText}
            </button>

            <div className="flex space-x-1">
              {ads.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentAdIndex ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-pulse"></div>
      </div>

      {selectedAd && (
        <AdModal
          isOpen={isAdModalOpen}
          onClose={handleCloseAdModal}
          currentAd={selectedAd}
        />
      )}
    </>
  );
};

export default FlippingAd;
