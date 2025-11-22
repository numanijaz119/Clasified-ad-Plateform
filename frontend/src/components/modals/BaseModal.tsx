import { ReactNode, useEffect } from "react";
import Portal from "./Portal";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  title?: string;
}

const BaseModal = ({
  isOpen,
  onClose,
  children,
  maxWidth = "max-w-2xl",
  closeOnOverlayClick = true,
  showCloseButton = true,
  title,
}: BaseModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
        onClick={closeOnOverlayClick ? onClose : undefined}
      >
        <div
          className={`bg-white rounded-xl ${maxWidth} w-full max-h-[90vh] overflow-y-auto z-[10000]`}
          onClick={e => e.stopPropagation()}
        >
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors ml-auto"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </Portal>
  );
};

export default BaseModal;
export type { BaseModalProps };
