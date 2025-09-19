import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "medium",
  text,
  className = "",
}) => {
  const getSizeClass = () => {
    switch (size) {
      case "small":
        return "h-4 w-4";
      case "large":
        return "h-12 w-12";
      default:
        return "h-8 w-8";
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "small":
        return "text-sm";
      case "large":
        return "text-lg";
      default:
        return "text-base";
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <Loader2 className={`animate-spin text-orange-500 ${getSizeClass()}`} />
      {text && (
        <p className={`text-gray-600 font-medium ${getTextSize()}`}>{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
