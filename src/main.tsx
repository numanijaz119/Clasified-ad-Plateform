import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { StateProvider } from "./contexts/StateContext";
import App from "./App.tsx";
import "./index.css";
import { ToastProvider } from "./contexts/ToastContext.tsx";
import { NotificationProvider } from "./contexts/NotificationContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <StateProvider>
        <AuthProvider>
          <SettingsProvider>
            <ToastProvider>
              <NotificationProvider>
                <App />
              </NotificationProvider>
            </ToastProvider>
          </SettingsProvider>
        </AuthProvider>
      </StateProvider>
    </BrowserRouter>
  </StrictMode>
);
