import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  Edit,
  TrendingUp,
  Star,
  Eye,
  MessageCircle,
  Plus,
  Clock,
  Trash2,
  ExternalLink,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { adsService } from "../services";
import { Ad } from "../types/ads";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import { PostAdModal } from "../components";
import { useToast } from "../contexts/ToastContext";

type TabId = "overview" | "ads" | "stats" | "promote";

// Interface matching your current backend response
interface DashboardData {
  total_ads: number;
  active_ads: number;
  pending_ads: number;
  featured_ads: number;
  total_views: number;
  total_contacts: number;
  total_favorites: number;
  this_month_ads: number;
  revenue_this_month: number;
}

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [userAds, setUserAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAds, setIsLoadingAds] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPostAdModal, setShowPostAdModal] = useState(false);

  const { toast } = useToast();

  // Fetch dashboard analytics
  const fetchDashboardAnalytics = async () => {
    try {
      setError(null);
      const data = await adsService.getDashboardAnalytics();
      setDashboardData(data);
    } catch (error: any) {
      console.error("Failed to fetch dashboard analytics:", error);
      setError("Failed to load dashboard statistics");
    }
  };

  // Fetch user's ads
  const fetchUserAds = async () => {
    try {
      setError(null);
      setIsLoadingAds(true);
      const response = await adsService.getMyAds({
        page_size: 50,
        sort_by: "newest",
      });
      setUserAds(response.results);
    } catch (error: any) {
      console.error("Failed to fetch user ads:", error);
      setError("Failed to load your ads");
    } finally {
      setIsLoadingAds(false);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchDashboardAnalytics(), fetchUserAds()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchDashboardAnalytics(), fetchUserAds()]);
    setIsRefreshing(false);
  };

  // Handle successful ad creation
  const handlePostAdSuccess = () => {
    console.log("Ad created successfully!");
    // toast.success("Ad created successfully!");

    // Auto-refresh dashboard data to show the new ad
    handleRefresh();

    // Close the modal
    setShowPostAdModal(false);
  };

  // Delete ad
  const handleDeleteAd = async (adId: number, slug: string) => {
    if (!window.confirm("Are you sure you want to delete this ad?")) {
      return;
    }
    try {
      await adsService.deleteAd(slug);
      setUserAds((ads) => ads.filter((ad) => ad.id !== adId));
      await fetchDashboardAnalytics();
    } catch (error: any) {
      console.error("Failed to delete ad:", error);
      alert("Failed to delete ad. Please try again.");
    }
  };

  // Promote ad
  const handlePromoteAd = async (slug: string) => {
    try {
      await adsService.promoteAd(slug);
      await Promise.all([fetchDashboardAnalytics(), fetchUserAds()]);
      alert("Ad promoted to featured successfully!");
    } catch (error: any) {
      console.error("Failed to promote ad:", error);
      alert("Failed to promote ad. Please try again.");
    }
  };

  // Status color helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "expired":
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  // Status text helper
  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Active";
      case "pending":
        return "Pending";
      case "expired":
        return "Expired";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    if (!dashboardData) {
      return {
        totalAds: 0,
        totalViews: 0,
        totalContacts: 0,
        activeAds: 0,
        pendingAds: 0,
        featuredAds: 0,
        conversionRate: 0,
        expiredAds: 0,
      };
    }

    const conversionRate =
      dashboardData.total_views > 0
        ? (dashboardData.total_contacts / dashboardData.total_views) * 100
        : 0;

    return {
      totalAds: dashboardData.total_ads,
      totalViews: dashboardData.total_views,
      totalContacts: dashboardData.total_contacts,
      activeAds: dashboardData.active_ads,
      pendingAds: dashboardData.pending_ads,
      featuredAds: dashboardData.featured_ads,
      conversionRate,
      expiredAds: userAds.filter((ad) => ad.status === "expired").length,
    };
  }, [dashboardData, userAds]);

  // Top performing ads
  const topPerformingAds = useMemo(() => {
    return [...userAds]
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 5);
  }, [userAds]);

  // Promotable ads
  const promotableAds = useMemo(() => {
    return userAds.filter(
      (ad) => ad.plan !== "featured" && ad.status === "approved"
    );
  }, [userAds]);

  // Simulated recent activity
  const recentActivity = useMemo(() => {
    const activities: Array<{
      type: string;
      message: string;
      created_at: string;
    }> = [];

    [...userAds]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 5)
      .forEach((ad) => {
        activities.push({
          type: "ad_created",
          message: `Created ad "${ad.title}"`,
          created_at: ad.created_at,
        });

        if (ad.status === "approved") {
          activities.push({
            type: "ad_approved",
            message: `Ad "${ad.title}" was approved`,
            created_at: ad.updated_at || ad.created_at,
          });
        }

        if (ad.plan === "featured") {
          activities.push({
            type: "ad_featured",
            message: `Ad "${ad.title}" was promoted to featured`,
            created_at: ad.updated_at || ad.created_at,
          });
        }
      });

    return activities
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 10);
  }, [userAds]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Ads */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Ads</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalAds.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.activeAds} active, {stats.pendingAds} pending
              </p>
            </div>
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalViews.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {(stats.totalViews / Math.max(stats.totalAds, 1)).toFixed(1)}{" "}
                avg per ad
              </p>
            </div>
          </div>
        </div>

        {/* Total Contacts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Contacts</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalContacts.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.conversionRate.toFixed(1)}% conversion rate
              </p>
            </div>
          </div>
        </div>

        {/* Featured Ads */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Featured Ads</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.featuredAds}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ${(stats.featuredAds * 9.99).toFixed(2)} invested
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Ads */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Performing Ads
          </h3>
          <div className="space-y-3">
            {topPerformingAds.length > 0 ? (
              topPerformingAds.map((ad) => (
                <div
                  key={ad.id}
                  className="flex items-center justify-between py-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {ad.primary_image?.image && (
                      <img
                        src={ad.primary_image.image}
                        alt={ad.title}
                        className="w-12 h-12 rounded-lg object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {ad.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {ad.category?.name} • {ad.city?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right min-w-[54px]">
                    <p className="text-sm font-semibold text-gray-900">
                      {(ad.view_count || 0).toLocaleString()} views
                    </p>
                    <p className="text-xs text-gray-500">
                      {ad.contact_views || 0} contacts
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No ads yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start by creating your first ad to see performance data.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setShowPostAdModal(true)}
                  className="inline-flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Ad
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <Clock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMyAds = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between md:items-center flex-col md:flex-row gap-y-4 md:gap-y-0">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">My Ads</h3>
          <p className="text-sm text-gray-600">
            Manage and track your {userAds.length} ads
          </p>
        </div>
        <div className="flex gap-3 self-end md:self-auto">
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowPostAdModal(true)}
            className="inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Ad
          </Button>
        </div>
      </div>

      {/* Ads Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoadingAds ? (
          <div className="p-8 text-center">
            <LoadingSpinner size="medium" text="Loading your ads..." />
          </div>
        ) : userAds.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ad Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userAds.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 min-w-[312px]">
                      <div className="flex items-center">
                        {ad.primary_image?.image && (
                          <img
                            src={ad.primary_image.image}
                            alt={ad.title}
                            className="w-16 h-16 rounded-lg object-cover mr-4"
                            loading="lazy"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                            {ad.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {ad.category?.name} • {ad.city?.name}
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {ad.display_price}
                          </p>
                          {ad.plan === "featured" && (
                            <Badge variant="primary" size="sm" className="mt-1">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center text-gray-900">
                          <Eye className="h-4 w-4 mr-1 text-gray-400" />
                          {(ad.view_count || 0).toLocaleString()} views
                        </div>
                        <div className="flex items-center text-gray-600 mt-1">
                          <MessageCircle className="h-4 w-4 mr-1 text-gray-400" />
                          {ad.contact_views || 0} contacts
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {ad.time_since_posted || "Recently posted"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusColor(ad.status)} size="sm">
                        {getStatusText(ad.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/ads/${ad.slug}`}
                          className="text-gray-600 hover:text-orange-600 p-1 rounded"
                          title="View Ad"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/ads/${ad.slug}/edit`}
                          className="text-gray-600 hover:text-orange-600 p-1 rounded"
                          title="Edit Ad"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteAd(ad.id, ad.slug)}
                          className="text-red-600 hover:text-red-700 p-1 rounded"
                          title="Delete Ad"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No ads yet
            </h3>
            <p className="text-gray-600 mb-6">
              You haven't created any ads yet. Start by posting your first ad.
            </p>
            <Button
              variant="primary"
              onClick={() => setShowPostAdModal(true)}
              className="inline-flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Create Your First Ad
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Detailed Statistics
      </h3>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">
          Performance Overview
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
              {stats.conversionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Conversion Rate</div>
            <div className="flex items-center justify-center text-sm text-green-600 mt-1">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>
                {stats.conversionRate >= 5
                  ? "Excellent"
                  : stats.conversionRate >= 2
                  ? "Good"
                  : "Needs improvement"}
              </span>
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.totalViews > 0
                ? (stats.totalViews / Math.max(stats.totalAds, 1)).toFixed(0)
                : 0}
            </div>
            <div className="text-sm text-gray-600">Avg Views per Ad</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
              {stats.totalContacts > 0
                ? (stats.totalContacts / Math.max(stats.totalAds, 1)).toFixed(1)
                : 0}
            </div>
            <div className="text-sm text-gray-600">Avg Contacts per Ad</div>
          </div>
        </div>
      </div>

      {/* Individual Ad Performance */}
      {userAds.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="text-md font-semibold text-gray-900">
              Individual Ad Performance
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ad Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversion Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userAds.map((ad) => {
                  const adConversionRate =
                    (ad.view_count || 0) > 0
                      ? ((ad.contact_views || 0) / (ad.view_count || 0)) * 100
                      : 0;

                  return (
                    <tr key={ad.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {ad.primary_image?.image && (
                            <img
                              src={ad.primary_image.image}
                              alt={ad.title}
                              className="w-10 h-10 rounded-lg object-cover mr-3"
                              loading="lazy"
                            />
                          )}
                          <div className="text-sm min-w-32">
                            <div className="font-medium text-gray-900 line-clamp-2">
                              {ad.title}
                            </div>
                            <div className="text-gray-500">
                              {ad.display_price}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {(ad.view_count || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {ad.contact_views || 0}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`font-medium ${
                            adConversionRate >= 5
                              ? "text-green-600"
                              : adConversionRate >= 2
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {adConversionRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusColor(ad.status)} size="sm">
                          {getStatusText(ad.status)}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            No statistics available. Create your first ad to start tracking
            performance.
          </p>
        </div>
      )}
    </div>
  );

  const renderPromoteAds = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Promote Your Ads
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Feature your ads to get more visibility and reach potential buyers
          faster.
        </p>
      </div>

      {/* Promotion Benefits */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Star className="h-6 w-6 text-orange-600 mr-2" />
          <h4 className="text-lg font-semibold text-gray-900">
            Featured Ad Benefits
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
            <span>Up to 10x more views</span>
          </div>
          <div className="flex items-center">
            <Eye className="h-4 w-4 text-blue-600 mr-2" />
            <span>Priority in search results</span>
          </div>
          <div className="flex items-center">
            <MessageCircle className="h-4 w-4 text-purple-600 mr-2" />
            <span>Highlighted listing design</span>
          </div>
        </div>
        <div className="mt-4 text-lg font-semibold text-gray-900">
          Only $9.99 per ad for 30 days
        </div>
      </div>

      {/* Promotable Ads */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-md font-semibold text-gray-900">
            Ads Available for Promotion
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            {promotableAds.length} ads can be promoted to featured status
          </p>
        </div>

        {promotableAds.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {promotableAds.map((ad) => (
              <div key={ad.id} className="p-6">
                <div className="flex md:items-center justify-between flex-col md:flex-row gap-y-4 md:gap-y-0 ">
                  <div className="flex items-center space-x-4">
                    {ad.primary_image?.image && (
                      <img
                        src={ad.primary_image.image}
                        alt={ad.title}
                        className="w-16 h-16 rounded-lg object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {ad.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {ad.category?.name} • {ad.city?.name}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-xs text-gray-500">
                          {(ad.view_count || 0).toLocaleString()} views •{" "}
                          {ad.contact_views || 0} contacts
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {ad.display_price}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handlePromoteAd(ad.slug)}
                    className="ml-4 inline-flex items-center gap-2 self-end md:self-auto"
                  >
                    <Star className="h-4 w-4" />
                    Promote - $9.99
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No ads available for promotion
            </h3>
            <p className="text-gray-600 mb-6">
              {userAds.length === 0
                ? "You don't have any ads yet. Create your first ad to get started."
                : "All your active ads are already featured or you don't have any active ads."}
            </p>
            {userAds.length === 0 && (
              <Button
                variant="primary"
                onClick={() => setShowPostAdModal(true)}
                className="inline-flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Create Your First Ad
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Featured Ads Summary */}
      {stats.featuredAds > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            Your Featured Ads
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-1">
                {stats.featuredAds}
              </div>
              <div className="text-sm text-gray-600">Active Featured Ads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                ${(stats.featuredAds * 9.99).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total Investment</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-1">
                {userAds
                  .filter((ad) => ad.plan === "featured")
                  .reduce((sum, ad) => sum + (ad.view_count || 0), 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Featured Ad Views</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: "overview", name: "Overview", icon: BarChart3 },
    { id: "ads", name: "My Ads", icon: Edit },
    { id: "stats", name: "Statistics", icon: TrendingUp },
    { id: "promote", name: "Promote Ads", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.first_name || user?.email?.split("@")[0]}
              </h1>
              <p className="text-gray-600">
                Manage your ads and track performance
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="text-red-600 hover:text-red-700 text-sm underline ml-4"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav
              className="flex gap-x-8 flex-wrap px-6"
              aria-label="Dashboard Tabs"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <main className="tab-content">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "ads" && renderMyAds()}
          {activeTab === "stats" && renderStats()}
          {activeTab === "promote" && renderPromoteAds()}
        </main>
      </div>

      {/* Post Ad Modal Integration */}
      {/* {showPostAdModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Create New Ad
            </h3>
            <p className="text-gray-600 mb-6">
              This will open the post ad modal. Click the "Post Ad" button in
              the header to create a new advertisement.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowPostAdModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowPostAdModal(false);
                  // This would trigger the actual PostAdModal from App.tsx
                  window.dispatchEvent(new CustomEvent("openPostAdModal"));
                }}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )} */}

      {showPostAdModal && (
        <PostAdModal
          onClose={() => setShowPostAdModal(false)}
          onSuccess={handlePostAdSuccess}
          isOpen={showPostAdModal}
        />
      )}
    </div>
  );
};

export default UserDashboard;
