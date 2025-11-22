// src/pages/NotFoundPage.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, Search, ArrowLeft } from "lucide-react";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-orange-500 mb-4">404</h1>
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Search className="h-32 w-32 text-orange-300 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 bg-orange-500 rounded-full opacity-20 animate-ping"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Oops! Page Not Found</h2>
        <p className="text-lg text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
          <br />
          Let's get you back on track!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </button>

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors"
          >
            <Home className="h-5 w-5 mr-2" />
            Go to Homepage
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">You might be looking for:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/search")}
              className="text-orange-600 hover:text-orange-700 font-medium text-sm"
            >
              Browse Ads
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-orange-600 hover:text-orange-700 font-medium text-sm"
            >
              My Dashboard
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => navigate("/profile")}
              className="text-orange-600 hover:text-orange-700 font-medium text-sm"
            >
              My Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
