import React from "react";

interface SideBannerProps {
  position?: "left" | "right";
  size?: "small" | "medium" | "large";
}

const SideBanner: React.FC<SideBannerProps> = ({
  position = "left",
  size = "medium",
}) => {
  const sizeClasses = {
    small: "h-32 w-full",
    medium: "h-48 w-full",
    large: "h-64 w-full",
  };

  return (
    <div className="bg-gradient-to-br from-green-100 to-green-200 border-2 border-dashed border-green-300 rounded-lg flex items-center justify-center text-green-600 font-medium h-64 w-full">
      <div className="text-center">
        <div className="text-sm font-semibold mb-1">Side Advertisement</div>
        <div className="text-xs">300 x 250 - Medium Rectangle</div>
      </div>
    </div>
  );
};

export default SideBanner;
