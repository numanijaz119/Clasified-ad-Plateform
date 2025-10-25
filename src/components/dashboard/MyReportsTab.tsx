// src/components/dashboard/MyReportsTab.tsx
// Version: 3.0 - Complete fix with navigation, pagination, refresh

import React, { useState, useEffect } from "react";
import { Flag, AlertCircle, CheckCircle, Clock, FileText, RefreshCw } from "lucide-react";
import { adsService } from "../../services/adsService";
import { useToast } from "../../contexts/ToastContext";
import { API_CONFIG } from "../../config/api";

interface Report {
  id: number;
  ad: number;
  ad_id: number;
  ad_title: string;
  ad_slug?: string;
  ad_image?: string;
  reason: string;
  description: string;
  created_at: string;
  is_reviewed: boolean;
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

const MyReportsTab: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
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
      const data = await adsService.getMyReports();
      
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
      setError("Failed to load your reports. Please try again.");
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner h-8 w-8"></div>
        <span className="ml-3 text-gray-600">Loading your reports...</span>
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

  // Safety check: ensure reports is an array
  const reportsArray = Array.isArray(reports) ? reports : [];
  
  console.log('🔍 MyReportsTab - reports type:', typeof reports, 'isArray:', Array.isArray(reports), 'data:', reports);

  if (reportsArray.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <Flag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Reports Submitted
        </h3>
        <p className="text-gray-600">
          You haven't reported any ads yet. If you see something that violates
          our policies, you can report it from the ad details page.
        </p>
      </div>
    );
  }

  const pendingReports = reportsArray.filter((r) => !r.is_reviewed);
  const reviewedReports = reportsArray.filter((r) => r.is_reviewed);

  // Pagination
  const totalPages = Math.ceil(reportsArray.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReports = reportsArray.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {reportsArray.length}
              </p>
            </div>
            <FileText className="h-10 w-10 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {pendingReports.length}
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
                {reviewedReports.length}
              </p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Your Reports</h3>
            <p className="text-sm text-gray-600 mt-1">
              Track the status of your submitted reports
            </p>
          </div>
          <button
            onClick={() => fetchReports(true)}
            disabled={isRefreshing}
            className="btn-ghost px-3 py-2 flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {paginatedReports.map((report) => (
            <div key={report.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex gap-4">
                {/* Ad Image */}
                <div className="flex-shrink-0">
                  {report.ad_image ? (
                    <img
                      src={report.ad_image.startsWith('http') ? report.ad_image : `${API_CONFIG.BASE_URL}${report.ad_image}`}
                      alt={report.ad_title}
                      className="w-24 h-24 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center ${report.ad_image ? 'hidden' : ''}`}>
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {report.ad_title}
                        </h4>
                        {report.is_reviewed ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Reviewed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 whitespace-nowrap">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                        <span className="flex items-center">
                          <Flag className="h-3 w-3 mr-1" />
                          {REASON_LABELS[report.reason] || report.reason}
                        </span>
                        <span>•</span>
                        <span>{formatDate(report.created_at)}</span>
                      </div>

                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                        {report.description}
                      </p>

                      {report.is_reviewed && report.admin_notes && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mt-2">
                          <p className="text-xs font-medium text-blue-900 mb-1">
                            Admin Response:
                          </p>
                          <p className="text-xs text-blue-800">{report.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, reportsArray.length)} of {reportsArray.length} reports
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

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
        <AlertCircle className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">About Reports</p>
          <ul className="list-disc list-inside space-y-1 text-blue-700">
            <li>Our team reviews all reports within 24-48 hours</li>
            <li>You'll see admin responses here once your report is reviewed</li>
            <li>False or spam reports may result in account restrictions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MyReportsTab;
