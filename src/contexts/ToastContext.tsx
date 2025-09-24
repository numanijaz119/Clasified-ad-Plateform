import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  isExiting?: boolean;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, "id">) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Component
const ToastItem: React.FC<{
  toast: Toast;
  onRemove: (id: string) => void;
  index: number;
}> = ({ toast, onRemove, index }) => {
  const [isVisible, setIsVisible] = useState(false);

  const getToastStyles = () => {
    switch (toast.type) {
      case "success":
        return {
          icon: CheckCircle,
          bgColor: "bg-green-50",
          iconColor: "text-green-600",
          textColor: "text-green-800",
          borderColor: "",
        };
      case "error":
        return {
          icon: XCircle,
          bgColor: "bg-red-50",
          iconColor: "text-red-600",
          textColor: "text-red-800",
          borderColor: "",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          bgColor: "bg-yellow-50",
          iconColor: "text-yellow-600",
          textColor: "text-yellow-800",
          borderColor: "",
        };
      case "info":
        return {
          icon: Info,
          bgColor: "bg-blue-50",
          iconColor: "text-blue-600",
          textColor: "text-blue-800",
          borderColor: "",
        };
    }
  };

  const {
    icon: Icon,
    bgColor,
    iconColor,
    textColor,
    borderColor,
  } = getToastStyles();

  // Entry animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss
  useEffect(() => {
    const duration = toast.duration ?? 4000; // Use 4000 if duration is undefined
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration]);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={`
        ${bgColor} ${borderColor} rounded-lg p-4 shadow-lg mb-3 max-w-sm min-w-80
        transform transition-all duration-300 ease-out cursor-pointer
        ${
          isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }
        ${toast.isExiting ? "translate-x-full opacity-0" : ""}
      `}
      style={{
        transform: `translateY(${-index * 10}px)`,
        zIndex: 1000 - index,
      }}
      onClick={handleRemove}
    >
      <div className="flex items-start">
        <Icon className={`h-5 w-5 ${iconColor} mt-0.5 flex-shrink-0`} />
        <p className={`ml-3 text-sm font-medium ${textColor} flex-1 leading-5`}>
          {toast.message}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemove();
          }}
          className={`ml-4 text-gray-400 hover:text-gray-600 flex-shrink-0 transition-colors`}
        ></button>
      </div>
    </div>
  );
};

// Toast Container Component (Portal)
const ToastContainer: React.FC<{
  toasts: Toast[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  if (!toasts.length) return null;

  const portalRoot = document.getElementById("toast-root") || document.body;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none">
      <div className="flex flex-col-reverse space-y-reverse">
        {toasts.map((toast, index) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={onRemove} index={index} />
          </div>
        ))}
      </div>
    </div>,
    portalRoot
  );
};

// Provider Component
export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Create toast portal root on mount
  useEffect(() => {
    if (!document.getElementById("toast-root")) {
      const toastRoot = document.createElement("div");
      toastRoot.id = "toast-root";
      document.body.appendChild(toastRoot);
    }
  }, []);

  const generateId = () =>
    `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addToast = useCallback((toastData: Omit<Toast, "id">) => {
    const id = generateId();
    const toast: Toast = {
      id,
      duration: 4000, // Default 4 seconds
      ...toastData,
    };

    setToasts((prev) => {
      // Keep max 5 toasts to prevent overflow
      const newToasts = [toast, ...prev];
      return newToasts.slice(0, 5);
    });
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message: string, duration: number = 4000) => {
      addToast({ type: "success", message, duration });
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, duration: number = 6000) => {
      addToast({ type: "error", message, duration });
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, duration: number = 4000) => {
      addToast({ type: "warning", message, duration });
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, duration: number = 4000) => {
      addToast({ type: "info", message, duration });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ addToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Hook
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
