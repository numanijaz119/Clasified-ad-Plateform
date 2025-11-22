// src/contexts/NotificationContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { messagingService } from "../services/messagingService";
import { eventBus } from "../utils/eventBus";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";

interface NotificationContextType {
  unreadMessageCount: number;
  unreadNotificationCount: number;
  refreshUnreadCounts: () => Promise<void>;
  markMessagesAsRead: (conversationId: number) => void;
  playNotificationSound: () => void;
  activeConversationId: number | null;
  setActiveConversationId: (id: number | null) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound
  useEffect(() => {
    try {
      audioRef.current = new Audio("/notification.mp3");
      audioRef.current.volume = 0.5;
    } catch (error) {
      console.warn("Notification sound not available:", error);
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Silently handle audio play errors (e.g., user interaction required)
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
      // Fetch unread messages count
      let messageCount = await messagingService.getUnreadCount();

      // If user is currently viewing a conversation and we detect a bump
      // verify the unread belongs to the active conversation before marking it as read
      let markedActiveAsRead = false;
      if (activeConversationId && messageCount > lastMessageCount) {
        try {
          const unreadForActive = await messagingService.getMessages({
            conversation_id: activeConversationId,
            unread: true,
            page: 1,
          });
          const hasUnreadInActive = (unreadForActive.results || []).length > 0;
          if (hasUnreadInActive) {
            await messagingService.markAllMessagesRead(activeConversationId);
            markedActiveAsRead = true;
            // Re-fetch message count after marking as read to avoid badge flash
            messageCount = await messagingService.getUnreadCount();
          }
        } catch (e) {
          // Best-effort; ignore
        }
      }

      // Fetch unread notifications list and exclude chat-related types for bell badge
      const unreadNotifications = await messagingService.getNotifications({ is_read: false });
      const nonChatUnread = (unreadNotifications.results || []).filter(
        n => n.notification_type !== "new_message" && n.notification_type !== "new_conversation"
      );
      const notificationCount = nonChatUnread.length;

      // Only show toast notifications after initialization to prevent duplicates
      if (isInitialized) {
        // Check for new NON-chat notifications (bell only)
        if (notificationCount > lastNotificationCount && lastNotificationCount > 0) {
          const newNotifications = notificationCount - lastNotificationCount;
          toast.info(
            `You have ${newNotifications} new notification${newNotifications > 1 ? "s" : ""}`
          );
          playNotificationSound();
        }

        // We do NOT toast for new messages here to avoid redundancy with chat UI
        // If message unread increased and we did NOT mark the active conversation as read,
        // it means another conversation received a message. Emit a refresh so the list updates immediately.
        if (messageCount > lastMessageCount && !markedActiveAsRead) {
          eventBus.emit("conversations:refresh", { reason: "unread_bump" });
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
      // Silently fail - notifications are not critical
    }
  }, [
    isAuthenticated,
    isInitialized,
    lastMessageCount,
    lastNotificationCount,
    activeConversationId,
    toast,
    playNotificationSound,
  ]);

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
    }, 3000); // 3 seconds for faster notification updates

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshUnreadCounts]);

  // Refresh on visibility change (when user returns to tab)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshUnreadCounts();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isAuthenticated, refreshUnreadCounts]);

  // Listen for block/unblock events to refresh counts immediately
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleConversationRefresh = (data: any) => {
      if (data?.reason === "user_blocked" || data?.reason === "user_unblocked") {
        // Immediately refresh unread counts when user blocks/unblocks
        refreshUnreadCounts();
      }
    };

    const unsubscribe = eventBus.on("conversations:refresh", handleConversationRefresh);
    return () => unsubscribe();
  }, [isAuthenticated, refreshUnreadCounts]);

  const value = {
    unreadMessageCount,
    unreadNotificationCount,
    refreshUnreadCounts,
    markMessagesAsRead,
    playNotificationSound,
    activeConversationId,
    setActiveConversationId,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used within NotificationProvider");
  }
  return context;
};
