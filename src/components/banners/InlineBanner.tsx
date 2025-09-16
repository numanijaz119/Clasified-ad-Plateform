import React from "react";

const InlineBanner: React.FC = () => (
  <div className="bg-gradient-to-r from-purple-100 to-purple-200 border-2 border-dashed border-purple-300 rounded-lg flex items-center justify-center text-purple-600 font-medium h-16 w-full">
    <div className="text-center">
      <div className="text-sm font-semibold mb-1">Inline Advertisement</div>
      <div className="text-xs">468 x 60 - Banner</div>
    </div>
  </div>
);

export default InlineBanner;
