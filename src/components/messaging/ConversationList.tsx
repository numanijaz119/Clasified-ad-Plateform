// src/components/messaging/ConversationList.tsx
import React, { useState } from 'react';
import { MessageCircle, Unlock, ExternalLink, ArrowLeft, ChevronRight } from 'lucide-react';
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
    onUnblock?: (conversationId: number) => void;
    onAdClick?: (adId: number) => void;
    loading?: boolean;
    refreshing?: boolean;
    isBlockedView?: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    selectedId,
    onSelect,
    onUnblock,
    onAdClick,
    loading,
    refreshing = false,
    isBlockedView = false,
}) => {
    const [viewingUserId, setViewingUserId] = useState<number | null>(null);

    // Group conversations by user
    const groupedConversations = React.useMemo(() => {
        const groups = new Map<number, Conversation[]>();
        
        conversations.forEach(conv => {
            const userId = conv.other_user.id;
            if (!groups.has(userId)) {
                groups.set(userId, []);
            }
            groups.get(userId)!.push(conv);
        });
        
        // Sort conversations within each group by last_message_at (most recent first)
        groups.forEach(convs => {
            convs.sort((a, b) => 
                new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
            );
        });
        
        return groups;
    }, [conversations]);


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

    // If viewing a specific user's conversations, show sub-view
    if (viewingUserId !== null) {
        const userConversations = Array.from(groupedConversations.entries())
            .find(([userId]) => userId === viewingUserId)?.[1] || [];
        
        if (userConversations.length === 0) {
            setViewingUserId(null);
            return null;
        }

        const user = userConversations[0].other_user;

        return (
            <div className="space-y-3">
                {/* Back Button */}
                <button
                    onClick={() => setViewingUserId(null)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="font-medium">Back to conversations</span>
                </button>

                {/* User Header */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.full_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 font-semibold text-lg">
                                    {user.full_name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-gray-900">{user.full_name}</p>
                            <p className="text-sm text-gray-500">{userConversations.length} conversation{userConversations.length > 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </div>

                {/* Ad Conversations List */}
                <div className="space-y-2">
                    {userConversations.map((conversation) => {
                        const isSelected = conversation.id === selectedId;
                        const hasUnread = conversation.unread_count > 0;
                        // Use primary_image.image from backend, fallback to placeholder
                        const adImage = conversation.ad.primary_image?.image || '/placeholder.svg';
                        
                        return (
                            <div
                                key={conversation.id}
                                className={`
                                    flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
                                    ${isSelected
                                        ? 'bg-orange-50 border-orange-500'
                                        : 'bg-white border-gray-200 hover:border-gray-300'
                                    }
                                `}
                                onClick={() => onSelect(conversation)}
                            >
                                {/* Ad Image */}
                                <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                                    <img
                                        src={adImage}
                                        alt={conversation.ad.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Ad Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h4 className="text-sm font-semibold text-gray-900 truncate flex-1">
                                            {conversation.ad.title}
                                        </h4>
                                        {onAdClick && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    onAdClick(conversation.ad.id);
                                                }}
                                                className="flex-shrink-0 p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-100 rounded-md transition-all border border-transparent hover:border-orange-300"
                                                title="View ad details"
                                                aria-label="View ad details"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                    
                                    {conversation.ad.price && (
                                        <p className="text-xs font-semibold text-orange-600 mb-1">
                                            {conversation.ad.price}
                                        </p>
                                    )}

                                    {/* Last Message */}
                                    {conversation.last_message && (
                                        <p className={`text-xs truncate ${
                                            hasUnread ? 'text-gray-900 font-medium' : 'text-gray-600'
                                        }`}>
                                            {typeof conversation.last_message === 'string'
                                                ? conversation.last_message
                                                : conversation.last_message?.content || 'New conversation'
                                            }
                                        </p>
                                    )}
                                </div>

                                {/* Unread Badge */}
                                {hasUnread && (
                                    <span className="badge badge-error badge-sm flex-shrink-0">
                                        {conversation.unread_count}
                                    </span>
                                )}
                                
                                {/* Unblock Button for Blocked Chats */}
                                {isBlockedView && onUnblock && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onUnblock(conversation.id);
                                        }}
                                        className="flex-shrink-0 px-2 py-1 text-xs font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded transition-colors flex items-center gap-1"
                                    >
                                        <Unlock className="h-3 w-3" />
                                        Unblock
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Main conversation list view
    return (
        <div className="space-y-2">
            {Array.from(groupedConversations.entries()).map(([userId, userConversations]) => {
                const hasMultipleConversations = userConversations.length > 1;
                const user = userConversations[0].other_user;
                const totalUnread = userConversations.reduce((sum, conv) => sum + conv.unread_count, 0);
                
                // If only one conversation, show it normally (no grouping)
                if (!hasMultipleConversations) {
                    const conversation = userConversations[0];
                    const isSelected = conversation.id === selectedId;
                    const hasUnread = conversation.unread_count > 0;
                    const messageIsNew = isNewMessage(conversation.last_message);
                    const showNewIndicator = messageIsNew && !isSelected;

                    return (
                        <div key={conversation.id} className="relative">
                            {showNewIndicator && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-orange-400 rounded-r-sm"></div>
                            )}
                            <div
                                className={`
                                    w-full text-left p-4 rounded-lg border transition-all relative
                                    ${isSelected
                                        ? 'bg-orange-50 border-orange-200'
                                        : 'bg-white border-gray-200 hover:border-gray-300'
                                    }
                                    ${showNewIndicator ? 'pl-5' : 'pl-4'}
                                `}
                            >
                                <button
                                    onClick={() => onSelect(conversation)}
                                    className="w-full text-left"
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
                            </button>
                            
                            {/* Unblock Button for Blocked Chats */}
                            {isBlockedView && onUnblock && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onUnblock(conversation.id);
                                        }}
                                        className="w-full px-3 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Unlock className="h-4 w-4" />
                                        Unblock User
                                    </button>
                                </div>
                            )}
                            </div>
                        </div>
                    );
                }
                
                // Multiple conversations with same user - show as grouped item
                const hasSelectedInGroup = userConversations.some(c => c.id === selectedId);
                const mostRecentConv = userConversations[0];
                
                return (
                    <div key={userId} className="relative">
                        <div
                            className={`
                                w-full text-left p-4 rounded-lg border transition-all cursor-pointer
                                ${hasSelectedInGroup
                                    ? 'bg-orange-50 border-orange-200'
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                }
                            `}
                            onClick={() => setViewingUserId(userId)}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.full_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-semibold">
                                                {user.full_name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Name and count */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {user.full_name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {userConversations.length} conversation{userConversations.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Total Unread Badge */}
                                    {totalUnread > 0 && (
                                        <span className="badge badge-error flex-shrink-0">
                                            {totalUnread}
                                        </span>
                                    )}
                                    
                                    {/* Chevron */}
                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>

                            {/* Most Recent Message Preview */}
                            {mostRecentConv.last_message && (
                                <p className="text-sm text-gray-600 truncate">
                                    {typeof mostRecentConv.last_message === 'string'
                                        ? mostRecentConv.last_message
                                        : mostRecentConv.last_message?.content || 'New conversation'
                                    }
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ConversationList;