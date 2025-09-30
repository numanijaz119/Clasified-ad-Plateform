import React from "react";
import { Image } from "lucide-react";

const BannersTab: React.FC = () => {
  return (
    <div className="text-center py-12">
      <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Banner Ads Management
      </h3>
      <p className="text-gray-600">Coming soon...</p>
    </div>
  );
};

export default BannersTab;
