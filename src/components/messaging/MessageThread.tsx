// src/components/messaging/MessageThread.tsx
import React, { useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import type { Message } from '../../types/messaging';
import { useAuth } from '../../contexts/AuthContext';

interface MessageThreadProps {
  messages: Message[];
  loading?: boolean;
}

const MessageThread: React.FC<MessageThreadProps> = ({ messages, loading }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="spinner h-8 w-8"></div>
      </div>
    );
  }

  if (messages.length === 0) {
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
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
      {messages.map((message) => {
        const isOwn = message.sender === user?.id;

        return (
          <div
            key={message.id}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
          >
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
                  px-4 py-2 rounded-lg
                  ${
                    isOwn
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }
                `}
              >
                {message.message_type === 'system' ? (
                  <p className="text-sm italic">{message.content}</p>
                ) : (
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                )}

                {/* Image if present */}
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="mt-2 rounded max-w-full"
                  />
                )}
              </div>

              {/* Timestamp */}
              <div
                className={`
                  flex items-center gap-1 mt-1 px-1
                  text-xs
                  ${isOwn ? 'text-gray-500 justify-end' : 'text-gray-400'}
                `}
              >
                <Clock className="h-3 w-3" />
                <span>{message.time_ago}</span>
                {isOwn && message.is_read && (
                  <span className="text-green-600 ml-1">✓ Read</span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageThread;