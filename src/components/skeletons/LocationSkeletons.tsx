// src/components/skeletons/LocationSkeletons.tsx
import React from 'react';

interface DropdownSkeletonProps {
  count?: number;
}

export const DropdownSkeleton: React.FC<DropdownSkeletonProps> = ({ count = 5 }) => {
  return (
    <div className="space-y-1" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-10 bg-gray-200 rounded animate-pulse"
        />
      ))}
    </div>
  );
};

export const SelectSkeleton: React.FC = () => {
  return (
    <div 
      className="h-10 bg-gray-200 rounded-lg animate-pulse" 
      aria-hidden="true"
    />
  );
};

interface CityCardSkeletonProps {
  count?: number;
}

export const CityCardSkeleton: React.FC<CityCardSkeletonProps> = ({ count = 6 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg p-4 shadow-sm animate-pulse"
          aria-hidden="true"
        >
          {/* City name skeleton */}
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
          
          {/* State name skeleton */}
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
          
          {/* Stats skeleton */}
          <div className="flex items-center gap-4">
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
        </div>
      ))}
    </>
  );
};