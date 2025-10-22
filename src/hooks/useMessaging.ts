// src/hooks/useMessaging.ts
import { useState, useEffect, useCallback } from 'react';
import { messagingService } from '../services/messagingService';
import { eventBus, ConversationPreviewUpdate, RefreshConversationsEvent } from '../utils/eventBus';
import { useToast } from '../contexts/ToastContext';
import type {
  Conversation,
  Message,
  Notification,
  MessageCreateRequest,
  MessageStats,
} from '../types/messaging';

/**
 * Hook for managing conversations
 */
export const useConversations = (options?: { status?: 'active' | 'archived' | 'blocked' }) => {
  const status = options?.status ?? 'active';
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const toast = useToast();

  const fetchConversations = useCallback(async (isRefreshing = false) => {
    try {
      // Only show loading state on initial load when there are no conversations
      if (!isRefreshing && (!conversations || conversations.length === 0)) {
        setLoading(true);
      }
      
      const response = await messagingService.getConversations({ status });
      
      // Use functional update to ensure we have the latest state
      setConversations(prevConversations => {
        // Only update if there are actual changes to prevent unnecessary re-renders
        const newConversations = response.results;
        
        // Check if the data has actually changed
        const hasChanges = JSON.stringify(prevConversations) !== JSON.stringify(newConversations);
        
        if (hasChanges) {
          return newConversations;
        }
        return prevConversations;
      });
      
      // Update unread count
      const newUnreadCount = response.results.reduce(
        (count: number, conv: any) => count + (conv.unread_count || 0), 
        0
      );
      setUnreadCount(newUnreadCount);
      
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load conversations';
      setError(errorMsg);
      if (!isRefreshing) { // Only show toast for initial load errors
        toast.error(errorMsg);
      }
    } finally {
      if (!isRefreshing) {
        setLoading(false);
      }
    }
  }, [toast, status]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await messagingService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
    // Listen for conversation preview updates to update list instantly
    const offUpdate = eventBus.on<ConversationPreviewUpdate>('conversation:update', (payload) => {
      setConversations((prev) => {
        const next = prev.map((c) => {
          if (c.id !== payload.conversationId) return c;
          const lastMessage = typeof payload.lastMessage === 'string' ? payload.lastMessage : (payload.lastMessage?.content || c.last_message || '');
          return {
            ...c,
            last_message: lastMessage,
            last_message_at: payload.lastMessageAt || c.last_message_at,
            unread_count: typeof payload.unreadDelta === 'number' ? Math.max(0, (c.unread_count || 0) + payload.unreadDelta) : c.unread_count,
          };
        });
        return next;
      });
      // Also refresh unread count quickly
      fetchUnreadCount();
    });
    // Listen for refresh events (e.g., from NotificationContext)
    const offRefresh = eventBus.on<RefreshConversationsEvent>('conversations:refresh', () => {
      fetchConversations(true);
      fetchUnreadCount();
    });
    return () => {
      offUpdate();
      offRefresh();
    };
  }, [fetchConversations, fetchUnreadCount, status]);

  const markAsRead = useCallback(async (conversationId: number) => {
    try {
      await messagingService.markConversationRead(conversationId);
      // Update local state
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
        )
      );
      fetchUnreadCount();
    } catch (err: any) {
      toast.error('Failed to mark as read');
    }
  }, [toast, fetchUnreadCount]);

  const archiveConversation = useCallback(async (conversationId: number) => {
    try {
      await messagingService.archiveConversation(conversationId);
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      toast.success('Conversation archived');
    } catch (err: any) {
      toast.error('Failed to archive conversation');
    }
  }, [toast]);

  const unarchiveConversation = useCallback(async (conversationId: number) => {
    try {
      await messagingService.unarchiveConversation(conversationId);
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      toast.success('Conversation restored');
    } catch (err: any) {
      toast.error('Failed to restore conversation');
    }
  }, [toast]);

 const blockConversation = useCallback(async (conversationId: number) => {
  try {
    const response = await messagingService.blockConversation(conversationId);
    
    // Remove all conversations from the list (backend blocks all)
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    
    // Refresh unread count immediately to clear badges from blocked conversations
    fetchUnreadCount();
    
    // Emit event to refresh global notification counts
    eventBus.emit('conversations:refresh', { reason: 'user_blocked' });
    
    // Show count if available
    const count = (response as any)?.blocked_count || 1;
    const userName = (response as any)?.blocked_user_name || 'User';
    
    if (count > 1) {
      toast.success(`${userName} blocked. ${count} conversations blocked.`);
    } else {
      toast.success(`${userName} blocked.`);
    }
  } catch (err: any) {
    toast.error('Failed to block user');
  }
}, [toast, fetchUnreadCount]);

const unblockConversation = useCallback(async (conversationId: number) => {
  try {
    const response = await messagingService.unblockConversation(conversationId);
    
    // Remove from blocked list
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    
    // Refresh unread count to restore badges if there are unread messages
    fetchUnreadCount();
    
    // Emit event to refresh global notification counts
    eventBus.emit('conversations:refresh', { reason: 'user_unblocked' });
    
    // Show count if available
    const count = (response as any)?.unblocked_count || 1;
    const userName = (response as any)?.unblocked_user_name || 'User';
    
    if (count > 1) {
      toast.success(`${userName} unblocked. ${count} conversations restored.`);
    } else {
      toast.success(`${userName} unblocked.`);
    }
  } catch (err: any) {
    toast.error('Failed to unblock user');
  }
}, [toast, fetchUnreadCount]);

  // Wrap the refetch function to handle the refreshing state
  const refetch = useCallback(async (isRefreshing = false) => {
    return fetchConversations(isRefreshing);
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    refreshing,
    error,
    unreadCount,
    refetch,
    markAsRead,
    archiveConversation,
    unarchiveConversation,
    blockConversation,
    unblockConversation,
  };
};

/**
 * Hook for managing messages in a conversation
 */
export const useMessages = (conversationId: number | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await messagingService.getMessages({
        conversation_id: conversationId,
      });
      setMessages(response.results);
      // Emit preview update using the last message received
      const last = response.results[response.results.length - 1];
      if (last) {
        eventBus.emit<ConversationPreviewUpdate>('conversation:update', {
          conversationId: conversationId,
          lastMessage: last,
          lastMessageAt: last.created_at,
          // unreadDelta will be handled by server counts; do not bump here
        });
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load messages';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [conversationId, toast]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId, fetchMessages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId || !content.trim()) return false;

    try {
      setSending(true);
      const messageData: MessageCreateRequest = {
        conversation: conversationId,
        message_type: 'text',
        content: content.trim(),
      };

      const newMessage = await messagingService.sendMessage(messageData);
      
      // Add new message to list
      setMessages(prev => [...prev, newMessage]);
      // Emit immediate preview update (no unread delta for self send)
      eventBus.emit<ConversationPreviewUpdate>('conversation:update', {
        conversationId,
        lastMessage: newMessage,
        lastMessageAt: newMessage.created_at,
        unreadDelta: 0,
      });
      
      return true;
    } catch (err: any) {
      toast.error('Failed to send message');
      return false;
    } finally {
      setSending(false);
    }
  }, [conversationId, toast]);

  const markAsRead = useCallback(async () => {
    if (!conversationId) return;

    try {
      await messagingService.markAllMessagesRead(conversationId);
      // Update local state
      setMessages(prev =>
        prev.map(msg => ({ ...msg, is_read: true }))
      );
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  }, [conversationId]);

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    markAsRead,
    refetch: fetchMessages,
  };
};

/**
 * Hook for managing notifications
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const toast = useToast();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await messagingService.getNotifications();
      setNotifications(response.results);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load notifications';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await messagingService.getUnreadNotificationsCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to fetch unread notifications:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await messagingService.markNotificationRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      fetchUnreadCount();
    } catch (err: any) {
      toast.error('Failed to mark notification as read');
    }
  }, [toast, fetchUnreadCount]);

  const markAllAsRead = useCallback(async () => {
    try {
      await messagingService.markAllNotificationsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err: any) {
      toast.error('Failed to mark all as read');
    }
  }, [toast]);

  const clearAll = useCallback(async () => {
    try {
      await messagingService.clearAllNotifications();
      setNotifications([]);
      toast.success('Notifications cleared');
    } catch (err: any) {
      toast.error('Failed to clear notifications');
    }
  }, [toast]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
};

/**
 * Hook for messaging statistics
 */
export const useMessagingStats = () => {
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await messagingService.getStats();
      setStats(data);
    } catch (err: any) {
      toast.error('Failed to load messaging statistics');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    refetch: fetchStats,
  };
};