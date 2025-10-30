// src/services/messagingService.ts
import BaseService from "./baseApiService";
import { API_CONFIG } from "../config/api";
import type {
  Conversation,
  Message,
  Notification,
  ConversationListParams,
  ConversationListResponse,
  MessageCreateRequest,
  MessageListParams,
  MessageListResponse,
  NotificationListParams,
  NotificationListResponse,
  MessageStats,
} from "../types/messaging";

class MessagingService extends BaseService {
  // ============================================================================
  // CONVERSATIONS
  // ============================================================================

  /**
   * Get list of conversations
   */
  async getConversations(params?: ConversationListParams): Promise<ConversationListResponse> {
    try {
      let url = API_CONFIG.ENDPOINTS.MESSAGING.CONVERSATIONS;

      if (params) {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.status) queryParams.append("status", params.status);
        if (params.ad) queryParams.append("ad", params.ad.toString());

        const queryString = queryParams.toString();
        if (queryString) url += `?${queryString}`;
      }

      const response = await this.get<ConversationListResponse>(url, true);
      return response.data!;
    } catch (error: any) {
      console.error("Get conversations error:", error);
      throw error;
    }
  }

  /**
   * Get single conversation details
   */
  async getConversation(id: number): Promise<Conversation> {
    try {
      const url = API_CONFIG.ENDPOINTS.MESSAGING.CONVERSATION_DETAIL.replace(":id", id.toString());
      const response = await this.get<Conversation>(url, true);
      return response.data!;
    } catch (error: any) {
      console.error("Get conversation error:", error);
      throw error;
    }
  }

  /**
   * Create new conversation
   */
  async createConversation(adId: number, initialMessage?: string): Promise<Conversation> {
    try {
      const payload: any = { ad_id: adId };
      if (initialMessage) {
        payload.initial_message = initialMessage;
      }

      const response = await this.post<Conversation>(
        API_CONFIG.ENDPOINTS.MESSAGING.CONVERSATIONS,
        payload,
        true
      );
      return response.data!;
    } catch (error: any) {
      console.error("Create conversation error:", error);
      throw error;
    }
  }

  /**
   * Mark all messages in conversation as read
   */
  async markConversationRead(id: number): Promise<void> {
    try {
      // Use the messages mark_all_read endpoint with conversation_id
      await this.post(
        API_CONFIG.ENDPOINTS.MESSAGING.MESSAGES_MARK_ALL_READ,
        { conversation_id: id },
        true
      );
    } catch (error: any) {
      console.error("Mark conversation read error:", error);
      // Don't throw - fail silently to not disrupt UX
    }
  }

  /**
   * Archive conversation
   */
  async archiveConversation(id: number): Promise<void> {
    try {
      const url = API_CONFIG.ENDPOINTS.MESSAGING.CONVERSATION_ARCHIVE.replace(":id", id.toString());
      await this.post(url, {}, true);
    } catch (error: any) {
      console.error("Archive conversation error:", error);
      throw error;
    }
  }

  /**
   * Unarchive conversation
   */
  async unarchiveConversation(id: number): Promise<void> {
    try {
      const url = API_CONFIG.ENDPOINTS.MESSAGING.CONVERSATION_UNARCHIVE.replace(
        ":id",
        id.toString()
      );
      await this.post(url, {}, true);
    } catch (error: any) {
      console.error("Unarchive conversation error:", error);
      throw error;
    }
  }

  /**
   * Block conversation
   */
  async blockConversation(id: number): Promise<any> {
    try {
      const url = API_CONFIG.ENDPOINTS.MESSAGING.CONVERSATION_BLOCK.replace(":id", id.toString());
      const response = await this.post(url, {}, true);
      return response.data;
    } catch (error: any) {
      console.error("Block conversation error:", error);
      throw error;
    }
  }

  /**
   * Unblock conversation
   */
  async unblockConversation(id: number): Promise<any> {
    try {
      const url = API_CONFIG.ENDPOINTS.MESSAGING.CONVERSATION_UNBLOCK.replace(":id", id.toString());
      const response = await this.post(url, {}, true);
      return response.data;
    } catch (error: any) {
      console.error("Unblock conversation error:", error);
      throw error;
    }
  }

  /**
   * Get unread conversations count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await this.get<{ unread_count: number }>(
        API_CONFIG.ENDPOINTS.MESSAGING.CONVERSATIONS_UNREAD,
        true
      );
      return response.data?.unread_count || 0;
    } catch (error: any) {
      console.error("Get unread count error:", error);
      return 0;
    }
  }

  /**
   * Get messaging statistics
   */
  async getStats(): Promise<MessageStats> {
    try {
      const response = await this.get<MessageStats>(
        API_CONFIG.ENDPOINTS.MESSAGING.CONVERSATIONS_STATS,
        true
      );
      return response.data!;
    } catch (error: any) {
      console.error("Get messaging stats error:", error);
      throw error;
    }
  }

  // ============================================================================
  // MESSAGES
  // ============================================================================

  /**
   * Get list of messages
   */
  async getMessages(params?: MessageListParams): Promise<MessageListResponse> {
    try {
      let url = API_CONFIG.ENDPOINTS.MESSAGING.MESSAGES;

      if (params) {
        const queryParams = new URLSearchParams();
        if (params.conversation_id)
          queryParams.append("conversation_id", params.conversation_id.toString());
        if (params.type) queryParams.append("type", params.type);
        if (params.unread !== undefined) queryParams.append("unread", params.unread.toString());
        if (params.page) queryParams.append("page", params.page.toString());

        const queryString = queryParams.toString();
        if (queryString) url += `?${queryString}`;
      }

      const response = await this.get<MessageListResponse>(url, true);
      return response.data!;
    } catch (error: any) {
      console.error("Get messages error:", error);
      throw error;
    }
  }

  /**
   * Send a message
   */
  async sendMessage(data: MessageCreateRequest): Promise<Message> {
    try {
      // If there's an image, use FormData
      if (data.image) {
        const formData = new FormData();
        formData.append("conversation", data.conversation.toString());
        formData.append("message_type", data.message_type);
        formData.append("content", data.content);
        formData.append("image", data.image);

        const response = await this.postFormData<Message>(
          API_CONFIG.ENDPOINTS.MESSAGING.MESSAGES,
          formData,
          true
        );
        return response.data!;
      }

      // Otherwise use JSON
      const response = await this.post<Message>(
        API_CONFIG.ENDPOINTS.MESSAGING.MESSAGES,
        {
          conversation: data.conversation,
          message_type: data.message_type,
          content: data.content,
        },
        true
      );
      return response.data!;
    } catch (error: any) {
      console.error("Send message error:", error);
      throw error;
    }
  }

  /**
   * Mark message as read
   */
  async markMessageRead(id: number): Promise<void> {
    try {
      const url = API_CONFIG.ENDPOINTS.MESSAGING.MESSAGE_MARK_READ.replace(":id", id.toString());
      await this.post(url, {}, true);
    } catch (error: any) {
      console.error("Mark message read error:", error);
      throw error;
    }
  }

  /**
   * Mark all messages as read (in a conversation)
   */
  async markAllMessagesRead(conversationId: number): Promise<void> {
    try {
      await this.post(
        API_CONFIG.ENDPOINTS.MESSAGING.MESSAGES_MARK_ALL_READ,
        { conversation_id: conversationId },
        true
      );
    } catch (error: any) {
      console.error("Mark all messages read error:", error);
      throw error;
    }
  }

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  /**
   * Get list of notifications
   */
  async getNotifications(params?: NotificationListParams): Promise<NotificationListResponse> {
    try {
      let url = API_CONFIG.ENDPOINTS.MESSAGING.NOTIFICATIONS;

      if (params) {
        const queryParams = new URLSearchParams();
        if (params.is_read !== undefined) queryParams.append("is_read", params.is_read.toString());
        if (params.type) queryParams.append("type", params.type);
        if (params.page) queryParams.append("page", params.page.toString());

        const queryString = queryParams.toString();
        if (queryString) url += `?${queryString}`;
      }

      const response = await this.get<NotificationListResponse>(url, true);
      return response.data!;
    } catch (error: any) {
      console.error("Get notifications error:", error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(id: number): Promise<void> {
    try {
      const url = API_CONFIG.ENDPOINTS.MESSAGING.NOTIFICATION_MARK_READ.replace(
        ":id",
        id.toString()
      );
      await this.post(url, {}, true);
    } catch (error: any) {
      console.error("Mark notification read error:", error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead(): Promise<void> {
    try {
      await this.post(API_CONFIG.ENDPOINTS.MESSAGING.NOTIFICATIONS_MARK_ALL_READ, {}, true);
    } catch (error: any) {
      console.error("Mark all notifications read error:", error);
      throw error;
    }
  }

  /**
   * Get unread notifications count
   */
  async getUnreadNotificationsCount(): Promise<number> {
    try {
      const response = await this.get<{ unread_count: number }>(
        API_CONFIG.ENDPOINTS.MESSAGING.NOTIFICATIONS_UNREAD,
        true
      );
      return response.data?.unread_count || 0;
    } catch (error: any) {
      console.error("Get unread notifications count error:", error);
      return 0;
    }
  }

  /**
   * Mark all notifications related to a conversation as read
   * This is useful to keep notification badges in sync when a chat is viewed
   */
  async markConversationNotificationsRead(conversationId: number): Promise<void> {
    try {
      // Fetch unread notifications (first page) and mark those tied to this conversation as read
      const response = await this.getNotifications({ is_read: false });
      const toMark = (response.results || []).filter(
        n => !n.is_read && n.conversation === conversationId
      );

      if (toMark.length === 0) return;

      // Mark in parallel but avoid unhandled rejections
      await Promise.all(
        toMark.map(n =>
          this.markNotificationRead(n.id).catch(err => {
            console.warn("Failed to mark notification as read:", n.id, err);
          })
        )
      );
    } catch (error) {
      console.warn("markConversationNotificationsRead failed:", error);
    }
  }

  /**
   * Clear all read notifications
   */
  async clearAllNotifications(): Promise<void> {
    try {
      await this.delete(API_CONFIG.ENDPOINTS.MESSAGING.NOTIFICATIONS_CLEAR, true);
    } catch (error: any) {
      console.error("Clear notifications error:", error);
      throw error;
    }
  }
}

// Export singleton instance
const messagingService = new MessagingService();
export { messagingService };
