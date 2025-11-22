import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { adminService } from "../services/adminService";
import { useAuth } from "./AuthContext";

interface Settings {
  site_name: string;
  contact_email: string;
  support_phone: string;
  allow_registration: boolean;
  require_email_verification: boolean;
  auto_approve_ads: boolean;
  featured_ad_price: number;
  featured_ad_duration_days: number;
}

interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  const refreshSettings = async () => {
    // Only fetch settings if user is authenticated and is an admin
    if (!isAuthenticated || !user?.is_staff) {
      setLoading(false);
      return;
    }

    try {
      const data = await adminService.getSettings();
      setSettings(data);
    } catch (error) {
      // Silently fail - settings are optional
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();

    // Only set up interval if user is admin
    if (isAuthenticated && user?.is_staff) {
      const interval = setInterval(refreshSettings, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?.is_staff]);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
