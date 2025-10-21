// src/components/messaging/NotificationBell.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useNotifications } from '../../hooks/useMessaging';
import { useNavigate } from 'react-router-dom';

const NotificationBell: React.FC = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
    setShowDropdown(false);
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsRead();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_message':
      case 'new_conversation':
        return '💬';
      case 'ad_approved':
        return '✅';
      case 'ad_rejected':
        return '❌';
      case 'ad_expired':
      case 'ad_expiring_soon':
        return '⏰';
      default:
        return '📢';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
              >
                <Check className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto scrollbar-thin">
            {loading ? (
              <div className="p-4 text-center">
                <div className="spinner h-6 w-6 mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.slice(0, 10).map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`
                      w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors
                      ${!notification.is_read ? 'bg-orange-50' : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <span className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.notification_type)}
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium text-gray-900 mb-1 ${!notification.is_read ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.time_ago}
                        </p>
                      </div>

                      {/* Unread Indicator */}
                      {!notification.is_read && (
                        <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-2"></span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  navigate('/notifications');
                  setShowDropdown(false);
                }}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;