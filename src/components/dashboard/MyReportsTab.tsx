// src/components/dashboard/MyReportsTab.tsx
// Version: 2.0 - Fixed array handling

import React, { useState, useEffect } from "react";
import { Flag, AlertCircle, CheckCircle, Clock, FileText } from "lucide-react";
import { adsService } from "../../services/adsService";
import { useToast } from "../../contexts/ToastContext";

interface Report {
  id: number;
  ad: number;
  ad_id: number;
  ad_title: string;
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
  const toast = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
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
    } catch (err: any) {
      console.error("Failed to fetch reports:", err);
      setError("Failed to load your reports. Please try again.");
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
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
            onClick={fetchReports}
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
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Your Reports</h3>
          <p className="text-sm text-gray-600 mt-1">
            Track the status of your submitted reports
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {reportsArray.map((report) => (
            <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {report.ad_title}
                    </h4>
                    {report.is_reviewed ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Reviewed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center">
                      <Flag className="h-4 w-4 mr-1" />
                      {REASON_LABELS[report.reason] || report.reason}
                    </span>
                    <span>•</span>
                    <span>{formatDate(report.created_at)}</span>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">
                    {report.description}
                  </p>

                  {report.is_reviewed && report.admin_notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        Admin Response:
                      </p>
                      <p className="text-sm text-blue-800">{report.admin_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
