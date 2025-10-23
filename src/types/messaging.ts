// src/types/messaging.ts

export interface User {
  id: number;
  email: string;
  full_name: string;
  avatar?: string;
}

export interface Ad {
  id: number;
  title: string;
  slug: string;
  display_price: string;
  price?: string;
  images?: string[];
  primary_image?: {
    id: number;
    image: string;
    caption?: string;
    is_primary: boolean;
  };
}

export interface Message {
  id: number;
  conversation: number;
  sender: number;
  sender_name: string;
  sender_avatar?: string;
  message_type: 'text' | 'image' | 'system';
  content: string;
  image?: string;
  is_read: boolean;
  read_at?: string;
  is_flagged: boolean;
  created_at: string;
  time_ago: string;
}

export interface Conversation {
  id: number;
  buyer: User;
  seller: User;
  ad: Ad;
 last_message?: string | Message;
  last_message_at: string;
  is_active: boolean;
  is_blocked: boolean;
  created_at: string;
  time_since_created: string;
  messages: Message[];
  unread_count: number;
  other_user: User;
}

export interface Notification {
  id: number;
  notification_type: 'new_message' | 'new_conversation' | 'ad_approved' | 'ad_rejected' | 'ad_expired' | 'ad_expiring_soon' | 'system';
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  time_ago: string;
  conversation?: number;
  ad?: number;
}

// API Request/Response Types
export interface ConversationListParams {
  page?: number;
  status?: 'active' | 'archived' | 'blocked';
  ad?: number;
}

export interface MessageCreateRequest {
  conversation: number;
  message_type: 'text' | 'image';
  content: string;
  image?: File;
}

export interface MessageListParams {
  conversation_id?: number;
  type?: 'text' | 'image' | 'system';
  unread?: boolean;
  page?: number;
}

export interface NotificationListParams {
  is_read?: boolean;
  type?: Notification['notification_type'];
  page?: number;
}

// API Response Types
export interface ConversationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Conversation[];
}

export interface MessageListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Message[];
}

export interface NotificationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notification[];
}

export interface MessageStats {
  total_conversations: number;
  active_conversations: number;
  total_messages_sent: number;
  total_messages_received: number;
  unread_messages: number;
}