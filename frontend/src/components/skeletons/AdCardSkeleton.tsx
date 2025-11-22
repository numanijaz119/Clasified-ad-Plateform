// src/components/skeletons/AdCardSkeleton.tsx
import React from "react";

interface AdCardSkeletonProps {
  count?: number;
}

const AdCardSkeleton: React.FC<AdCardSkeletonProps> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse"
          aria-hidden="true"
        >
          {/* Image skeleton */}
          <div className="h-48 bg-gray-200" />

          <div className="p-4">
            {/* Category badge skeleton */}
            <div className="h-5 bg-gray-200 rounded-full w-20 mb-3" />

            {/* Title skeleton */}
            <div className="h-6 bg-gray-200 rounded w-full mb-2" />
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />

            {/* Price skeleton */}
            <div className="h-7 bg-gray-200 rounded w-1/2 mb-3" />

            {/* Location skeleton */}
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />

            {/* Footer skeleton */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default AdCardSkeleton;
