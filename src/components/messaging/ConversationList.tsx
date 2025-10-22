// src/components/messaging/ConversationList.tsx
import React from 'react';
import { MessageCircle, Clock } from 'lucide-react';
import type { Conversation, Message } from '../../types/messaging';

// Helper function to check if a message is new (within last 30 seconds)
const isNewMessage = (message: Message | string | null | undefined): boolean => {
  if (!message || typeof message === 'string') return false;
  const messageTime = new Date(message.created_at).getTime();
  return messageTime > Date.now() - 30000; // 30 seconds
};

interface ConversationListProps {
    conversations: Conversation[];
    selectedId: number | null;
    onSelect: (conversation: Conversation) => void;
    loading?: boolean;
    refreshing?: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    selectedId,
    onSelect,
    loading,
    refreshing = false,
}) => {
    // Show loading skeleton only on initial load and when there are no conversations
    if (loading && (!conversations || conversations.length === 0)) {
        return (
            <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="skeleton h-20"></div>
                ))}
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No conversations yet</p>
                <p className="text-sm text-gray-400 mt-1">
                    Start messaging sellers about their ads
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {conversations.map((conversation) => {
                const isSelected = conversation.id === selectedId;
                const hasUnread = conversation.unread_count > 0;
                const messageIsNew = isNewMessage(conversation.last_message);
                const showNewIndicator = messageIsNew && !isSelected;

                return (
                    <div key={conversation.id} className="relative">
                        {showNewIndicator && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-orange-400 rounded-r-sm"></div>
                        )}
                        <button
                            onClick={() => onSelect(conversation)}
                            className={`
                                w-full text-left p-4 rounded-lg border transition-all relative
                                ${isSelected
                                    ? 'bg-orange-50 border-orange-200'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                }
                                ${showNewIndicator ? 'pl-5' : 'pl-4'}
                            `}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                                        {conversation.other_user.avatar ? (
                                        <img
                                            src={conversation.other_user.avatar}
                                            alt={conversation.other_user.full_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-semibold">
                                            {conversation.other_user.full_name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                {/* Name */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {conversation.other_user.full_name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {conversation.ad.title}
                                    </p>
                                </div>
                            </div>

                            {/* Unread Badge */}
                            {hasUnread && (
                                <span className="badge badge-error flex-shrink-0 ml-2">
                                    {conversation.unread_count}
                                </span>
                            )}
                        </div>

                        {/* Last Message */}
                        {conversation.last_message && (
                            <p
                                className={`
                  text-sm truncate mb-1
                  ${hasUnread ? 'text-gray-900' : 'text-gray-600'}
                `}
                            >
                                {typeof conversation.last_message === 'string'
                                    ? conversation.last_message
                                    : conversation.last_message?.content || 'New conversation'
                                }
                            </p>
                        )}

                        {/* Time */}
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{conversation.time_since_created}</span>
                            {refreshing && isSelected && (
                                <div className="absolute right-4 top-4 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            )}
                        </div>
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default ConversationList;