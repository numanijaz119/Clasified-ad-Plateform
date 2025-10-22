// src/pages/MessagesPage.tsx - COMPLETE PROFESSIONAL VERSION
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, ArrowLeft, MoreVertical, Archive, Ban, Search, X } from 'lucide-react';
import { useConversations, useMessages } from '../hooks/useMessaging';
import ConversationList from '../components/messaging/ConversationList';
import MessageThread from '../components/messaging/MessageThread';
import MessageInput from '../components/messaging/MessageInput';
import type { Conversation } from '../types/messaging';
import { useToast } from '../contexts/ToastContext';

const MessagesPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    conversations,
    loading: loadingConversations,
    unreadCount,
    markAsRead,
    archiveConversation,
    blockConversation,
    refetch: refetchConversations,
    refreshing: refreshingConversations,
  } = useConversations();

  const {
    messages,
    loading: loadingMessages,
    sending,
    sendMessage,
    markAsRead: markMessagesRead,
    refetch: refetchMessages,
  } = useMessages(selectedConversation?.id || null);

  // Initial fetch and auto-refresh setup
  useEffect(() => {
    let isMounted = true;
    let refreshTimer: NodeJS.Timeout;
    
    const fetchData = async (isBackgroundRefresh = false) => {
      if (!isMounted) return;
      
      try {
        await refetchConversations(isBackgroundRefresh);
      } catch (error) {
        console.error('Error refreshing conversations:', error);
      }
      
      // Schedule next refresh only if component is still mounted
      if (isMounted) {
        refreshTimer = setTimeout(() => fetchData(true), 10000); // 10 seconds
      }
    };
    
    // Initial fetch
    fetchData(false);
    
    // Set up visibility change handler for more efficient refreshes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData(true);
      } else {
        clearTimeout(refreshTimer);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(refreshTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetchConversations]);

  // Auto-refresh messages every 5 seconds when conversation is selected
  useEffect(() => {
    if (selectedConversation?.id) {
      const interval = setInterval(() => {
        refetchMessages();
      }, 5000); // 5 seconds

      return () => clearInterval(interval);
    }
  }, [selectedConversation?.id, refetchMessages]);

  // Handle conversation selection from URL
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === parseInt(conversationId));
      if (conversation) {
        setSelectedConversation(conversation);
      }
    }
  }, [conversationId, conversations]);

  // Handle conversation selection from navigation state (from ad modal)
  useEffect(() => {
    const state = location.state as { conversationId?: number };
    
    if (state?.conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === state.conversationId);
      if (conversation) {
        handleSelectConversation(conversation);
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, conversations]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && selectedConversation.unread_count > 0) {
      markAsRead(selectedConversation.id);
      markMessagesRead();
    }
  }, [selectedConversation?.id]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowActions(false);
    // Update URL without page reload
    navigate(`/messages/${conversation.id}`, { replace: true });
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    setShowActions(false);
    navigate('/messages', { replace: true });
  };

  const handleArchive = async () => {
    if (!selectedConversation) return;
    
    await archiveConversation(selectedConversation.id);
    handleBackToList();
  };

  const handleBlock = async () => {
    if (!selectedConversation) return;
    
    if (window.confirm('Are you sure you want to block this user?')) {
      await blockConversation(selectedConversation.id);
      handleBackToList();
    }
  };

  const handleSendMessage = async (content: string) => {
    const success = await sendMessage(content);
    if (success) {
      // Silently refresh conversations to update last message
      refetchConversations(true).catch(console.error);
      setTimeout(() => refetchConversations(), 500);
    }
    return success;
  };

  // Filter conversations by search query
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const userName = conv.other_user.full_name.toLowerCase();
    const adTitle = conv.ad.title.toLowerCase();
    
    return userName.includes(query) || adTitle.includes(query);
  });

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
                w-full md:w-96 border-r border-gray-200 flex flex-col
              `}
            >
              {/* Search Bar */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="input pl-10 pr-10 py-2 text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
                <ConversationList
                  conversations={filteredConversations}
                  selectedId={selectedConversation?.id || null}
                  onSelect={handleSelectConversation}
                  loading={loadingConversations}
                  refreshing={refreshingConversations}
                />
              </div>
            </div>

            {/* Message Thread - Right Side */}
            <div
              className={`
                ${selectedConversation ? 'flex' : 'hidden md:flex'}
                flex-1 flex-col bg-white
              `}
               style={{ minHeight: 0 }}
            >
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
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
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {selectedConversation.other_user.full_name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
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
                        <>
                          {/* Backdrop to close */}
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setShowActions(false)}
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
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
                        </>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <MessageThread 
                    messages={messages} 
                    loading={loadingMessages}
                    conversationId={selectedConversation.id}
                  />

                  {/* Message Input */}
                  {!selectedConversation.is_blocked ? (
                    <MessageInput
                      onSend={handleSendMessage}
                      sending={sending}
                    />
                  ) : (
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