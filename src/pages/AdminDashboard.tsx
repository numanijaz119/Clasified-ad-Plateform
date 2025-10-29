// src/pages/AdminDashboard.tsx

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChart3,
  FileText,
  Users,
  Settings,
  DollarSign,
  Image,
  TrendingUp,
  Flag,
  MapPin,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

// Import tab components (we'll create these next)
import OverviewTab from "../components/admin/OverviewTab";
import PostsReviewTab from "../components/admin/PostsReviewTab";
import UsersTab from "../components/admin/UsersTab";
import ReportsTab from "../components/admin/ReportsTab";
import CategoriesTab from "../components/admin/CategoriesTab";
import AnalyticsTab from "../components/admin/AnalyticsTab";
import BannersTab from "../components/admin/BannersTab";
import CitiesTab from "../components/admin/CitiesTab";
import StatesTab from "../components/admin/StatesTab";
import SettingsTab from "../components/admin/SettingsTab";
import EarningsTab from "../components/admin/EarningTab";

type TabId =
  | "overview"
  | "posts"
  | "users"
  | "reports"
  | "categories"
  | "cities"
  | "states"
  | "settings"
  | "earnings"
  | "analytics"
  | "banners";

interface Tab {
  id: TabId;
  name: string;
  icon: typeof BarChart3;
}

const tabs: Tab[] = [
  { id: "overview", name: "Overview", icon: BarChart3 },
  { id: "analytics", name: "Analytics", icon: TrendingUp },
  { id: "earnings", name: "Earnings", icon: DollarSign },
  
  { id: "posts", name: "Posts Review", icon: FileText },
  { id: "users", name: "Users", icon: Users },
  { id: "reports", name: "Reports", icon: Flag },
  
  { id: "categories", name: "Categories", icon: Settings },
  { id: "cities", name: "Cities", icon: MapPin },
  { id: "states", name: "States", icon: MapPin },
  
  { id: "banners", name: "Banner Ads", icon: Image },
  { id: "settings", name: "Settings", icon: Settings },
];


const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Get active tab from URL hash
  const getActiveTabFromHash = (): TabId => {
    const hash = location.hash.replace("#", "");
    const validTab = tabs.find((t) => t.id === hash);
    return validTab ? (hash as TabId) : "overview";
  };

  const [activeTab, setActiveTab] = useState<TabId>(getActiveTabFromHash());

  // Sync tab with URL hash
  useEffect(() => {
    const newTab = getActiveTabFromHash();
    setActiveTab(newTab);
  }, [location.hash]);

  // Check if user is admin
  //   useEffect(() => {
  //     if (!user?.is_staff) {
  //       navigate("/");
  //     }
  //   }, [user, navigate]);

  const handleTabChange = (tabId: TabId) => {
    navigate(`/admin#${tabId}`, { replace: true });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "posts":
        return <PostsReviewTab />;
      case "users":
        return <UsersTab />;
      case "reports":
        return <ReportsTab />;
      case "categories":
        return <CategoriesTab />;
      case "cities":
        return <CitiesTab />;
      case "states":
        return <StatesTab />;
      case "settings":
        return <SettingsTab />;
      case "earnings":
        return <EarningsTab />;
      case "analytics":
        return <AnalyticsTab />;
      case "banners":
        return <BannersTab />;
      default:
        return <OverviewTab />;
    }
  };

  //   if (!user?.is_staff) {
  //     return null;
  //   }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage your Illinois Connect platform</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav
              className="flex gap-x-4 flex-wrap px-6"
              aria-label="Admin Tabs"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  aria-current={activeTab === tab.id ? "page" : undefined}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
