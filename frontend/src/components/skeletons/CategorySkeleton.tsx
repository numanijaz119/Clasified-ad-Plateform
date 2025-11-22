// src/components/skeletons/CategorySkeleton.tsx
import React from "react";

interface CategorySkeletonProps {
  count?: number;
}

const CategorySkeleton: React.FC<CategorySkeletonProps> = ({ count = 8 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 animate-pulse"
          aria-hidden="true"
        >
          {/* Icon skeleton */}
          <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4" />

          {/* Title skeleton */}
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />

          {/* Description skeleton */}
          <div className="h-4 bg-gray-200 rounded w-full mb-3" />

          {/* Count skeleton */}
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </>
  );
};

export default CategorySkeleton;
