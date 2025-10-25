import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  User,
  Plus,
  Bell,
  MessageCircle,
  ChevronDown,
  LogOut,
  UserCircle,
  Settings,
  BarChart3,
  Shield,
} from "lucide-react";
import { Button } from "./";
import { useAuth } from "../contexts/AuthContext";
import { NotificationBell, MessageIcon } from './messaging';

/**
 * Normalizes avatar URL to ensure it's absolute and includes cache-busting
 * This fixes the issue where updated avatars don't load due to browser caching
 */
const normalizeAvatarUrl = (avatar: string | undefined): string | null => {
  if (!avatar) return null;

  // If it's already a full URL (http:// or https://)
  if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
    // Add timestamp to bust cache
    return `${avatar}?v=${Date.now()}`;
  }

  // If it's a relative path (/media/avatars/...)
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  // Remove leading slash if present to avoid double slashes
  const cleanPath = avatar.startsWith("/") ? avatar : `/${avatar}`;
  return `${baseUrl}${cleanPath}?v=${Date.now()}`;
};

interface HeaderProps {
  onPostAd: () => void;
  onSignIn: () => void;
  isLoggedIn: boolean;
  onSignOut: () => void;
  user: any;
}

const Header: React.FC<HeaderProps> = ({
  onPostAd,
  onSignIn,
  isLoggedIn,
  onSignOut,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user } = useAuth();

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleSignOut = () => {
    setIsProfileDropdownOpen(false);
    onSignOut();
  };

  return (
    <header className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <div className="flex-shrink-0 flex items-center">
                <img
                  src="/DesiloginILlogo.webp"
                  className="h-16 w-auto object-contain hover:opacity-90 transition-opacity"
                  alt="DesiLogin Logo"
                />
                <div
                  className="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3"
                  style={{ display: "none" }}
                >
                  <span className="text-white font-bold text-3xl">DL</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Global Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            {/* Your existing search implementation can go here */}
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                {/* Post Ad Button - Desktop only */}
                <Button
                  onClick={onPostAd}
                  variant="primary"
                  className="hidden sm:flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Post Ad</span>
                </Button>

                {/* Notification & Chat Icons - Always visible when logged in */}
                <div className="flex items-center space-x-2">
                  {/* Notifications */}
                  <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                  <NotificationBell />
              
                  </button>

                  {/* Chat/Messages */}
                  <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                   <MessageIcon />
                  </button>
                </div>

                {/* Profile Section - Desktop only */}
                <div className="relative hidden md:block">
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {/* Profile Avatar */}
                    <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                      {normalizeAvatarUrl(user?.avatar) ? (
                        <img
                          src={normalizeAvatarUrl(user.avatar)!}
                          alt={user.full_name || user.first_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // If image fails to load, hide it and show fallback
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-500">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>

                    {/* User Name */}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user?.full_name ||
                          `${user?.first_name} ${user?.last_name}` ||
                          "User"}
                      </p>
                    </div>

                    {/* Dropdown Arrow */}
                    <ChevronDown
                      className={`h-4 w-4 text-gray-500 transition-transform ${
                        isProfileDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <UserCircle className="h-4 w-4 mr-3" />
                        My Profile
                      </Link>

                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <BarChart3 className="h-5 w-5 mr-3" />
                        Dashboard
                      </Link>

                      {/* Admin Dashboard Link - Only show for admin users */}
                      {(user?.is_staff || user?.is_superuser) && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <Shield className="h-5 w-5 mr-3" />
                          Admin Panel
                        </Link>
                      )}

                      {/* <Link
                        to="/settings"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </Link> */}

                      <div className="border-t border-gray-100"></div>

                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Post Ad Button for non-logged in users */}
                <Button
                  onClick={onPostAd}
                  variant="primary"
                  className="hidden sm:flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Post Ad</span>
                </Button>

                {/* Sign In Button - Hidden on mobile when not logged in */}
                <Button
                  onClick={onSignIn}
                  variant="outline"
                  className="hidden md:block"
                >
                  Sign In
                </Button>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
              >
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {isLoggedIn ? (
                <>
                  {/* Mobile Profile Section */}
                  <div className="flex items-center space-x-3 px-3 py-3 bg-gray-50 rounded-lg mb-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.full_name || user.first_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-500">
                          <User className="w-7 h-7 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.full_name ||
                          `${user?.first_name} ${user?.last_name}` ||
                          "User"}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>

                  {/* Mobile Navigation Links */}
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    <UserCircle className="h-5 w-5 mr-3" />
                    My Profile
                  </Link>

                  <Link
                    to="/dashboard"
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <BarChart3 className="h-5 w-5 mr-3" />
                    Dashboard
                  </Link>

                  {/* Admin Panel Link - Only show for admin users */}
                  {(user?.is_staff || user?.is_superuser) && (
                    <Link
                      to="/admin"
                      className="flex items-center px-3 py-2 text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Shield className="h-5 w-5 mr-3" />
                      Admin Panel
                    </Link>
                  )}

                  {/* <Link
                    to="/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    Settings
                  </Link> */}

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onPostAd();
                    }}
                    className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    <Plus className="h-5 w-5 mr-3" />
                    Post Ad
                  </button>

                  <div className="border-t border-gray-200 my-2"></div>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onPostAd();
                    }}
                    className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    <Plus className="h-5 w-5 mr-3" />
                    Post Ad
                  </button>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onSignIn();
                    }}
                    className="flex items-center w-full px-3 py-2 text-base font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-md"
                  >
                    <User className="h-5 w-5 mr-3" />
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Click outside to close dropdown */}
        {isProfileDropdownOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsProfileDropdownOpen(false)}
          />
        )}
      </div>
    </header>
  );
};

export default Header;
