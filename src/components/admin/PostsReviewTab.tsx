// src/components/admin/PostsReviewTab.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCw,
  Check,
  X,
  Star,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  DollarSign,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { adminService, contentService } from "../../services";
import {
  AdminAd,
  AdminAdListParams,
  AdminAdActionRequest,
} from "../../types/admin";
import { AdStatus } from "../../types/ads";
import ConfirmModal from "./ConfirmModal";
import BaseModal from "../modals/BaseModal";
import Button from "../ui/Button";

interface ConfirmState {
  isOpen: boolean;
  type: "approve" | "reject" | "delete" | "feature" | "unfeature" | null;
  adId: number | null;
}

const PostsReviewTab: React.FC = () => {
  const [ads, setAds] = useState<AdminAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAd, setSelectedAd] = useState<AdminAd | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Confirmation modal state
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    type: null,
    adId: null,
  });

  // Filters
  const [filters, setFilters] = useState<AdminAdListParams>({
    page: 1,
    page_size: 20,
    status: "pending",
    ordering: "-created_at",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearch, setTempSearch] = useState("");

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminService.getAds(filters);
      setAds(response.results);
      setTotalCount(response.count);
      setTotalPages(Math.ceil(response.count / (filters.page_size || 20)));
    } catch (err: any) {
      setError(err.message || "Failed to load ads");
      console.error("Failed to fetch ads:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch states
  const fetchStates = useCallback(async () => {
    try {
      const statesData = await contentService.getStates();
      setStates(statesData.filter((s) => s.is_active));
    } catch (err) {
      console.error("Failed to fetch states:", err);
    }
  }, []);

  useEffect(() => {
    fetchAds();
    fetchStates();
  }, [fetchAds, fetchStates]);

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: tempSearch || undefined,
      page: 1,
    }));
    setSearchQuery(tempSearch);
  };

  const handleFilterChange = (key: keyof AdminAdListParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRefresh = () => {
    fetchAds();
    fetchStates();
  };

  const performAction = async (
    adId: number,
    action: AdminAdActionRequest["action"],
    reason?: string
  ) => {
    try {
      setActionLoading(adId);
      await adminService.performAdAction(adId, { action, reason });

      // Refresh the list
      await fetchAds();

      // Close modal if open
      if (selectedAd?.id === adId) {
        setSelectedAd(null);
      }

      // Close confirm modal
      setConfirmState({ isOpen: false, type: null, adId: null });
    } catch (err: any) {
      setError(err.message || `Failed to ${action} ad`);
    } finally {
      setActionLoading(null);
    }
  };

  const openConfirmModal = (type: ConfirmState["type"], adId: number) => {
    setConfirmState({ isOpen: true, type, adId });
  };

  const handleConfirm = (reason?: string) => {
    if (confirmState.adId && confirmState.type) {
      performAction(confirmState.adId, confirmState.type, reason);
    }
  };

  const getConfirmConfig = () => {
    switch (confirmState.type) {
      case "approve":
        return {
          title: "Approve Ad",
          message:
            "Are you sure you want to approve this ad? It will be visible to all users.",
          confirmText: "Approve",
          type: "success" as const,
        };
      case "reject":
        return {
          title: "Reject Ad",
          message:
            "Are you sure you want to reject this ad? Please provide a reason.",
          confirmText: "Reject",
          type: "warning" as const,
          requireReason: true,
        };
      case "delete":
        return {
          title: "Delete Ad",
          message:
            "Are you sure you want to delete this ad? This action cannot be undone.",
          confirmText: "Delete",
          type: "danger" as const,
        };
      case "feature":
        return {
          title: "Feature Ad",
          message:
            "Are you sure you want to feature this ad? It will appear prominently on the site.",
          confirmText: "Feature",
          type: "info" as const,
        };
      case "unfeature":
        return {
          title: "Remove Featured Status",
          message:
            "Are you sure you want to remove the featured status from this ad?",
          confirmText: "Remove",
          type: "warning" as const,
        };
      default:
        return {
          title: "Confirm Action",
          message: "Are you sure you want to perform this action?",
          confirmText: "Confirm",
          type: "warning" as const,
        };
    }
  };

  const handleApprove = (adId: number) => openConfirmModal("approve", adId);
  const handleReject = (adId: number) => openConfirmModal("reject", adId);
  const handleDelete = (adId: number) => openConfirmModal("delete", adId);
  const handleFeature = (adId: number) => openConfirmModal("feature", adId);
  const handleUnfeature = (adId: number) => openConfirmModal("unfeature", adId);

  const getStatusBadge = (status: AdStatus) => {
    const styles: Record<AdStatus, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      draft: "bg-gray-100 text-gray-800",
      expired: "bg-gray-100 text-gray-600",
      sold: "bg-blue-100 text-blue-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading && ads.length === 0) {
    return (
      <>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Posts Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {totalCount} total ads found
            </p>
          </div>
          <button
            onClick={() => handleRefresh()}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 text-orange-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading ads...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Posts Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {totalCount} total ads found
          </p>
        </div>
        <button
          onClick={() => handleRefresh()}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={tempSearch}
                  onChange={(e) => setTempSearch(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search by title, description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status || "all"}
              onChange={(e) =>
                handleFilterChange(
                  "status",
                  e.target.value === "all" ? undefined : e.target.value
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* State Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <select
              value={filters.state || "all"}
              onChange={(e) =>
                handleFilterChange(
                  "state",
                  e.target.value === "all" ? undefined : e.target.value
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All States</option>
              {states.map((state) => (
                <option key={state.id} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Featured Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan
            </label>
            <select
              value={filters.is_featured === true ? "featured" : "all"}
              onChange={(e) =>
                handleFilterChange(
                  "is_featured",
                  e.target.value === "featured" ? true : undefined
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Plans</option>
              <option value="featured">Featured Only</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={filters.ordering || "-created_at"}
              onChange={(e) => handleFilterChange("ordering", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="-created_at">Newest First</option>
              <option value="created_at">Oldest First</option>
              <option value="title">Title A-Z</option>
              <option value="-title">Title Z-A</option>
              <option value="-view_count">Most Viewed</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({
                  page: 1,
                  page_size: 20,
                  status: "pending",
                  ordering: "-created_at",
                });
                setTempSearch("");
                setSearchQuery("");
              }}
              className="w-full px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <div className="flex-1">
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={() => fetchAds()}
              className="ml-4 text-red-600 hover:text-red-700 underline text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Ads Table */}
      {ads.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No ads found</p>
          <p className="text-sm text-gray-500">
            Try adjusting your filters or search query
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ad Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ads.map((ad, index) => (
                  <tr
                    key={ad.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="pl-5 !pr-0 py-4">
                      <span className="text-sm font-medium text-gray-500">
                        {(currentPage - 1) * (filters.page_size || 20) +
                          index +
                          1}
                      </span>
                    </td>
                    <td className="px-6 !pl-0 py-4">
                      <div className="flex items-start space-x-3">
                        {ad.primary_image ? (
                          <img
                            src={ad.primary_image.image}
                            alt={ad.title}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <button
                            onClick={() => setSelectedAd(ad)}
                            className="font-medium text-gray-900 hover:text-orange-600 text-left line-clamp-2"
                          >
                            {ad.title}
                          </button>
                          <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                            <span>{ad.category_name}</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {ad.days_ago === 0
                                ? "Today"
                                : ad.days_ago === 1
                                ? "Yesterday"
                                : `${ad.days_ago} days ago`}
                            </span>
                          </div>
                          {ad.plan === "featured" && (
                            <div className="mt-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <div>
                          <div>{ad.city_name}</div>
                          <div className="text-xs text-gray-500">
                            {ad.state_code}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm">
                        {ad.plan === "free" &&
                        (!ad.price || parseFloat(ad.price) === 0) ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-semibold">
                            FREE
                          </span>
                        ) : (
                          <>
                            <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="font-medium text-gray-900">
                              ${parseFloat(ad.price).toFixed(2)}
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(ad.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3 text-xs text-gray-600">
                        <div className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          <span>{ad.view_count}</span>
                        </div>
                        {ad.images && ad.images.length > 0 && (
                          <div className="flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            <span>{ad.images.length}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {ad.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(ad.id)}
                              disabled={actionLoading === ad.id}
                              className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReject(ad.id)}
                              disabled={actionLoading === ad.id}
                              className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {ad.status === "approved" && (
                          <>
                            {ad.plan === "featured" ? (
                              <button
                                onClick={() => handleUnfeature(ad.id)}
                                disabled={actionLoading === ad.id}
                                className="p-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition-colors disabled:opacity-50"
                                title="Remove Featured"
                              >
                                <Star className="h-4 w-4 fill-current" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleFeature(ad.id)}
                                disabled={actionLoading === ad.id}
                                className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors disabled:opacity-50"
                                title="Make Featured"
                              >
                                <Star className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        )}
                        <button
                          onClick={() => setSelectedAd(ad)}
                          className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ad.id)}
                          disabled={actionLoading === ad.id}
                          className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors disabled:opacity-50"
                          title="Delete"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * (filters.page_size || 20) + 1} to{" "}
                  {Math.min(
                    currentPage * (filters.page_size || 20),
                    totalCount
                  )}{" "}
                  of {totalCount} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? "bg-orange-500 text-white"
                              : "border border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ad Details Modal */}
      {selectedAd && (
        <AdDetailsModal
          ad={selectedAd}
          onClose={() => setSelectedAd(null)}
          onApprove={() => handleApprove(selectedAd.id)}
          onReject={() => handleReject(selectedAd.id)}
          onDelete={() => handleDelete(selectedAd.id)}
          onFeature={() => handleFeature(selectedAd.id)}
          onUnfeature={() => handleUnfeature(selectedAd.id)}
          actionLoading={actionLoading === selectedAd.id}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() =>
          setConfirmState({ isOpen: false, type: null, adId: null })
        }
        onConfirm={handleConfirm}
        loading={actionLoading !== null}
        {...getConfirmConfig()}
      />
    </div>
  );
};

// Ad Details Modal Component
interface AdDetailsModalProps {
  ad: AdminAd;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  onFeature: () => void;
  onUnfeature: () => void;
  actionLoading: boolean;
}

const AdDetailsModal: React.FC<AdDetailsModalProps> = ({
  ad,
  onClose,
  onApprove,
  onReject,
  onDelete,
  onFeature,
  onUnfeature,
  actionLoading,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = ad.images || [];
  const hasImages = images.length > 0;

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      maxWidth="max-w-4xl"
      title="Ad Details"
    >
      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Images */}
        {hasImages && (
          <div className="space-y-4">
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={images[currentImageIndex].image}
                alt={ad.title}
                className="w-full h-full object-contain"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex
                            ? "bg-white"
                            : "bg-white bg-opacity-50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="flex space-x-2 overflow-x-auto">
              {images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex
                      ? "border-orange-500"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={img.image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ad Info */}
        <div className="space-y-4">
          <div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">
              {ad.title}
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              {ad.status && (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    ad.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : ad.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {ad.status}
                </span>
              )}
              {ad.plan === "featured" && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Price</p>
              {ad.plan === "free" &&
              (!ad.price || parseFloat(ad.price) === 0) ? (
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm font-semibold">
                  FREE
                </span>
              ) : (
                <p className="text-lg font-semibold text-gray-900">
                  ${parseFloat(ad.price).toFixed(2)}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="text-lg font-semibold text-gray-900">
                {ad.category_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="text-lg font-semibold text-gray-900">
                {ad.city_name}, {ad.state_code}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Posted</p>
              <p className="text-lg font-semibold text-gray-900">
                {ad.days_ago === 0
                  ? "Today"
                  : ad.days_ago === 1
                  ? "Yesterday"
                  : `${ad.days_ago} days ago`}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">User</p>
              <p className="text-lg font-semibold text-gray-900">
                {ad.user_name}
              </p>
              <p className="text-xs text-gray-500">{ad.user_email}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Description</p>
            <p className="text-gray-900 whitespace-pre-wrap">
              {ad.description}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {ad.view_count}
              </p>
              <p className="text-sm text-gray-600">Views</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {ad.contact_count || 0}
              </p>
              <p className="text-sm text-gray-600">Contacts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {ad.favorite_count || 0}
              </p>
              <p className="text-sm text-gray-600">Favorites</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="flex items-center justify-end space-x-3 px-6 pb-6 border-t border-gray-200 pt-4">
        {ad.status === "pending" && (
          <>
            <Button
              variant="primary"
              onClick={onApprove}
              disabled={actionLoading}
            >
              <Check className="h-4 w-4" />
              <span>Approve</span>
            </Button>
            <Button
              variant="danger"
              onClick={onReject}
              disabled={actionLoading}
            >
              <X className="h-4 w-4" />
              <span>Reject</span>
            </Button>
          </>
        )}
        {ad.status === "approved" && (
          <>
            {ad.plan === "featured" ? (
              <Button
                variant="secondary"
                onClick={onUnfeature}
                disabled={actionLoading}
              >
                <Star className="h-4 w-4" />
                <span>Remove Featured</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={onFeature}
                disabled={actionLoading}
              >
                <Star className="h-4 w-4" />
                <span>Make Featured</span>
              </Button>
            )}
          </>
        )}
        <Button variant="danger" onClick={onDelete} disabled={actionLoading}>
          <Trash2 className="h-4 w-4" />
          <span>Delete</span>
        </Button>
      </div>
    </BaseModal>
  );
};

export default PostsReviewTab;
