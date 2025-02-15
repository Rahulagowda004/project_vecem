import React, { useState, useRef, useEffect } from "react";
import CommunityLayout from "../components/CommunityLayout";
import { User, MessageSquare, Send, Paperclip, Smile } from "lucide-react";

interface Message {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  reactions?: string[];
}

const onlineUsers = [
  {
    id: 1,
    name: "John Doe",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=John",
    status: "online",
    lastSeen: "2 hours ago",
    role: "Admin",
  },
  {
    id: 2,
    name: "Alice Smith",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Alice",
    status: "online",
    lastSeen: "Just now",
    role: "Member",
  },
  {
    id: 3,
    name: "Bob Johnson",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Bob",
    status: "offline",
    lastSeen: "5 minutes ago",
    role: "Member",
  },
  {
    id: 4,
    name: "Emma Wilson",
    avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Emma",
    status: "online",
    lastSeen: "1 hour ago",
    role: "Moderator",
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
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
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

  return (
    <CommunityLayout>
      <div className="p-6">
        <div className="flex h-screen bg-gray-900">
          {/* Sidebar - Online Users */}
          <div className="w-72 bg-gray-800 border-r border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                <User className="w-5 h-5" />
                Online Users (
                {onlineUsers.filter((u) => u.status === "online").length})
              </h2>
            </div>
            <div className="px-2">
              {onlineUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className="w-full p-3 flex items-center space-x-3 hover:bg-gray-700 rounded-lg transition-colors duration-150 ease-in-out"
                >
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${
                        user.status === "online"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user.status === "online"
                        ? "Online"
                        : `Last seen ${user.lastSeen}`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
              <h1 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                Chat Room
              </h1>
            </div>

            {/* Messages */}
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
                        <span className="text-xs text-gray-500">
                          {message.timestamp}
                        </span>
                      </div>
                      <p className="text-gray-300 mt-1">{message.content}</p>
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
                  <Paperclip className="w-5 h-5" />
                </button>
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
      </div>
    </CommunityLayout>
  );
};

export default Community;
