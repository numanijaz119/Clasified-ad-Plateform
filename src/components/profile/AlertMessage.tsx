import React from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

interface AlertMessageProps {
  type: "success" | "error";
  message: string;
  onClose?: () => void;
}

const AlertMessage: React.FC<AlertMessageProps> = ({
  type,
  message,
  onClose,
}) => {
  const isSuccess = type === "success";

  return (
    <div
      className={`${
        isSuccess
          ? "bg-green-50 border border-green-200 text-green-700"
          : "bg-red-50 border border-red-200 text-red-700"
      } px-4 py-3 rounded-lg mb-6 flex items-center justify-between`}
    >
      <div className="flex items-center space-x-2">
        {isSuccess ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500" />
        )}
        <span className="font-medium">{message}</span>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className={`${
            isSuccess
              ? "text-green-500 hover:text-green-700"
              : "text-red-500 hover:text-red-700"
          } transition-colors`}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default AlertMessage;
