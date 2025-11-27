import React from "react";
import { Flyer } from "../../../types/flyer";
import FlyerCard from "./FlyerCard";

interface FlyerGridProps {
  flyers: Flyer[];
  onFlyerClick: (flyer: Flyer) => void;
}

const FlyerGrid: React.FC<FlyerGridProps> = ({ flyers, onFlyerClick }) => {
  if (flyers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No flyers found</h3>
          <p className="text-gray-600">
            Try adjusting your filters or check back later for new listings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {flyers.map(flyer => (
        <FlyerCard key={flyer.id} flyer={flyer} onClick={onFlyerClick} />
      ))}
    </div>
  );
};

export default FlyerGrid;
