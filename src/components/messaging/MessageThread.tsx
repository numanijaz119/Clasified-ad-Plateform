// src/components/messaging/MessageThread.tsx
import React, { useEffect, useRef, useState } from "react";
import { Clock, ArrowDown } from "lucide-react";
import type { Message } from "../../types/messaging";
import { useAuth } from "../../contexts/AuthContext";

interface MessageThreadProps {
  messages: Message[];
  loading?: boolean;
  conversationId: number;
}

const SCROLL_THRESHOLD = 150; // px from bottom to be considered "at bottom"

const MessageThread: React.FC<MessageThreadProps> = ({ messages, loading, conversationId }) => {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMessageId = useRef<number | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sort chronologically and deduplicate
  const sortedMessages = React.useMemo(() => {
    // Deduplicate messages by ID (safety check for duplicate keys)
    const uniqueMessages = messages.filter(
      (msg, index, self) => index === self.findIndex(m => m.id === msg.id)
    );

    // Sort chronologically
    return uniqueMessages.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [messages]);

  /** Scroll instantly to bottom when conversation changes */
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight });
      setIsAtBottom(true);
      setUnreadCount(0);
      lastMessageId.current = sortedMessages.at(-1)?.id || null;
    }
  }, [conversationId]);

  /** Handle new messages (poll-based updates) */
  useEffect(() => {
    const container = containerRef.current;
    if (!container || sortedMessages.length === 0) return;

    const lastMsg = sortedMessages.at(-1);
    if (!lastMsg) return;

    const newMessageArrived = lastMsg.id !== lastMessageId.current;
    const isOwnMessage = lastMsg.sender === user?.id;

    if (newMessageArrived) {
      if (isOwnMessage || isAtBottom) {
        // User is at bottom → auto scroll
        container.scrollTo({
          top: container.scrollHeight,
          behavior: isOwnMessage ? "instant" : "auto",
        });
        setIsAtBottom(true);
        setUnreadCount(0);
      } else {
        // User is reading old messages → show unread badge
        setUnreadCount(prev => prev + 1);
      }

      lastMessageId.current = lastMsg.id;
    }
  }, [sortedMessages, user?.id, isAtBottom]);

  /** Track scroll position to toggle scroll button visibility */
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    if (distanceFromBottom < SCROLL_THRESHOLD) {
      setIsAtBottom(true);
      setUnreadCount(0);
    } else {
      setIsAtBottom(false);
    }
  };

  /** Manual scroll to bottom */
  const scrollToBottom = () => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "instant" });
      setIsAtBottom(true);
      setUnreadCount(0);
    }
  };

  if (loading && sortedMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="spinner h-8 w-8"></div>
      </div>
    );
  }

  if (sortedMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>No messages yet</p>
          <p className="text-sm text-gray-400 mt-1">Start the conversation below</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-0 relative">
      {/* Scrollable Messages Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin"
        style={{
          overflowAnchor: "none",
          scrollBehavior: "smooth",
        }}
      >
        {sortedMessages.map((message, index) => {
          const isOwn = message.sender === user?.id;
          const showDate =
            index === 0 ||
            new Date(sortedMessages[index - 1].created_at).toDateString() !==
              new Date(message.created_at).toDateString();

          return (
            <React.Fragment key={message.id}>
              {/* Date separator */}
              {showDate && (
                <div className="flex justify-center my-4">
                  <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {new Date(message.created_at).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              )}

              {/* Message bubble */}
              <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
                  {!isOwn && (
                    <p className="text-xs text-gray-500 mb-1 px-1">{message.sender_name}</p>
                  )}

                  <div
                    className={`px-4 py-2 rounded-lg break-words ${
                      isOwn
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-br-none"
                        : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
                    }`}
                  >
                    {message.message_type === "system" ? (
                      <p className="text-sm italic">{message.content}</p>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}

                    {message.image && (
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="mt-2 rounded max-w-full"
                        loading="lazy"
                      />
                    )}
                  </div>

                  {/* Timestamp */}
                  <div
                    className={`flex items-center gap-1 mt-1 px-1 text-xs text-gray-400 ${
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(message.created_at).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                    {isOwn && message.is_read && <span className="text-green-600 ml-1">✓✓</span>}
                    {isOwn && !message.is_read && <span className="text-gray-400 ml-1">✓</span>}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Scroll-to-bottom button (with unread badge) */}
      {!isAtBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 p-2 bg-white border shadow-lg rounded-full text-gray-600 hover:bg-gray-100 transition flex items-center justify-center"
          aria-label="Scroll to bottom"
        >
          <ArrowDown className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default MessageThread;
