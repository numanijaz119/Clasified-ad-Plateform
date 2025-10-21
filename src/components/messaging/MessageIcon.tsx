// src/components/messaging/MessageIcon.tsx
import React, { useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useConversations } from '../../hooks/useMessaging';

const MessageIcon: React.FC = () => {
  const navigate = useNavigate();
  const { unreadCount } = useConversations();

  return (
    <button
      onClick={() => navigate('/messages')}
      className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      aria-label="Messages"
    >
      <MessageCircle className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default MessageIcon;