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
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Assuming you have an AuthContext for Firebase
import { motion, AnimatePresence } from "framer-motion";

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
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessage, setEditingMessage] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeChat, setActiveChat] = useState<number>(1);

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
      userName: user?.displayName || "You",
      userAvatar: user?.photoURL || "https://api.dicebear.com/6.x/avataaars/svg?seed=You",
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

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -10 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  return (
    <CommunityLayout>
      <motion.div 
        className="h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex h-full bg-gray-900">
          {/* Chat List Sidebar */}
          <div className="w-80 border-r border-gray-800 flex flex-col">
            {/* Search Users */}
            <div className="p-4 border-b border-gray-800">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search or start new chat"
                  className="w-full bg-gray-800/50 text-gray-200 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {onlineUsers.map((user) => (
                <motion.button
                  key={user.id}
                  onClick={() => setActiveChat(user.id)}
                  whileHover={{ x: 4 }}
                  className={`w-full p-4 flex items-center space-x-4 hover:bg-gray-800/50 transition-colors ${
                    activeChat === user.id ? 'bg-gray-800/80' : ''
                  }`}
                >
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${
                      user.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className="text-gray-200 font-medium">{user.name}</span>
                      <span className="text-xs text-gray-400">{user.lastSeen}</span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">Click to start chatting</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="h-16 border-b border-gray-800 flex items-center px-6 bg-gray-800/80 backdrop-blur-sm">
              <div className="flex items-center space-x-4">
                <img
                  src={onlineUsers.find(u => u.id === activeChat)?.avatar}
                  alt="Chat Avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="text-gray-200 font-medium">
                    {onlineUsers.find(u => u.id === activeChat)?.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {onlineUsers.find(u => u.id === activeChat)?.status === 'online' ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex ${message.userId === 1 ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${message.userId === 1 ? 'bg-cyan-500/20' : 'bg-gray-800/80'} rounded-2xl px-4 py-2 backdrop-blur-sm`}>
                      <div className="flex items-end space-x-2">
                        <p className="text-gray-200">{message.content}</p>
                        <span className="text-xs text-gray-400 min-w-[4rem] text-right">
                          {message.timestamp}
                        </span>
                      </div>
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex gap-1 mt-1 justify-end">
                          {message.reactions.map((reaction, index) => (
                            <span key={index} className="text-sm">{reaction}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Message Input */}
            <div className="p-4 bg-gray-800/80 backdrop-blur-sm">
              <motion.div 
                className="flex items-center space-x-3 bg-gray-700/50 rounded-full px-4 py-2"
                whileHover={{ scale: 1.01 }}
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-400 hover:text-gray-200"
                >
                  <Smile className="w-5 h-5" />
                </motion.button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message"
                  className="flex-1 bg-transparent text-gray-200 placeholder-gray-400 focus:outline-none"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 text-cyan-400 hover:text-cyan-300 disabled:text-gray-600"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </CommunityLayout>
  );
};

export default Community;