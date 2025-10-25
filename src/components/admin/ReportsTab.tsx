// src/components/admin/ReportsTab.tsx

import React, { useState, useEffect } from "react";
import {
  Flag,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Ban,
  XCircle,
  Search,
  Filter,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { useToast } from "../../contexts/ToastContext";
import Badge from "../ui/Badge";

interface Report {
  id: number;
  ad: {
    id: number;
    title: string;
    slug: string;
    status: string;
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
  const toast = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
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
    } catch (err: any) {
      console.error("Failed to fetch reports:", err);
      setError("Failed to load reports. Please try again.");
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
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

      toast.success(
        actionType === "approve"
          ? "Report approved and action taken"
          : "Report dismissed"
      );

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
            onClick={fetchReports}
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

      {/* Filters */}
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
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
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
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {report.ad.title}
                      </h4>
                      {report.is_reviewed ? (
                        <Badge variant="success" size="sm">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Reviewed
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Reported by:</span>{" "}
                        {report.reported_by.full_name} ({report.reported_by.email})
                      </div>
                      <div>
                        <span className="font-medium">Reason:</span>{" "}
                        {REASON_LABELS[report.reason] || report.reason}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span>{" "}
                        {formatDate(report.created_at)}
                      </div>
                      <div>
                        <span className="font-medium">Ad Status:</span>{" "}
                        <Badge
                          variant={
                            report.ad.status === "approved"
                              ? "success"
                              : report.ad.status === "rejected"
                              ? "danger"
                              : "warning"
                          }
                          size="sm"
                        >
                          {report.ad.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Description:
                      </p>
                      <p className="text-sm text-gray-600">{report.description}</p>
                    </div>

                    {report.is_reviewed && report.admin_notes && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          Admin Notes:
                        </p>
                        <p className="text-sm text-blue-800">{report.admin_notes}</p>
                        {report.reviewed_by && (
                          <p className="text-xs text-blue-600 mt-2">
                            Reviewed by {report.reviewed_by.email} on{" "}
                            {formatDate(report.reviewed_at!)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {!report.is_reviewed && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleAction(report, "approve")}
                      className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                      <Ban className="h-4 w-4" />
                      Approve & Take Action
                    </button>
                    <button
                      onClick={() => handleAction(report, "dismiss")}
                      className="flex-1 btn-secondary flex items-center justify-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Dismiss Report
                    </button>
                    <a
                      href={`/ad/${report.ad.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost px-4 flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Ad
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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

            {actionType === "approve" && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-orange-800">
                  <strong>Action:</strong> The ad will be rejected based on the
                  report reason. The reporter will be notified.
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
