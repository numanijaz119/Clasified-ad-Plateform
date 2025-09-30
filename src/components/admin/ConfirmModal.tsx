// src/components/admin/ConfirmModal.tsx

import React, { useState } from "react";
import { AlertTriangle, CheckCircle, Trash2, Star } from "lucide-react";
import BaseModal from "../modals/BaseModal";
import Button from "../ui/Button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "success" | "info";
  requireReason?: boolean;
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
  requireReason = false,
  loading = false,
}) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      return;
    }
    onConfirm(requireReason ? reason : undefined);
    setReason("");
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  const typeConfig = {
    danger: {
      icon: Trash2,
      iconColor: "text-red-600",
      iconBg: "bg-red-100",
      buttonVariant: "danger" as const,
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-yellow-600",
      iconBg: "bg-yellow-100",
      buttonVariant: "primary" as const,
    },
    success: {
      icon: CheckCircle,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
      buttonVariant: "primary" as const,
    },
    info: {
      icon: Star,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      buttonVariant: "primary" as const,
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="max-w-md"
      closeOnOverlayClick={!loading}
      showCloseButton={false}
    >
      {/* Header with Icon */}
      <div className="flex items-center space-x-3 p-6 border-b border-gray-200">
        <div
          className={`w-10 h-10 ${config.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}
        >
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <p className="text-gray-600">{message}</p>

        {requireReason && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              disabled={loading}
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 px-6 pb-6">
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant={config.buttonVariant}
          onClick={handleConfirm}
          disabled={loading || (requireReason && !reason.trim())}
        >
          {loading ? "Processing..." : confirmText}
        </Button>
      </div>
    </BaseModal>
  );
};

export default ConfirmModal;
