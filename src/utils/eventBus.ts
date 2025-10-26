// src/utils/eventBus.ts
// Tiny event bus to synchronize messaging UI without sockets

type Handler<T = any> = (payload: T) => void;

class EventBus {
  private listeners: Record<string, Set<Handler>> = {};

  on<T = any>(event: string, handler: Handler<T>) {
    if (!this.listeners[event]) this.listeners[event] = new Set();
    this.listeners[event].add(handler as Handler);
    return () => this.off(event, handler);
  }

  off<T = any>(event: string, handler: Handler<T>) {
    this.listeners[event]?.delete(handler as Handler);
  }

  emit<T = any>(event: string, payload: T) {
    this.listeners[event]?.forEach((h) => {
      try { h(payload); } catch {}
    });
  }
}

export const eventBus = new EventBus();

// Event names and payloads
export type ConversationPreviewUpdate = {
  conversationId: number;
  lastMessage: { id?: number; content: string; created_at?: string } | string;
  lastMessageAt?: string;
  unreadDelta?: number; // +1 for incoming, -X for read, 0 for send self
};

export type RefreshConversationsEvent = { reason: 'unread_bump' | 'manual'; };
