import React, { useState, useRef, useEffect } from "react";
import CommunityLayout from "../components/CommunityLayout";
import {
  MessageSquare,
  Send,
  Smile,
  Edit2,
  Trash2,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";

interface Message {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  reactions?: string[];
  isEditing?: boolean;
  isTyping?: boolean;
}

const onlineUsers = [
  {
    id: 1,
    name: "John Doe",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=John",
    status: "online",
    lastSeen: "2 hours ago",
  },
  {
    id: 2,
    name: "Alice Smith",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Alice",
    status: "online",
    lastSeen: "Just now",
  },
  {
    id: 3,
    name: "Bob Johnson",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Bob",
    status: "offline",
    lastSeen: "5 minutes ago",
  },
  {
    id: 4,
    name: "Emma Wilson",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Emma",
    status: "online",
    lastSeen: "1 hour ago",
  },
];

const initialMessages: Message[] = [
  {
    id: 1,
    userId: 1,
    userName: "John Doe",
    userAvatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=John",
    content: "Hello everyone!",
    timestamp: "2:30 PM",
  },
  {
    id: 2,
    userId: 2,
    userName: "Alice Smith",
    userAvatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Alice",
    content: "Hi John! How's everyone doing?",
    timestamp: "2:31 PM",
    reactions: ["👋", "😊"],
  },
  {
    id: 3,
    userId: 3,
    userName: "Bob Johnson",
    userAvatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Bob",
    content: "Just joined the community. Excited to be here!",
    timestamp: "2:35 PM",
    reactions: ["🎉"],
  },
];

const Community = () => {
  const { user, isAuthenticated, logout } = useAuth0();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessage, setEditingMessage] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg: Message = {
      id: messages.length + 1,
      userId: 1, // Assuming current user
      userName: "You",
      userAvatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=You",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      reactions: [],
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  const handleUserClick = (userId: number) => {
    // Handle user click
    console.log("User clicked:", userId);
  };

  const handleEditMessage = (messageId: number) => {
    setEditingMessage(messageId);
  };

  const handleDeleteMessage = (messageId: number) => {
    setMessages(messages.filter((m) => m.id !== messageId));
  };

  const handleReaction = (messageId: number, reaction: string) => {
    setMessages(
      messages.map((message) => {
        if (message.id === messageId) {
          const reactions = message.reactions || [];
          return {
            ...message,
            reactions: reactions.includes(reaction)
              ? reactions.filter((r) => r !== reaction)
              : [...reactions, reaction],
          };
        }
        return message;
      })
    );
  };

  return (
    <CommunityLayout>
      <div className="h-screen">
        <div className="flex flex-col h-full bg-gray-900">
          {/* Navbar - now at the very top */}
          <div className="bg-gray-800 shadow-lg w-full z-50 h-16 flex items-center justify-between px-4">
            <h1 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              Chat Room
            </h1>
            {isAuthenticated && user && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.picture}
                    alt={user.name}
                  />
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform ${
                      isProfileOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        <User className="h-4 w-4 mr-3" />
                        My Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </Link>
                      <button
                        onClick={() =>
                          logout({
                            logoutParams: {
                              returnTo: window.location.origin,
                            },
                          })
                        }
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-red-500"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Messages - removed mt-16 and adjusted flex layout */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
            {messages.map((message) => (
              <div className="group" key={message.id}>
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => handleUserClick(message.userId)}
                    className="flex-shrink-0"
                  >
                    <img
                      src={message.userAvatar}
                      alt={message.userName}
                      className="w-10 h-10 rounded-full object-cover hover:ring-2 hover:ring-blue-500 transition-all"
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUserClick(message.userId)}
                        className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {message.userName}
                      </button>
                      <span
                        className="text-xs text-gray-500 hover:text-gray-400 cursor-help"
                        title={new Date().toLocaleString()}
                      >
                        {message.timestamp}
                      </span>
                    </div>
                    {editingMessage === message.id ? (
                      <input
                        type="text"
                        value={message.content}
                        onChange={(e) => {
                          setMessages(
                            messages.map((m) =>
                              m.id === message.id
                                ? { ...m, content: e.target.value }
                                : m
                            )
                          );
                        }}
                        onBlur={() => setEditingMessage(null)}
                        className="mt-1 w-full bg-gray-700 text-gray-200 rounded px-2 py-1"
                        autoFocus
                      />
                    ) : (
                      <p className="text-gray-300 mt-1">{message.content}</p>
                    )}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {message.reactions.map((reaction, index) => (
                          <span
                            key={index}
                            className="bg-gray-700 px-2 py-1 rounded-full text-sm"
                          >
                            {reaction}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Message actions */}
                    <div className="hidden group-hover:flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => setShowEmojiPicker(message.id)}
                        className="text-gray-400 hover:text-gray-300"
                      >
                        <Smile className="w-4 h-4" />
                      </button>
                      {showEmojiPicker === message.id && (
                        <div className="absolute bottom-full mb-2 bg-gray-800 rounded-lg shadow-lg p-2">
                          {["👋", "😊", "❤️", "👍", "🎉"].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => {
                                handleReaction(message.id, emoji);
                                setShowEmojiPicker(null);
                              }}
                              className="p-1 hover:bg-gray-700 rounded"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                      {message.userId === 1 && ( // Assuming 1 is current user
                        <>
                          <button
                            onClick={() => handleEditMessage(message.id)}
                            className="text-gray-400 hover:text-gray-300"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-gray-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Message Input */}
          <div className="p-4 border-t border-gray-700 bg-gray-800">
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-200 transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 bg-gray-700 text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-colors"
              >
                <Send className="w-5 h-5" />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </CommunityLayout>
  );
};

export default Community;
