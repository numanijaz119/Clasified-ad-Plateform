// BaseModal.tsx
import { createPortal } from "react-dom";
import { useEffect, ReactNode } from "react";

interface PortalProps {
  children: ReactNode;
  containerId?: string;
}

const Portal = ({ children, containerId = "modal-root" }: PortalProps) => {
  useEffect(() => {
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      document.body.appendChild(container);
    }
  }, [containerId]);

  const container = document.getElementById(containerId);
  return container ? createPortal(children, container) : null;
};

export default Portal;
export type { PortalProps };
