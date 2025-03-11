import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  MessageSquare,
  HelpCircle,
  Tag,
  CornerDownRight,
  MessageCircle,
  X,
  Search,
  ChevronRight,
  Home, // Add these imports
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom"; // Add this import

interface Message {
  id: number;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  tag: "general" | "issue";
  replies?: Message[];
}

interface MessagePayload {
  title: string;
  description: string;
  uid: string;
  created_at: string;
}

const messageTagConfig = {
  general: {
    color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/20",
    label: "General",
  },
  issue: {
    color: "bg-rose-400/20 text-rose-300 border-rose-400/20",
    label: "Issue",
  },
};

// Add new animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300,
    },
  },
};

const Community = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Add this line
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedTag, setSelectedTag] = useState<"general" | "issue">(
    "general"
  );
  const [selectedFilter, setSelectedFilter] = useState<"general" | "issue">(
    "general"
  );
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [currentTag, setCurrentTag] = useState<"general" | "issue">("general");

  // Update the formatWhatsAppTimestamp function
const formatWhatsAppTimestamp = (dateString: string | Date) => {
  try {
    // Debug log to see what we're receiving
    console.log('Raw timestamp:', dateString);

    // Handle different date formats
    let messageDate: Date;

    if (typeof dateString === 'string') {
      // Try parsing the string directly first
      messageDate = new Date(dateString);
      
      if (isNaN(messageDate.getTime())) {
        // If parsing failed, try different formats
        if (dateString.includes(' ')) {
          // Handle MySQL format: "YYYY-MM-DD HH:mm:ss"
          const [date, time] = dateString.split(' ');
          messageDate = new Date(`${date}T${time}`);
        } else if (dateString.includes('/')) {
          // Handle date format with slashes
          const [month, day, year] = dateString.split('/');
          messageDate = new Date(Number(year), Number(month) - 1, Number(day));
        }
      }
    } else if (dateString instanceof Date) {
      messageDate = dateString;
    } else {
      console.error('Unsupported date format:', dateString);
      return dateString.toString();
    }

    // Validate the parsed date
    if (!messageDate || isNaN(messageDate.getTime())) {
      console.error('Invalid date:', dateString);
      return dateString.toString();
    }

    // Format the date
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === now.toDateString()) {
      const formattedTime = messageDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      console.log('Today\'s formatted time:', formattedTime);
      return formattedTime.toLowerCase();
    }

    // Rest of the formatting logic remains the same
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${messageDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).toLowerCase()}`;
    }

    if (messageDate.getFullYear() === now.getFullYear()) {
      return `${messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })} ${messageDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).toLowerCase()}`;
    }

    return `${messageDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })} ${messageDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase()}`;

  } catch (error) {
    console.error('Error formatting date:', error);
    // Return the original string if we can't parse it
    return String(dateString);
  }
};

  const postMessage = async (content: string, tag: "general" | "issue") => {
    try {
      const payload = {
        title: tag === "general" ? "General Message" : "Issue",
        description: content,
        uid: user?.uid,
        created_at: new Date().toISOString(),
      };

      const response = await fetch(`http://127.0.0.1:5000/community/${tag}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to post message");
      }

      const result = await response.json();
      return {
        ...result,
        payload, // Include the original payload in the response
      };
    } catch (error) {
      console.error("Error posting message:", error);
      throw error;
    }
  };

  const postReply = async (issueId: string, content: string) => {
    try {
      const payload = {
        issue_id: issueId,
        title: "Reply",
        description: content,
        uid: user?.uid,
        created_at: new Date().toISOString(),
      };

      const response = await fetch("http://127.0.0.1:5000/community/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to post reply");
      }

      return await response.json();
    } catch (error) {
      console.error("Error posting reply:", error);
      throw error;
    }
  };

  // Update the fetchMessages function to properly format timestamps
const fetchMessages = async (tag: "general" | "issue") => {
  try {
    const response = await fetch(
      `http://127.0.0.1:5000/community/messages/${tag}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch messages");
    }
    const data = await response.json();
    console.log('Raw message data:', data); // Debug log

    return data.map((message: any) => {
      // Log each message's timestamp for debugging
      console.log('Message timestamp:', message.created_at || message.timestamp);
      
      return {
        ...message,
        // Ensure we have a valid timestamp
        timestamp: message.created_at || message.timestamp || new Date().toISOString()
      };
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

  useEffect(() => {
    const loadMessages = async () => {
      const messages = await fetchMessages(selectedFilter);
      setMessages(messages);
    };
    loadMessages();
  }, [selectedFilter]); // Reload when filter changes

  // Add these two useEffect hooks for auto-refresh and scrolling
  useEffect(() => {
    const interval = setInterval(async () => {
      const messages = await fetchMessages(selectedFilter);
      setMessages(messages);
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [selectedFilter]);

  useEffect(() => { // This is correct
    const scrollToBottom = () => {
      const messagesDiv = document.querySelector(".messages-container");
      if (messagesDiv) {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      }
    };
    scrollToBottom();
  }, [messages]);

  // Update handleSendMessage function
const handleSendMessage = async () => {
  if (!newMessage.trim() || !user) return;

  try {
    const timestamp = new Date().toISOString();
    const result = await postMessage(newMessage, currentTag);
    console.log('Message post response:', result);

    const newMsg: Message = {
      id: result.id,
      userId: user.uid,
      userName: user.displayName || "Anonymous",
      userAvatar: user.photoURL || `https://api.dicebear.com/6.x/avataaars/svg?seed=${user.uid}`,
      content: result.payload.description,
      // Use the most reliable timestamp source
      timestamp: result.created_at || result.timestamp || timestamp,
      tag: currentTag,
      replies: [],
    };

    console.log('New message timestamp:', newMsg.timestamp);
    setMessages((prev) => [...prev, newMsg]);
    setNewMessage("");
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

  // Add function to handle replies
  // Update handleReply function
const handleReply = async (parentMessage: Message) => {
  if (!newMessage.trim() || !user) return;

  try {
    const result = await postReply(parentMessage.id.toString(), newMessage);
    console.log('Reply response:', result); // Debug log

    const newReply: Message = {
      id: result.id,
      userId: user.uid,
      userName: user.displayName || "Anonymous",
      userAvatar: user.photoURL || `https://api.dicebear.com/6.x/avataaars/svg?seed=${user.uid}`,
      content: newMessage,
      timestamp: result.timestamp || result.created_at,
      tag: selectedTag,
    };

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === parentMessage.id
          ? { ...msg, replies: [...(msg.replies || []), newReply] }
          : msg
      )
    );

    setNewMessage("");
    setReplyingTo(null);
  } catch (error) {
    console.error("Error sending reply:", error);
  }
};

  const handleFilterChange = async (newFilter: "general" | "issue") => {
    setSelectedFilter(newFilter);
    setCurrentTag(newFilter);
    const messages = await fetchMessages(newFilter);
    setMessages(messages);
  };

  const filteredMessages = messages.filter(
    (message) => message.tag === selectedFilter
  );

  // Add this function
  const filteredIssueMessages = messages.filter(
    (message) =>
      selectedFilter === "issue" &&
      message.tag === "issue" &&
      (message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.userName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Add guidelines content
  const communityGuidelines = {
    title: "Community Guidelines",
    description:
      "Welcome to our community! Please follow these guidelines to ensure effective communication and collaboration.",
    tagGuidelines: {
      general: "For community updates, announcements, and general discussions",
      issue: "For reporting problems, asking questions, or seeking help",
    },
    rules: [
      {
        icon: "🏷️",
        title: "Use Appropriate Tags",
        description:
          "Always select the right tag for your messages: General for regular discussions and Issue for problems.",
      },
      {
        icon: "❓",
        title: "Asking Questions",
        description:
          "Use the 'Issue' tag when asking questions. Be clear and provide necessary details.",
      },
      {
        icon: "💡",
        title: "Providing Solutions",
        description: "Ensure your answers are helpful and well-explained.",
      },
      {
        icon: "💬",
        title: "General Discussion",
        description:
          "Use the 'General' tag for announcements, updates, or general conversations.",
      },
      {
        icon: "🤝",
        title: "Be Respectful",
        description:
          "Maintain a professional and respectful tone. Avoid inflammatory language.",
      },
      {
        icon: "✨",
        title: "Quality Content",
        description:
          "Keep messages clear, relevant, and constructive. Avoid spam or off-topic discussions.",
      },
    ],
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (replyingTo) {
        handleReply(replyingTo);
      } else {
        handleSendMessage();
      }
    }
  };

  const renderReplies = (replies: Message[]) => {
    if (!replies || replies.length === 0) return null;

    return (
      <div className="ml-12 mt-2 border-l-2 border-gray-800 space-y-4">
        {replies.map((reply) => (
          <motion.div
            key={reply.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pl-4 flex items-start space-x-4"
          >

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative flex-shrink-0"
            >
              <img
                src={reply.userAvatar}
                alt={reply.userName}
                className="w-8 h-8 rounded-xl ring-2 ring-cyan-500/20"
              />
            </motion.div>
            <div className="flex-1 flex flex-col">
              <motion.div
                whileHover={{ scale: 1.01 }}
                className={`max-w-md rounded-xl p-3 ${
                  reply.userId === user?.uid
                    ? "bg-gradient-to-r from-cyan-500/5 via-teal-500/5 to-emerald-500/5"
                    : "bg-white/5 hover:bg-cyan-900/10"
                }`}
              >
                <div className="mb-1">
                  <span className="text-cyan-400 text-sm">{reply.userName}</span>
                  {reply.userId === user?.uid && (
                    <span className="text-xs text-cyan-400/50 ml-2">(You)</span>
                  )}
                </div>
                <p className="text-white text-sm">{reply.content}</p>
              </motion.div>
              {/* Add timestamp below the reply */}
              <div className="mt-1 text-xs text-gray-500">
                {formatWhatsAppTimestamp(reply.timestamp)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderMessage = (message: Message) => {
    const isOwnMessage = message.userId === user?.uid;
    const isGeneralMessage = message.tag === "general";

    if (!isGeneralMessage) {
      return (
        <div className="flex items-start space-x-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative flex-shrink-0"
          >
            <img
              src={message.userAvatar}
              alt={message.userName}
              className="w-10 h-10 rounded-xl ring-2 ring-cyan-500/20"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full ring-2 ring-black" />
          </motion.div>

          <div className="flex-1 flex flex-col">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className={`max-w-md rounded-2xl p-4 ${
                isOwnMessage
                  ? "bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-emerald-500/10"
                  : "bg-white/5 hover:bg-cyan-900/20"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="text-sm text-cyan-400"
                >
                  {message.userName}
                  {isOwnMessage && (
                    <span className="text-xs text-cyan-400/50 ml-2">(You)</span>
                  )}
                </motion.span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setReplyingTo(message)}
                  className="text-xs text-gray-400 hover:text-cyan-400 flex items-center space-x-1"
                >
                  <CornerDownRight className="w-3 h-3" />
                  <span>Reply</span>
                </motion.button>
              </div>
              <p className="text-white text-sm">{message.content}</p>
            </motion.div>
            {/* Add timestamp below the message */}
            <div className="mt-1 text-xs text-gray-500">
              {formatWhatsAppTimestamp(message.timestamp)}
            </div>
          </div>
        </div>
      );
    }

    // New rendering for general messages
    return (
      <div className={`flex items-start space-x-4 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative flex-shrink-0"
        >
          <img
            src={message.userAvatar}
            alt={message.userName}
            className="w-10 h-10 rounded-xl ring-2 ring-cyan-500/20"
          />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full ring-2 ring-black" />
        </motion.div>

        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          <motion.div
            whileHover={{ scale: 1.01 }}
            className={`max-w-md rounded-2xl p-4 ${
              isOwnMessage
                ? "bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-emerald-500/10"
                : "bg-white/5 hover:bg-cyan-900/20"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="text-sm text-cyan-400"
              >
                {message.userName}
              </motion.span>
            </div>
            <p className="text-white text-sm">{message.content}</p>
          </motion.div>

          <div className={`flex items-center mt-1 space-x-2 text-xs ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
            {isOwnMessage && (
              <span className="text-xs text-cyan-400/50">(You)</span>
            )}
            <span className="text-gray-500">{formatWhatsAppTimestamp(message.timestamp)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex-1 flex flex-col relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0f1829] to-gray-900"
    >
      {/* Guidelines Modal */}
      <AnimatePresence>
        {showGuidelines && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gradient-to-b from-gray-800/90 to-gray-900/90 rounded-2xl border border-white/10 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl backdrop-blur-xl"
            >
              {/* Guidelines Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <HelpCircle className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {communityGuidelines.title}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {communityGuidelines.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGuidelines(false)}
                  className="p-1 rounded-lg hover:bg-gray-700/50"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Add Tag Guidelines Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Message Tags
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(messageTagConfig).map(([tag, config]) => (
                    <div
                      key={tag}
                      className={`p-4 rounded-xl ${config.color} border border-opacity-20`}
                    >
                      <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4" />
                        <span className="font-medium">{config.label}</span>
                      </div>
                      <p className="text-sm mt-2 text-gray-300">
                        {
                          communityGuidelines.tagGuidelines[
                            tag as keyof typeof communityGuidelines.tagGuidelines
                          ]
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guidelines Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {communityGuidelines.rules.map((rule, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-gray-700/30 border border-gray-600/50 hover:border-cyan-500/20 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{rule.icon}</span>
                      <div>
                        <h3 className="font-medium text-white mb-1">
                          {rule.title}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {rule.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowGuidelines(false)}
                className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium"
              >
                I Understand
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Chat Header - Fixed */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 left-0 right-0 z-20 px-6 py-4 bg-gray-900/50 border-b border-cyan-500/10 backdrop-blur-xl"
        >
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <MessageSquare className="w-6 h-6 text-indigo-400" />
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    Community Chat
                  </h2>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* Updated Tag Filters */}
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-2">
                    {Object.entries(messageTagConfig).map(([tag, config]) => (
                      <motion.button
                        key={tag}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleFilterChange(tag as "general" | "issue")
                        }
                        className={`px-3 py-1 rounded-full flex items-center space-x-1.5 ${
                          selectedFilter === tag
                            ? config.color
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        <span>{config.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowGuidelines(true)}
                  className="group relative px-4 py-2 rounded-xl overflow-hidden bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-emerald-500/20 hover:from-cyan-500/30 hover:via-teal-500/30 hover:to-emerald-500/30 text-cyan-400 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4" />
                    <span>Guidelines</span>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Add the animated search bar */}
            <AnimatePresence>
              {selectedFilter === "issue" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center space-x-2 bg-gray-800/50 rounded-xl p-2 border border-rose-500/20">
                    <Search className="w-5 h-5 text-rose-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search issues..."
                      className="flex-1 bg-transparent px-2 py-1 text-white placeholder-gray-400 focus:outline-none text-sm"
                    />
                    {searchQuery && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSearchQuery("")}
                        className="p-1 rounded-lg hover:bg-gray-700/50"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Messages Area - Scrollable */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 overflow-y-auto px-6 py-8 space-y-6 bg-gradient-to-b from-gray-900/50 to-gray-800/50 messages-container"
        >
          {(selectedFilter === "issue" && searchQuery
            ? filteredIssueMessages
            : filteredMessages
          ).map((message) => (
            <motion.div
              key={message.id}
              variants={messageVariants}
              layout
              className="mb-6"
            >
              {renderMessage(message)}
              {message.tag === "issue" && renderReplies(message.replies || [])}
            </motion.div>
          ))}
        </motion.div>

        {/* Input Area - Fixed */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky bottom-0 left-0 right-0 z-20 border-t border-gray-800/50 bg-gray-900/80 backdrop-blur-xl"
        >
          <div className="px-6 py-4">
            {replyingTo && (
              <div className="mb-2 p-2 bg-gray-700/50 rounded-lg flex justify-between items-center">
                <div className="flex items-center text-gray-400">
                  <CornerDownRight className="w-4 h-4 mr-2" />
                  Replying to {replyingTo.userName}
                </div>
                <button onClick={() => setReplyingTo(null)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Type your ${currentTag} message...`}
                className="flex-1 bg-gray-800/50 text-white rounded-xl px-6 py-3.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 placeholder-gray-400 border border-gray-700/50"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={replyingTo ? () => handleReply(replyingTo) : handleSendMessage}
                className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg flex items-center justify-center gap-2 group"
              >
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Community;
