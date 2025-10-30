// src/components/messaging/MessageIcon.tsx
import React from "react";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotificationContext } from "../../contexts/NotificationContext";

const MessageIcon: React.FC = () => {
  const navigate = useNavigate();
  const { unreadMessageCount } = useNotificationContext();

  return (
    <button
      onClick={() => navigate("/messages")}
      className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      aria-label="Messages"
    >
      <MessageCircle className="h-6 w-6" />
      {unreadMessageCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center font-semibold px-1 shadow-lg animate-pulse">
          {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
        </span>
      )}
    </button>
  );
};

export default MessageIcon;
