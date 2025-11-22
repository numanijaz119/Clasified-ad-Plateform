// src/components/messaging/ConversationList.tsx
// Blue border ONLY for own ads (not user grouping card) + Block/Unblock in card menu
import React, { useState } from "react";
import {
  MessageCircle,
  Unlock,
  ExternalLink,
  ArrowLeft,
  ChevronRight,
  MoreVertical,
  Ban,
} from "lucide-react";
import type { Conversation, Message } from "../../types/messaging";
import { useAuth } from "../../contexts/AuthContext";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: number | null;
  onSelect: (conversation: Conversation) => void;
  onUnblock?: (conversationId: number) => void;
  onBlock?: (conversationId: number) => void;
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
  onBlock,
  onAdClick,
  loading,
  refreshing = false,
  isBlockedView = false,
}) => {
  const { user } = useAuth();
  const [viewingUserId, setViewingUserId] = useState<number | null>(null);
  const [showMenuFor, setShowMenuFor] = useState<number | null>(null);

  const groupedConversations = React.useMemo(() => {
    const groups = new Map<number, Conversation[]>();

    conversations.forEach(conv => {
      const userId = conv.other_user.id;
      if (!groups.has(userId)) {
        groups.set(userId, []);
      }
      groups.get(userId)!.push(conv);
    });

    groups.forEach(convs => {
      convs.sort(
        (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      );
    });

    return groups;
  }, [conversations]);

  const isOwnAd = (conversation: Conversation): boolean => {
    return user?.id === conversation.ad.user_id;
  };

  if (loading && (!conversations || conversations.length === 0)) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => (
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
        <p className="text-sm text-gray-400 mt-1">Start messaging sellers about their ads</p>
      </div>
    );
  }

  if (viewingUserId !== null) {
    const userConversations =
      Array.from(groupedConversations.entries()).find(
        ([userId]) => userId === viewingUserId
      )?.[1] || [];

    if (userConversations.length === 0) {
      setViewingUserId(null);
      return null;
    }

    const userInfo = userConversations[0].other_user;

    return (
      <div className="space-y-3">
        <button
          onClick={() => setViewingUserId(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to conversations</span>
        </button>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
              {userInfo.avatar ? (
                <img
                  src={userInfo.avatar}
                  alt={userInfo.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 font-semibold text-lg">
                  {userInfo.full_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{userInfo.full_name}</p>
              <p className="text-sm text-gray-500">
                {userConversations.length} conversation{userConversations.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {userConversations.map(conversation => {
            const isSelected = conversation.id === selectedId;
            const hasUnread = conversation.unread_count > 0;
            const isOwn = isOwnAd(conversation);
            const adImage = conversation.ad.primary_image?.image || "/placeholder.svg";

            return (
              <div key={conversation.id} className="relative group">
                <button
                  onClick={() => onSelect(conversation)}
                  className={`
                                        w-full text-left flex items-center gap-3 p-3 rounded-lg border-2 transition-all
                                        ${
                                          isSelected
                                            ? "bg-orange-50 border-orange-300"
                                            : isOwn
                                              ? "bg-white border-blue-400 hover:border-blue-500"
                                              : "bg-white border-gray-200 hover:border-gray-300"
                                        }
                                    `}
                >
                  <img
                    src={adImage}
                    alt={conversation.ad.title}
                    className="w-16 h-16 object-cover rounded flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate mb-1">
                      {conversation.ad.title}
                    </h4>
                    <p className="text-sm font-semibold text-orange-600 mb-1">
                      {conversation.ad.display_price}
                    </p>
                    {conversation.last_message && (
                      <p
                        className={`text-sm truncate ${hasUnread ? "text-gray-900 font-medium" : "text-gray-600"}`}
                      >
                        {typeof conversation.last_message === "string"
                          ? conversation.last_message
                          : conversation.last_message?.content || "New conversation"}
                      </p>
                    )}
                  </div>

                  {hasUnread && (
                    <span className="badge self-start badge-error badge-sm flex-shrink-0">
                      {conversation.unread_count}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Array.from(groupedConversations.entries()).map(([userId, userConversations]) => {
        const hasMultipleConversations = userConversations.length > 1;
        const userInfo = userConversations[0].other_user;
        const totalUnread = userConversations.reduce((sum, conv) => sum + conv.unread_count, 0);

        if (!hasMultipleConversations) {
          const conversation = userConversations[0];
          const isSelected = conversation.id === selectedId;
          const hasUnread = conversation.unread_count > 0;
          const isOwn = isOwnAd(conversation);

          return (
            <div key={userId} className="relative group">
              <button
                onClick={() => onSelect(conversation)}
                className={`
                                    w-full text-left p-4 rounded-lg border-2 transition-all
                                    ${
                                      isSelected
                                        ? "bg-orange-50 border-orange-300"
                                        : isOwn
                                          ? "bg-white border-blue-400 hover:border-blue-500"
                                          : "bg-white border-gray-200 hover:border-gray-300"
                                    }
                                `}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                    {userInfo.avatar ? (
                      <img
                        src={userInfo.avatar}
                        alt={userInfo.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 font-semibold">
                        {userInfo.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-semibold text-gray-900">{userInfo.full_name}</p>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-gray-600 truncate flex-1">
                        {conversation.ad.title}
                      </p>
                      {onAdClick && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onAdClick(conversation.ad.id);
                          }}
                          className="text-orange-600 hover:text-orange-700 flex-shrink-0"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {conversation.last_message && (
                      <p
                        className={`text-sm truncate ${hasUnread ? "text-gray-900 font-medium" : "text-gray-600"}`}
                      >
                        {typeof conversation.last_message === "string"
                          ? conversation.last_message
                          : conversation.last_message?.content || "New conversation"}
                      </p>
                    )}
                  </div>

                  {hasUnread && (
                    <span className="badge badge-error flex-shrink-0">
                      {conversation.unread_count}
                    </span>
                  )}
                </div>
              </button>

              <div className="absolute top-2 right-2">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setShowMenuFor(showMenuFor === conversation.id ? null : conversation.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                {showMenuFor === conversation.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenuFor(null)} />
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      {isBlockedView && onUnblock ? (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onUnblock(conversation.id);
                            setShowMenuFor(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                        >
                          <Unlock className="h-4 w-4" />
                          Unblock User
                        </button>
                      ) : (
                        onBlock && (
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              onBlock(conversation.id);
                              setShowMenuFor(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Ban className="h-4 w-4" />
                            Block User
                          </button>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        }

        const hasSelectedInGroup = userConversations.some(c => c.id === selectedId);
        const mostRecentConv = userConversations[0];

        return (
          <div key={userId} className="relative group">
            <button
              onClick={() => setViewingUserId(userId)}
              className={`
                                w-full text-left p-4 rounded-lg border transition-all
                                ${
                                  hasSelectedInGroup
                                    ? "bg-orange-50 border-orange-200"
                                    : "bg-white border-gray-200 hover:border-gray-300"
                                }
                            `}
            >
              <div className="flex items-start justify-between mb-2 mr-6">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                    {userInfo.avatar ? (
                      <img
                        src={userInfo.avatar}
                        alt={userInfo.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 font-semibold">
                        {userInfo.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userInfo.full_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {userConversations.length} conversation
                      {userConversations.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {totalUnread > 0 && (
                    <span className="badge badge-error flex-shrink-0">{totalUnread}</span>
                  )}
                </div>
              </div>

              {mostRecentConv.last_message && (
                <div className="flex justify-between">
                  <p className="text-sm text-gray-600 truncate">
                    {typeof mostRecentConv.last_message === "string"
                      ? mostRecentConv.last_message
                      : mostRecentConv.last_message?.content || "New conversation"}
                  </p>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </button>

            <div className="absolute top-3 right-2">
              <button
                onClick={e => {
                  e.stopPropagation();
                  setShowMenuFor(showMenuFor === userId ? null : userId);
                }}
                className="p-1.5 text-gray-400 text-gray-600 hover:bg-gray-100 rounded transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {showMenuFor === userId && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenuFor(null)} />
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    {isBlockedView && onUnblock ? (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onUnblock(userConversations[0].id);
                          setShowMenuFor(null);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                      >
                        <Unlock className="h-4 w-4" />
                        Unblock User
                      </button>
                    ) : (
                      onBlock && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onBlock(userConversations[0].id);
                            setShowMenuFor(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Ban className="h-4 w-4" />
                          Block User
                        </button>
                      )
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;
