// COMPLETE ADMIN REPORTS TAB - Copy this to src/components/admin/ReportsTab.tsx
// This file contains ALL fixes: compact layout, pagination, refresh, proper action guidance, navigation

import React, { useState, useEffect } from "react";
import {
  Flag,
  AlertCircle,
  CheckCircle,
  Clock,
  Ban,
  XCircle,
  Search,
  Filter,
  FileText,
  RefreshCw,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { useToast } from "../../contexts/ToastContext";
import Badge from "../ui/Badge";
import { API_CONFIG } from "../../config/api";

interface Report {
  id: number;
  ad: {
    id: number;
    title: string;
    slug: string;
    status: string;
    image?: string;
  };
  reported_by: {
    id: number;
    email: string;
    full_name: string;
  };
  reason: string;
  description: string;
  created_at: string;
  is_reviewed: boolean;
  reviewed_by: {
    id: number;
    email: string;
  } | null;
  reviewed_at: string | null;
  admin_notes: string | null;
}

const REASON_LABELS: Record<string, string> = {
  spam: "Spam or Misleading",
  inappropriate: "Inappropriate Content",
  fraud: "Fraud or Scam",
  duplicate: "Duplicate Listing",
  wrong_category: "Wrong Category",
  other: "Other",
};

const ReportsTab: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "dismiss" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [processedReports, setProcessedReports] = useState<Set<number>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const toast = useToast();
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await adminService.getReports();
      
      // Handle paginated response
      if (data && Array.isArray(data.results)) {
        setReports(data.results);
      } else if (Array.isArray(data)) {
        setReports(data);
      } else {
        setReports([]);
      }

      if (isRefresh) {
        toast.success("Reports refreshed successfully");
      }
    } catch (err: any) {
      console.error("Failed to fetch reports:", err);
      setError("Failed to load reports. Please try again.");
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleAction = (report: Report, action: "approve" | "dismiss") => {
    setSelectedReport(report);
    setActionType(action);
    setAdminNotes("");
    setShowActionModal(true);
  };

  const submitAction = async () => {
    if (!selectedReport || !actionType) return;

    try {
      setIsSubmitting(true);
      
      await adminService.handleReport(selectedReport.id, {
        action: actionType,
        admin_notes: adminNotes.trim(),
      });

      // Mark as processed for UI feedback
      setProcessedReports(prev => new Set(prev).add(selectedReport.id));

      const actionMessage = actionType === "approve"
        ? getActionOutcome(selectedReport.reason)
        : "✓ Report dismissed - No action taken on ad";

      toast.success(actionMessage);

      // Refresh reports
      await fetchReports();
      
      // Close modal
      setShowActionModal(false);
      setSelectedReport(null);
      setActionType(null);
      setAdminNotes("");
    } catch (err: any) {
      console.error("Failed to handle report:", err);
      toast.error("Failed to process report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionOutcome = (reason: string): string => {
    switch (reason) {
      case "spam":
      case "fraud":
        return "✓ Report approved - Ad has been REJECTED";
      case "inappropriate":
        return "✓ Report approved - Ad sent back for REVIEW";
      default:
        return "✓ Report approved - Action taken";
    }
  };

  const getActionDescription = (reason: string): JSX.Element => {
    switch (reason) {
      case "spam":
      case "fraud":
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-red-900 mb-2">
              ⚠️ Action Outcome:
            </p>
            <p className="text-sm text-red-800 mb-2">
              The reported ad will be <strong>REJECTED</strong> and removed from listings.
            </p>
            <p className="text-xs text-red-700">
              The reporter will be notified of your decision.
            </p>
          </div>
        );
      case "inappropriate":
        return (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-orange-900 mb-2">
              ⚠️ Action Outcome:
            </p>
            <p className="text-sm text-orange-800 mb-2">
              The ad will be sent back to <strong>PENDING</strong> status for manual review.
            </p>
            <p className="text-xs text-orange-700">
              The reporter will be notified of your decision.
            </p>
          </div>
        );
      default:
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              ℹ️ Action Outcome:
            </p>
            <p className="text-sm text-blue-800 mb-2">
              The ad status will remain unchanged. You can add notes for the reporter.
            </p>
            <p className="text-xs text-blue-700">
              The reporter will be notified of your decision.
            </p>
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter reports
  const filteredReports = reports.filter((report) => {
    // Filter by status
    if (filter === "pending" && report.is_reviewed) return false;
    if (filter === "reviewed" && !report.is_reviewed) return false;

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        report.ad.title.toLowerCase().includes(search) ||
        report.reported_by.email.toLowerCase().includes(search) ||
        report.description.toLowerCase().includes(search)
      );
    }

    return true;
  });

  const pendingCount = reports.filter((r) => !r.is_reviewed).length;
  const reviewedCount = reports.filter((r) => r.is_reviewed).length;

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner h-8 w-8"></div>
        <span className="ml-3 text-gray-600">Loading reports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start">
        <AlertCircle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
        <div>
          <h3 className="text-red-900 font-semibold">Error Loading Reports</h3>
          <p className="text-red-700 mt-1">{error}</p>
          <button
            onClick={() => fetchReports()}
            className="mt-3 text-red-600 hover:text-red-700 underline text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {reports.length}
              </p>
            </div>
            <Flag className="h-10 w-10 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {pendingCount}
              </p>
            </div>
            <Clock className="h-10 w-10 text-orange-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reviewed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {reviewedCount}
              </p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters & Refresh */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ad title, user, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Reports</option>
              <option value="pending">Pending Only</option>
              <option value="reviewed">Reviewed Only</option>
            </select>
          </div>

          {/* Refresh Button */}
    
          <button
                   onClick={() => fetchReports(true)}
                      disabled={isRefreshing}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                      />
                      <span>Refresh</span>
                    </button>
        </div>
      </div>

      {/* Reports List */}
      {paginatedReports.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Flag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Reports Found
          </h3>
          <p className="text-gray-600">
            {searchTerm || filter !== "all"
              ? "Try adjusting your filters"
              : "No reports have been submitted yet"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="divide-y divide-gray-200">
            {paginatedReports.map((report) => {
              const isProcessed = processedReports.has(report.id);
              const actionOutcome = isProcessed ? getActionOutcome(report.reason) : null;
              
              return (
              <div
                key={report.id}
                className="p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex gap-3">
                  {/* Ad Image */}
                  <div className="flex-shrink-0">
                    {report.ad.image ? (
                      <img
                        src={report.ad.image.startsWith('http') ? report.ad.image : `${API_CONFIG.BASE_URL}${report.ad.image}`}
                        alt={report.ad.title}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center ${report.ad.image ? 'hidden' : ''}`}>
                      <FileText className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-semibold text-sm text-gray-900 truncate">
                            {report.ad.title}
                          </h4>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {/* Review Status */}
                          {report.is_reviewed ? (
                            <Badge variant="success" size="sm">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Reviewed
                            </Badge>
                          ) : (
                            <Badge variant="warning" size="sm">
                              <Clock className="h-3 w-3 mr-1" />
                              Needs Review
                            </Badge>
                          )}
                          
                          {/* Ad Status */}
                          <Badge
                            variant={
                              report.ad.status === "approved"
                                ? "success"
                                : report.ad.status === "rejected"
                                ? "error"
                                : "warning"
                            }
                            size="sm"
                          >
                            Ad: {report.ad.status.charAt(0).toUpperCase() + report.ad.status.slice(1)}
                          </Badge>
                          
                          {/* Report Reason */}
                          <Badge variant="error" size="sm">
                            <Flag className="h-3 w-3 mr-1" />
                            {REASON_LABELS[report.reason]}
                          </Badge>
                        </div>
                        
                        {/* Reporter Info */}
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-1 flex-wrap">
                          <span className="font-medium">Reported by:</span>
                          <span>{report.reported_by.full_name}</span>
                          <span>•</span>
                          <span>{formatDate(report.created_at)}</span>
                        </div>

                        <p className="text-xs text-gray-700 line-clamp-1 mb-1">
                          {report.description}
                        </p>

                        {/* Action Outcome Display */}
                        {isProcessed && actionOutcome && (
                          <div className="bg-green-50 border border-green-200 rounded p-1.5 mb-1">
                            <p className="text-xs font-medium text-green-900">
                              {actionOutcome}
                            </p>
                          </div>
                        )}

                        {report.is_reviewed && report.admin_notes && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-1.5">
                            
                            <p className="text-sm text-blue-800">Admin Notes</p>
                            <p className="text-xs text-blue-800">{report.admin_notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1.5 ml-3">
                        {!report.is_reviewed ? (
                          <>
                            <button
                              onClick={() => handleAction(report, "approve")}
                              className="btn-primary px-2 py-1 text-xs flex items-center gap-1 whitespace-nowrap"
                              title="Approve report and take action on ad"
                            >
                              <Ban className="h-3 w-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(report, "dismiss")}
                              className="btn-secondary px-2 py-1 text-xs flex items-center gap-1 whitespace-nowrap"
                              title="Dismiss report without action"
                            >
                              <XCircle className="h-3 w-3" />
                              Dismiss
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredReports.length)} of {filteredReports.length} reports
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
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
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1.5 border rounded-lg text-sm font-medium ${
                        currentPage === pageNum
                          ? "bg-orange-500 text-white border-orange-500"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedReport && (
        <div className="fixed inset-0 !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {actionType === "approve" ? "Approve Report" : "Dismiss Report"}
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Ad:</strong> {selectedReport.ad.title}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Reason:</strong>{" "}
                {REASON_LABELS[selectedReport.reason] || selectedReport.reason}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Reported by:</strong> {selectedReport.reported_by.email}
              </p>
            </div>

            {actionType === "approve" && getActionDescription(selectedReport.reason)}

            {actionType === "dismiss" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  ℹ️ Dismiss Report:
                </p>
                <p className="text-sm text-blue-800">
                  The ad will remain unchanged. You can add notes to explain your decision to the reporter.
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes {actionType === "dismiss" && "(Optional)"}
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                placeholder="Add notes about your decision..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setSelectedReport(null);
                  setActionType(null);
                  setAdminNotes("");
                }}
                disabled={isSubmitting}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={submitAction}
                disabled={isSubmitting}
                className="flex-1 btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner h-4 w-4 mr-2"></div>
                    Processing...
                  </>
                ) : (
                  `Confirm ${actionType === "approve" ? "Approval" : "Dismissal"}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
