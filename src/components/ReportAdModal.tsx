// src/components/ReportAdModal.tsx

import React, { useState } from "react";
import { Flag, AlertCircle } from "lucide-react";
import { BaseModal } from "./modals";
import { useToast } from "../contexts/ToastContext";
import { adsService } from "../services/adsService";

interface ReportAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  adId: number;
  adTitle: string;
}

const REPORT_REASONS = [
  { value: "spam", label: "Spam or Misleading" },
  { value: "inappropriate", label: "Inappropriate Content" },
  { value: "fraud", label: "Fraud or Scam" },
  { value: "duplicate", label: "Duplicate Listing" },
  { value: "wrong_category", label: "Wrong Category" },
  { value: "other", label: "Other" },
];

const ReportAdModal: React.FC<ReportAdModalProps> = ({
  isOpen,
  onClose,
  adId,
  adTitle,
}) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      toast.error("Please select a reason for reporting");
      return;
    }

    if (!description.trim()) {
      toast.error("Please provide a description");
      return;
    }

    try {
      setIsSubmitting(true);

      await adsService.reportAd(adId, {
        reason,
        description: description.trim(),
      });

      toast.success("Report submitted successfully. We'll review it shortly.");
      
      // Reset form
      setReason("");
      setDescription("");
      onClose();
    } catch (error: any) {
      console.error("Report submission error:", error);
      
      if (error.details?.error) {
        toast.error(error.details.error);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to submit report. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("");
      setDescription("");
      onClose();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="max-w-lg"
      showCloseButton={true}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <Flag className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Report Ad</h2>
            <p className="text-sm text-gray-600 mt-1">
              Report: {adTitle}
            </p>
          </div>
        </div>

        {/* Info Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Before you report:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Make sure the ad violates our policies</li>
              <li>Provide specific details to help us review</li>
              <li>False reports may result in account suspension</li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Reason Selection */}
          <div className="mb-6">
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Reason for Reporting <span className="text-red-500">*</span>
            </label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
            >
              <option value="">Select a reason...</option>
              {REPORT_REASONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide specific details about why you're reporting this ad..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              disabled={isSubmitting}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {description.length}/500 characters
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason || !description.trim()}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="spinner h-4 w-4 mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Flag className="h-4 w-4 mr-2" />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </BaseModal>
  );
};

export default ReportAdModal;
