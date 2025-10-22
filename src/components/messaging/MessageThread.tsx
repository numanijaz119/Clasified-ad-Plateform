// src/components/messaging/MessageThread.tsx
import React, { useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import type { Message } from '../../types/messaging';
import { useAuth } from '../../contexts/AuthContext';

interface MessageThreadProps {
  messages: Message[];
  loading?: boolean;
  conversationId: number;
}

const MessageThread: React.FC<MessageThreadProps> = ({ messages, loading, conversationId }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sort messages chronologically (oldest first, newest last)
  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !sortedMessages.length) return;
    
    // Get the last message
    const lastMessage = sortedMessages[sortedMessages.length - 1];
    
    // Auto-scroll if it's the current user's message
    if (lastMessage?.sender === user?.id) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [sortedMessages, user?.id]);


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
          <p className="text-sm text-gray-400 mt-1">
            Start the conversation below
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-gray-50"
      style={{
        maxHeight: 'calc(100vh - 300px)',
        minHeight: '200px',
        overflowAnchor: 'none',
        scrollBehavior: 'smooth',
        position: 'relative'
      }}
    >
      {sortedMessages.map((message, index) => {
        const isOwn = message.sender === user?.id;
        const showDate = index === 0 || 
          new Date(sortedMessages[index - 1].created_at).toDateString() !== new Date(message.created_at).toDateString();

        return (
          <React.Fragment key={message.id}>
            {/* Date separator */}
            {showDate && (
              <div className="flex items-center justify-center my-4">
                <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {new Date(message.created_at).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
            )}

            {/* Message bubble */}
            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                {/* Sender Name (for received messages) */}
                {!isOwn && (
                  <p className="text-xs text-gray-500 mb-1 px-1">
                    {message.sender_name}
                  </p>
                )}

                {/* Message Bubble */}
                <div
                  className={`
                    px-4 py-2 rounded-lg break-words
                    ${
                      isOwn
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-br-none'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                    }
                  `}
                >
                  {message.message_type === 'system' ? (
                    <p className="text-sm italic">{message.content}</p>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}

                  {/* Image if present */}
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="mt-2 rounded max-w-full"
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Timestamp & Status */}
                <div
                  className={`
                    flex items-center gap-1 mt-1 px-1
                    text-xs text-gray-400
                    ${isOwn ? 'justify-end' : 'justify-start'}
                  `}
                >
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(message.created_at).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                  {isOwn && message.is_read && (
                    <span className="text-green-600 ml-1">✓✓</span>
                  )}
                  {isOwn && !message.is_read && (
                    <span className="text-gray-400 ml-1">✓</span>
                  )}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}

        {/* Empty div at the bottom for auto-scrolling */}
        <div ref={messagesEndRef} style={{ float: 'left', clear: 'both' }} />
    </div>
  );
};

export default MessageThread;