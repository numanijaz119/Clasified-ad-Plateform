// src/pages/MessagesPage.tsx
import React, { useState, useEffect } from 'react';
import { MessageCircle, ArrowLeft, MoreVertical, Archive, Ban } from 'lucide-react';
import { useConversations, useMessages } from '../hooks/useMessaging';
import ConversationList from '../components/messaging/ConversationList';
import MessageThread from '../components/messaging/MessageThread';
import MessageInput from '../components/messaging/MessageInput';
import type { Conversation } from '../types/messaging';
import { useToast } from '../contexts/ToastContext';

const MessagesPage: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showActions, setShowActions] = useState(false);
  
  const toast = useToast();
  
  const {
    conversations,
    loading: loadingConversations,
    unreadCount,
    markAsRead,
    archiveConversation,
    blockConversation,
  } = useConversations();

  const {
    messages,
    loading: loadingMessages,
    sending,
    sendMessage,
    markAsRead: markMessagesRead,
  } = useMessages(selectedConversation?.id || null);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && selectedConversation.unread_count > 0) {
      markAsRead(selectedConversation.id);
      markMessagesRead();
    }
  }, [selectedConversation, markAsRead, markMessagesRead]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowActions(false);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    setShowActions(false);
  };

  const handleArchive = async () => {
    if (!selectedConversation) return;
    
    await archiveConversation(selectedConversation.id);
    setSelectedConversation(null);
    setShowActions(false);
  };

  const handleBlock = async () => {
    if (!selectedConversation) return;
    
    if (window.confirm('Are you sure you want to block this user?')) {
      await blockConversation(selectedConversation.id);
      setSelectedConversation(null);
      setShowActions(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-orange-500" />
            Messages
            {unreadCount > 0 && (
              <span className="badge badge-error">{unreadCount}</span>
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your conversations with buyers and sellers
          </p>
        </div>

        {/* Main Content */}
        <div className="card overflow-hidden" style={{ height: 'calc(100vh - 240px)' }}>
          <div className="flex h-full">
            {/* Conversations List - Left Side */}
            <div
              className={`
                ${selectedConversation ? 'hidden md:block' : 'block'}
                w-full md:w-96 border-r border-gray-200 overflow-y-auto scrollbar-thin
              `}
            >
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-900">Conversations</h2>
                <p className="text-sm text-gray-500">
                  {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="p-4">
                <ConversationList
                  conversations={conversations}
                  selectedId={selectedConversation?.id || null}
                  onSelect={handleSelectConversation}
                  loading={loadingConversations}
                />
              </div>
            </div>

            {/* Message Thread - Right Side */}
            <div
              className={`
                ${selectedConversation ? 'flex' : 'hidden md:flex'}
                flex-1 flex-col
              `}
            >
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Back Button (Mobile) */}
                      <button
                        onClick={handleBackToList}
                        className="md:hidden btn-ghost p-2"
                        aria-label="Back to conversations"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>

                      {/* User Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        {selectedConversation.other_user.avatar ? (
                          <img
                            src={selectedConversation.other_user.avatar}
                            alt={selectedConversation.other_user.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 font-semibold">
                            {selectedConversation.other_user.full_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {selectedConversation.other_user.full_name}
                        </p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {selectedConversation.ad.title}
                        </p>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setShowActions(!showActions)}
                        className="btn-ghost p-2"
                        aria-label="More actions"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>

                      {showActions && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={handleArchive}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Archive className="h-4 w-4" />
                            Archive Conversation
                          </button>
                          <button
                            onClick={handleBlock}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Ban className="h-4 w-4" />
                            Block User
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <MessageThread messages={messages} loading={loadingMessages} />

                  {/* Message Input */}
                  <MessageInput
                    onSend={sendMessage}
                    sending={sending}
                    disabled={selectedConversation.is_blocked}
                  />

                  {selectedConversation.is_blocked && (
                    <div className="bg-yellow-50 border-t border-yellow-200 p-3 text-center">
                      <p className="text-sm text-yellow-800">
                        This conversation has been blocked
                      </p>
                    </div>
                  )}
                </>
              ) : (
                // No conversation selected
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Select a conversation</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;