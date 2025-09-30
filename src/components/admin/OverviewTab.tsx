// src/components/admin/OverviewTab.tsx

import React, { useState, useEffect } from "react";
import {
  FileText,
  Users,
  Eye,
  Heart,
  Phone,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Filter,
} from "lucide-react";
import { adminService } from "../../services";
import { AdminDashboardStats } from "../../types/admin";

const OverviewTab: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await adminService.getDashboardStats(
        selectedState === "all" ? undefined : selectedState
      );
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard statistics");
      console.error("Failed to fetch dashboard stats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedState]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedState]);

  const handleRefresh = () => {
    fetchStats(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
          <div className="flex-1">
            <h3 className="text-red-800 font-semibold">
              Failed to Load Dashboard
            </h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
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

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex sm:items-center flex-col sm:flex-row gap-y-2 sm:gap-y-0  justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Dashboard Overview
        </h2>
        <div className="flex items-center self-end sm:self-auto space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All States</option>
              <option value="IL">Illinois</option>
              <option value="TX">Texas</option>
              <option value="CA">California</option>
              <option value="FL">Florida</option>
            </select>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Ads Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ad Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Ads */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">
                  Total Ads
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {stats.ads.total.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-700" />
              </div>
            </div>
            {stats.ads.new_this_week > 0 && (
              <div className="mt-3 flex items-center text-xs text-blue-700">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+{stats.ads.new_this_week} this week</span>
              </div>
            )}
          </div>

          {/* Active Ads */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">
                  Active Ads
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {stats.ads.active.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-700" />
              </div>
            </div>
            <div className="mt-3 text-xs text-green-700">
              {((stats.ads.active / stats.ads.total) * 100).toFixed(1)}% of
              total
            </div>
          </div>

          {/* Pending Ads */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700 mb-1">
                  Pending Review
                </p>
                <p className="text-3xl font-bold text-yellow-900">
                  {stats.ads.pending.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-200 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-yellow-700" />
              </div>
            </div>
            {stats.ads.pending > 0 && (
              <div className="mt-3 text-xs text-yellow-700">
                Requires attention
              </div>
            )}
          </div>

          {/* Featured Ads */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 mb-1">
                  Featured Ads
                </p>
                <p className="text-3xl font-bold text-purple-900">
                  {stats.ads.featured.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-700" />
              </div>
            </div>
            <div className="mt-3 text-xs text-purple-700">Premium listings</div>
          </div>

          {/* Rejected Ads */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 mb-1">
                  Rejected
                </p>
                <p className="text-3xl font-bold text-red-900">
                  {stats.ads.rejected.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-200 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-700" />
              </div>
            </div>
            <div className="mt-3 text-xs text-red-700">
              {((stats.ads.rejected / stats.ads.total) * 100).toFixed(1)}% of
              total
            </div>
          </div>
        </div>
      </div>

      {/* User Statistics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          User Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.users.total.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Users</p>
            {stats.users.new_this_week > 0 && (
              <div className="mt-2 flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+{stats.users.new_this_week} this week</span>
              </div>
            )}
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.users.active.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">Active Users</p>
            <div className="mt-2 text-xs text-gray-500">
              {((stats.users.active / stats.users.total) * 100).toFixed(1)}% of
              total
            </div>
          </div>

          {/* Suspended Users */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.users.suspended.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">Suspended</p>
          </div>

          {/* Banned Users */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.users.banned.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">Banned</p>
          </div>
        </div>
      </div>

      {/* Engagement & Moderation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Engagement
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {stats.engagement.total_views.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact Views</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {stats.engagement.total_contacts.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Favorites</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {stats.engagement.total_favorites.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Moderation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Moderation Queue
          </h3>
          <div className="space-y-4">
            <div
              className={`p-4 rounded-lg border-2 ${
                stats.moderation.pending_reports > 0
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertCircle
                    className={`h-8 w-8 ${
                      stats.moderation.pending_reports > 0
                        ? "text-yellow-600"
                        : "text-gray-400"
                    }`}
                  />
                  <div>
                    <p className="text-sm text-gray-600">Pending Reports</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.moderation.pending_reports}
                    </p>
                  </div>
                </div>
                {stats.moderation.pending_reports > 0 && (
                  <button
                    onClick={() => (window.location.hash = "posts")}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Review
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Quick Actions</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => (window.location.hash = "posts")}
                  className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors"
                >
                  Review Posts
                </button>
                <button
                  onClick={() => (window.location.hash = "users")}
                  className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors"
                >
                  Manage Users
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
