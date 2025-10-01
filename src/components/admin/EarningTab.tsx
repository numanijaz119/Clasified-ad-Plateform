// src/components/admin/EarningsTab.tsx
// Uses dashboard stats to show featured ads count
// For detailed revenue analytics, backend endpoint needs implementation

import React, { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  TrendingUp,
  Star,
  RefreshCw,
  AlertCircle,
  FileText,
  Users,
  Calendar,
  BarChart3,
} from "lucide-react";
import { adminService, contentService } from "../../services";
import { AdminDashboardStats } from "../../types/admin";
import { State } from "../../types/content";

const EarningsTab: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string>("all");

  // Hardcoded featured ad price (should come from backend settings)
  const FEATURED_AD_PRICE = 9.99;

  // Fetch states
  const fetchStates = useCallback(async () => {
    try {
      const statesData = await contentService.getStates();
      setStates(statesData.filter((s) => s.is_active));
    } catch (err) {
      console.error("Failed to fetch states:", err);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getDashboardStats(
        selectedState === "all" ? undefined : selectedState
      );
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Failed to load earnings data");
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedState]);

  useEffect(() => {
    fetchStates();
  }, [fetchStates]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Earnings & Revenue
            </h2>
            <p className="text-gray-600 mt-1">
              Track revenue from featured ad promotions
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              <option value="all">All States</option>
              {states.map((state) => (
                <option key={state.id} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => fetchStats()}
              disabled={loading}
              className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-2" />
          <p className="text-gray-600">Loading earnings data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
          <div className="flex-1">
            <p className="text-red-800 font-semibold">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button
            onClick={() => fetchStats()}
            className="ml-4 text-red-600 hover:text-red-700 underline text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Calculate revenue metrics
  const totalFeaturedAds = stats.ads.featured;
  const estimatedRevenue = (totalFeaturedAds * FEATURED_AD_PRICE).toFixed(2);
  const newFeaturedThisWeek =
    stats.ads.new_this_week > 0
      ? Math.floor(stats.ads.new_this_week * 0.1) // Assuming 10% of new ads are featured
      : 0;
  const weeklyRevenue = (newFeaturedThisWeek * FEATURED_AD_PRICE).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Earnings & Revenue
          </h2>
          <p className="text-gray-600 mt-1">
            Track revenue from featured ad promotions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-2 border active:outline-none focus-visible:outline-none  border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          >
            <option value="all">All States</option>
            {states.map((state) => (
              <option key={state.id} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => fetchStates()}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Featured Ads */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-900">
            {totalFeaturedAds.toLocaleString()}
          </p>
          <p className="text-sm text-green-700 mt-1">Featured Ads</p>
          <p className="text-xs text-green-700 mt-2">
            ${FEATURED_AD_PRICE} per ad
          </p>
        </div>

        {/* Estimated Revenue */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-900">
            ${estimatedRevenue}
          </p>
          <p className="text-sm text-blue-700 mt-1">Total Revenue</p>
          <p className="text-xs text-blue-700 mt-2">
            From {totalFeaturedAds} featured ads
          </p>
        </div>

        {/* This Week */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-900">${weeklyRevenue}</p>
          <p className="text-sm text-purple-700 mt-1">This Week</p>
          <p className="text-xs text-purple-700 mt-2">
            {newFeaturedThisWeek} new featured ads
          </p>
        </div>

        {/* Average per Ad */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-sm border border-orange-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-orange-900">
            ${FEATURED_AD_PRICE}
          </p>
          <p className="text-sm text-orange-700 mt-1">Price per Ad</p>
          <p className="text-xs text-orange-700 mt-2">
            Standard featured pricing
          </p>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Revenue Breakdown
        </h3>
        <div className="space-y-6">
          {/* By Status */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Featured Ads by Status
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Featured</span>
                  <FileText className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats.ads.featured}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  ${(stats.ads.featured * FEATURED_AD_PRICE).toFixed(2)} revenue
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Ads</span>
                  <FileText className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats.ads.total}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {((stats.ads.featured / stats.ads.total) * 100).toFixed(1)}%
                  are featured
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Potential</span>
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {(stats.ads.active - stats.ads.featured).toLocaleString()}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  $
                  {(
                    (stats.ads.active - stats.ads.featured) *
                    FEATURED_AD_PRICE
                  ).toFixed(2)}{" "}
                  potential
                </p>
              </div>
            </div>
          </div>

          {/* Revenue Projection */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Revenue Projections
            </h4>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    If 25% of active ads promote:
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    $
                    {(
                      Math.floor(stats.ads.active * 0.25) * FEATURED_AD_PRICE
                    ).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    ({Math.floor(stats.ads.active * 0.25)} ads)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    If 50% of active ads promote:
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    $
                    {(
                      Math.floor(stats.ads.active * 0.5) * FEATURED_AD_PRICE
                    ).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    ({Math.floor(stats.ads.active * 0.5)} ads)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Ad Benefits */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Featured Ad Value Proposition
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <Star className="h-6 w-6 text-orange-600 mb-2" />
                <h5 className="text-sm font-semibold text-gray-900 mb-1">
                  Premium Placement
                </h5>
                <p className="text-xs text-gray-600">
                  Ads appear at the top of search results and category pages
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <TrendingUp className="h-6 w-6 text-blue-600 mb-2" />
                <h5 className="text-sm font-semibold text-gray-900 mb-1">
                  Increased Visibility
                </h5>
                <p className="text-xs text-gray-600">
                  Up to 10x more views compared to regular listings
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <Users className="h-6 w-6 text-green-600 mb-2" />
                <h5 className="text-sm font-semibold text-gray-900 mb-1">
                  Faster Results
                </h5>
                <p className="text-xs text-gray-600">
                  Featured ads typically sell 3x faster than regular ads
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Key Metrics Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {stats.ads.featured}
            </p>
            <p className="text-sm text-gray-600 mt-1">Featured Ads</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              ${estimatedRevenue}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {((stats.ads.featured / stats.ads.total) * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 mt-1">Conversion Rate</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              ${FEATURED_AD_PRICE}
            </p>
            <p className="text-sm text-gray-600 mt-1">Price per Ad</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsTab;
