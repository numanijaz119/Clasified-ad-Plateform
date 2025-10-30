// src/components/admin/AnalyticsTab.tsx
// Uses existing dashboard stats endpoint - no new backend needed!

import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  Users,
  FileText,
  Eye,
  MessageSquare,
  Heart,
  AlertCircle,
  RefreshCw,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { adminService, contentService } from "../../services";
import { AdminDashboardStats } from "../../types/admin";
import { State } from "../../types/content";

const AnalyticsTab: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string>("all");

  // Fetch states
  const fetchStates = useCallback(async () => {
    try {
      const statesData = await contentService.getStates();
      setStates(statesData.filter(s => s.is_active));
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
      setError(err.message || "Failed to load analytics");
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
      <>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Platform Analytics</h2>
            <p className="text-gray-600 mt-1">Overview of key metrics and performance indicators</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              <option value="all">All States</option>
              {states.map(state => (
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
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-2" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Platform Analytics</h2>
            <p className="text-gray-600 mt-1">Overview of key metrics and performance indicators</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            >
              <option value="all">All States</option>
              {states.map(state => (
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
      </>
    );
  }

  if (!stats) return null;

  // Calculate percentages and trends
  const adApprovalRate =
    stats.ads.total > 0 ? ((stats.ads.active / stats.ads.total) * 100).toFixed(1) : "0.0";

  const adRejectionRate =
    stats.ads.total > 0 ? ((stats.ads.rejected / stats.ads.total) * 100).toFixed(1) : "0.0";

  const userActiveRate =
    stats.users.total > 0 ? ((stats.users.active / stats.users.total) * 100).toFixed(1) : "0.0";

  const avgViewsPerAd =
    stats.ads.active > 0 ? (stats.engagement.total_views / stats.ads.active).toFixed(0) : "0";

  const avgContactsPerAd =
    stats.ads.active > 0 ? (stats.engagement.total_contacts / stats.ads.active).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Platform Analytics</h2>
          <p className="text-gray-600 mt-1">Overview of key metrics and performance indicators</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedState}
            onChange={e => setSelectedState(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          >
            <option value="all">All States</option>
            {states.map(state => (
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

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ads */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-900">{stats.ads.total.toLocaleString()}</p>
          <p className="text-sm text-blue-700 mt-1">Total Ads</p>
          {stats.ads.new_this_week > 0 && (
            <div className="mt-2 flex items-center text-xs text-blue-700">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+{stats.ads.new_this_week} this week</span>
            </div>
          )}
        </div>

        {/* Total Users */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-900">{stats.users.total.toLocaleString()}</p>
          <p className="text-sm text-purple-700 mt-1">Total Users</p>
          {stats.users.new_this_week > 0 && (
            <div className="mt-2 flex items-center text-xs text-purple-700">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+{stats.users.new_this_week} this week</span>
            </div>
          )}
        </div>

        {/* Total Views */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Eye className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-900">
            {stats.engagement.total_views.toLocaleString()}
          </p>
          <p className="text-sm text-green-700 mt-1">Total Views</p>
          <p className="text-xs text-green-700 mt-2">{avgViewsPerAd} avg per ad</p>
        </div>

        {/* Total Contacts */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-sm border border-orange-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-orange-900">
            {stats.engagement.total_contacts.toLocaleString()}
          </p>
          <p className="text-sm text-orange-700 mt-1">Total Contacts</p>
          <p className="text-xs text-orange-700 mt-2">{avgContactsPerAd} avg per ad</p>
        </div>
      </div>

      {/* Ad Performance */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ad Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Active</p>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.ads.active.toLocaleString()}</p>
            <div className="mt-2 flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${(stats.ads.active / stats.ads.total) * 100}%`,
                  }}
                />
              </div>
              <span className="ml-2 text-xs text-gray-600">{adApprovalRate}%</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Pending</p>
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.ads.pending.toLocaleString()}</p>
            <div className="mt-2 flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{
                    width: `${(stats.ads.pending / stats.ads.total) * 100}%`,
                  }}
                />
              </div>
              <span className="ml-2 text-xs text-gray-600">
                {((stats.ads.pending / stats.ads.total) * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Rejected</p>
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.ads.rejected.toLocaleString()}
            </p>
            <div className="mt-2 flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${(stats.ads.rejected / stats.ads.total) * 100}%`,
                  }}
                />
              </div>
              <span className="ml-2 text-xs text-gray-600">{adRejectionRate}%</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Featured</p>
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.ads.featured.toLocaleString()}
            </p>
            <div className="mt-2 flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{
                    width: `${(stats.ads.featured / stats.ads.total) * 100}%`,
                  }}
                />
              </div>
              <span className="ml-2 text-xs text-gray-600">
                {((stats.ads.featured / stats.ads.total) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {stats.users.active.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${(stats.users.active / stats.users.total) * 100}%`,
                  }}
                />
              </div>
              <span className="ml-2 text-xs text-gray-600">{userActiveRate}%</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Suspended</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {stats.users.suspended.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600">
              {((stats.users.suspended / stats.users.total) * 100).toFixed(1)}% of total
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600">Banned</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {stats.users.banned.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600">
              {((stats.users.banned / stats.users.total) * 100).toFixed(1)}% of total
            </p>
          </div>
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Engagement Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Views</p>
              <Eye className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.engagement.total_views.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Average {avgViewsPerAd} views per ad</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Contacts</p>
              <MessageSquare className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.engagement.total_contacts.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">Average {avgContactsPerAd} contacts per ad</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Favorites</p>
              <Heart className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.engagement.total_favorites.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.ads.active > 0
                ? (stats.engagement.total_favorites / stats.ads.active).toFixed(1)
                : "0"}{" "}
              favorites per ad
            </p>
          </div>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Moderation Queue</h3>
            <p className="text-sm text-gray-600 mt-1">Reports and actions requiring attention</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-orange-600">{stats.moderation.pending_reports}</p>
            <p className="text-sm text-gray-600 mt-1">Pending Reports</p>
          </div>
        </div>
        {stats.moderation.pending_reports > 0 && (
          <div className="mt-4 p-3 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-800">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              Action required: Review pending reports
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsTab;
