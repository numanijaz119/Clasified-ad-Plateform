// src/contexts/NotificationContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { messagingService } from '../services/messagingService';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  unreadMessageCount: number;
  unreadNotificationCount: number;
  refreshUnreadCounts: () => Promise<void>;
  markMessagesAsRead: (conversationId: number) => void;
  playNotificationSound: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => {
        console.log('Could not play notification sound:', err);
      });
    }
  }, []);

  const refreshUnreadCounts = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadMessageCount(0);
      setUnreadNotificationCount(0);
      return;
    }

    try {
      // Fetch both counts in parallel
      const [messageCount, notificationCount] = await Promise.all([
        messagingService.getUnreadCount(),
        messagingService.getUnreadNotificationsCount(),
      ]);

      // Only show toast notifications after initialization to prevent duplicates
      if (isInitialized) {
        // Check for new messages
        if (messageCount > lastMessageCount && lastMessageCount > 0) {
          const newMessages = messageCount - lastMessageCount;
          toast.info(`You have ${newMessages} new message${newMessages > 1 ? 's' : ''}`);
          playNotificationSound();
        }

        // Check for new notifications
        if (notificationCount > lastNotificationCount && lastNotificationCount > 0) {
          const newNotifications = notificationCount - lastNotificationCount;
          toast.info(`You have ${newNotifications} new notification${newNotifications > 1 ? 's' : ''}`);
          playNotificationSound();
        }
      } else {
        // Mark as initialized after first fetch
        setIsInitialized(true);
      }

      setUnreadMessageCount(messageCount);
      setUnreadNotificationCount(notificationCount);
      setLastMessageCount(messageCount);
      setLastNotificationCount(notificationCount);
    } catch (error) {
      console.error('Failed to fetch unread counts:', error);
    }
  }, [isAuthenticated, isInitialized, lastMessageCount, lastNotificationCount, toast, playNotificationSound]);

  const markMessagesAsRead = useCallback((conversationId: number) => {
    // Optimistically update the count
    setUnreadMessageCount(prev => Math.max(0, prev - 1));
    setLastMessageCount(prev => Math.max(0, prev - 1));
  }, []);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      refreshUnreadCounts();
    }
  }, [isAuthenticated]);

  // Poll for updates every 10 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refreshUnreadCounts();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshUnreadCounts]);

  // Refresh on visibility change (when user returns to tab)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshUnreadCounts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, refreshUnreadCounts]);

  const value = {
    unreadMessageCount,
    unreadNotificationCount,
    refreshUnreadCounts,
    markMessagesAsRead,
    playNotificationSound,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};
