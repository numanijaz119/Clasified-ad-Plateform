import React from "react";
import BaseModal from "./BaseModal";

// Ad data interface
interface AdData {
  bgColor: string;
  textColor: string;
  icon: string;
  title: string;
  subtitle: string;
  buttonText: string;
}

// Modal props interface
interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAd: AdData;
  onContactSales?: () => void;
  onViewPricing?: () => void;
  onAdButtonClick?: () => void;
}

const AdModal: React.FC<AdModalProps> = ({
  isOpen,
  onClose,
  currentAd,
  onContactSales,
  onViewPricing,
  onAdButtonClick,
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Advertisement"
      maxWidth="max-w-2xl"
    >
      <div className="p-6">
        <div
          className={`bg-gradient-to-r ${currentAd.bgColor} ${currentAd.textColor} rounded-lg p-8 mb-6`}
        >
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-4xl">{currentAd.icon}</span>
            <div>
              <h3 className="text-2xl font-bold">{currentAd.title}</h3>
              <p className="text-lg opacity-90">{currentAd.subtitle}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-base opacity-90 mb-4">
              This is a premium advertisement space. Contact us to learn more
              about advertising opportunities and how we can help promote your
              business to the Illinois Desi community.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm opacity-80">
              <li>Reach thousands of potential customers</li>
              <li>Targeted advertising to specific demographics</li>
              <li>Multiple ad formats and placements available</li>
              <li>Detailed analytics and performance tracking</li>
            </ul>
          </div>

          <button
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg px-6 py-3 font-semibold transition-all duration-200"
            onClick={onAdButtonClick}
          >
            {currentAd.buttonText}
          </button>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Interested in advertising with us?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold"
              onClick={onContactSales}
            >
              Contact Sales Team
            </button>
            <button
              className="border-2 border-orange-500 text-orange-500 px-6 py-2 rounded-lg hover:bg-orange-500 hover:text-white transition-all duration-200 font-semibold"
              onClick={onViewPricing}
            >
              View Pricing Plans
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default AdModal;
export type { AdData, AdModalProps };
