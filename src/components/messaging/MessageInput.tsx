// src/components/messaging/MessageInput.tsx
import React, { useState, useRef, KeyboardEvent, useEffect } from "react";
import { Send, Loader } from "lucide-react";

interface MessageInputProps {
  onSend: (message: string) => Promise<boolean>;
  disabled?: boolean;
  sending?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled, sending }) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const shouldRefocus = useRef(false);

  // Auto-focus input when component mounts
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  // Keep focus after sending message successfully
  useEffect(() => {
    if (shouldRefocus.current && textareaRef.current) {
      textareaRef.current.focus();
      shouldRefocus.current = false;
    }
  });

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!message.trim() || sending || disabled) return;

    const success = await onSend(message);
    if (success) {
      setMessage("");
      shouldRefocus.current = true;
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        // Keep focus on input after sending
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter, new line on Shift+Enter
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
      <div className="flex items-end gap-2">
        {/* Message Input */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          disabled={disabled || sending}
          rows={1}
          className="
            flex-1 px-4 py-2 border border-gray-300 rounded-lg
            resize-none overflow-y-auto
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            transition-colors
          "
          style={{ maxHeight: "120px" }}
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || disabled || sending}
          className="btn-primary h-[41.33px] px-4 py-2 flex-shrink-0"
          aria-label="Send message"
        >
          {sending ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-400 mt-2">Press Enter to send, Shift+Enter for new line</p>
    </form>
  );
};

export default MessageInput;
