import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, MessageSquare, HelpCircle, Tag, 
  CornerDownRight, MessageCircle, X, Search,
  ChevronRight, Home // Add these imports
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
  tag: 'general' | 'issue';
  replies?: Message[];
}

const messageTagConfig = {
  general: {
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/20',
    label: 'General'
  },
  issue: {
    color: 'bg-rose-400/20 text-rose-300 border-rose-400/20',
    label: 'Issue'
  }
};

// Add new animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300
    }
  }
};

const Community = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Add this line
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedTag, setSelectedTag] = useState<'general' | 'issue'>('general');
  const [selectedFilter, setSelectedFilter] = useState<'general' | 'issue'>('general');
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    const newMsg: Message = {
      id: Date.now(),
      userId: user.uid,
      userName: user.displayName || "Anonymous",
      userAvatar: user.photoURL || `https://api.dicebear.com/6.x/avataaars/svg?seed=${user.uid}`,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      tag: selectedTag,
      replies: []
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage("");
  };

  // Add function to handle replies
  const handleReply = (parentMessage: Message) => {
    if (!newMessage.trim() || !user) return;

    const newReply: Message = {
      id: Date.now(),
      userId: user.uid,
      userName: user.displayName || "Anonymous",
      userAvatar: user.photoURL || `https://api.dicebear.com/6.x/avataaars/svg?seed=${user.uid}`,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      tag: selectedTag
    };

    setMessages(prev => prev.map(msg => 
      msg.id === parentMessage.id 
        ? { ...msg, replies: [...(msg.replies || []), newReply] }
        : msg
    ));

    setNewMessage("");
    setReplyingTo(null);
  };

  const filteredMessages = messages.filter(message => 
    message.tag === selectedFilter
  );

  // Add this function
  const filteredIssueMessages = messages.filter(message => 
    selectedFilter === 'issue' && message.tag === 'issue' &&
    (message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
     message.userName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Add guidelines content
  const communityGuidelines = {
    title: "Community Guidelines",
    description: "Welcome to our community! Please follow these guidelines to ensure effective communication and collaboration.",
    tagGuidelines: {
      general: "For community updates, announcements, and general discussions",
      issue: "For reporting problems, asking questions, or seeking help"
    },
    rules: [
      {
        icon: "🏷️",
        title: "Use Appropriate Tags",
        description: "Always select the right tag for your messages: General for regular discussions and Issue for problems."
      },
      {
        icon: "❓",
        title: "Asking Questions",
        description: "Use the 'Issue' tag when asking questions. Be clear and provide necessary details."
      },
      {
        icon: "💡",
        title: "Providing Solutions",
        description: "Ensure your answers are helpful and well-explained."
      },
      {
        icon: "💬",
        title: "General Discussion",
        description: "Use the 'General' tag for announcements, updates, or general conversations."
      },
      {
        icon: "🤝",
        title: "Be Respectful",
        description: "Maintain a professional and respectful tone. Avoid inflammatory language."
      },
      {
        icon: "✨",
        title: "Quality Content",
        description: "Keep messages clear, relevant, and constructive. Avoid spam or off-topic discussions."
      }
    ]
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen flex bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0f1829] to-gray-900"
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
                    <h2 className="text-xl font-bold text-white">{communityGuidelines.title}</h2>
                    <p className="text-sm text-gray-400">{communityGuidelines.description}</p>
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
                <h3 className="text-lg font-semibold text-white mb-4">Message Tags</h3>
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
                        {communityGuidelines.tagGuidelines[tag as keyof typeof communityGuidelines.tagGuidelines]}
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
                        <h3 className="font-medium text-white mb-1">{rule.title}</h3>
                        <p className="text-sm text-gray-400">{rule.description}</p>
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
      <div className="flex-1 flex flex-col">
        {/* Breadcrumb Navigation - Moved above header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-2 bg-gray-900/80 border-b border-cyan-500/10"
        >
          <nav className="flex items-center space-x-2 text-sm">
            <Link 
              to="/" 
              className="flex items-center text-gray-400 hover:text-cyan-400 transition-colors"
            >
              <Home className="w-4 h-4 mr-1" />
              Home
            </Link>
           
           
            <ChevronRight className="w-4 h-4 text-gray-600" />
            <span className="text-cyan-400 flex items-center">
  <MessageCircle className="w-4 h-4 mr-1 inline-block" />
  Community
</span>
          </nav>
        </motion.div>

        {/* Chat Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="px-6 py-4 bg-gray-900/50 border-b border-cyan-500/10 backdrop-blur-xl"
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
                        onClick={() => setSelectedFilter(tag as any)}
                        className={`px-3 py-1 rounded-full flex items-center space-x-1.5 ${
                          selectedFilter === tag ? config.color : 'text-gray-400 hover:text-white'
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
              {selectedFilter === 'issue' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
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
                        onClick={() => setSearchQuery('')}
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

        {/* Messages Area */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 overflow-y-auto px-6 py-8 space-y-6 bg-gradient-to-b from-gray-900/50 to-gray-800/50"
        >
          {(selectedFilter === 'issue' && searchQuery
            ? filteredIssueMessages
            : filteredMessages
          ).map((message) => (
            <motion.div
              key={message.id}
              variants={messageVariants}
              layout
              className={`group flex items-start space-x-4 ${
                message.userId === user?.uid ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
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

              <div className={`flex-1 flex flex-col ${
                message.userId === user?.uid ? 'items-end' : 'items-start'
              }`}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className={`max-w-md rounded-2xl p-4 ${
                    message.userId === user?.uid
                      ? 'bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-emerald-500/10'
                      : 'bg-white/5 hover:bg-cyan-900/20'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className={`px-2 py-0.5 rounded-full text-xs ${messageTagConfig[message.tag].color}`}
                    >
                      {messageTagConfig[message.tag].label}
                    </motion.span>
                  </div>
                  <p className="text-white text-sm">{message.content}</p>
                </motion.div>
                
                <div className="flex items-center mt-1 space-x-2 text-xs">
                  <span className="text-cyan-400">{message.userName}</span>
                  <span className="text-gray-500">{message.timestamp}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Input Area - unchanged but now full width */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-6 bg-gray-900/50 border-t border-cyan-500/10 backdrop-blur-xl"
        >
          {replyingTo && (
            <div className="mb-2 p-2 bg-gray-700 rounded flex justify-between items-center">
              <div className="flex items-center text-gray-400">
                <CornerDownRight className="w-4 h-4 mr-2" />
                Replying to {replyingTo.userName}
              </div>
              <button onClick={() => setReplyingTo(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <motion.div 
            className="flex items-center space-x-4"
            whileHover={{ y: -2 }}
          >
            {/* Updated Tag Selection */}
            <div className="flex items-center space-x-2">
              
              <div className="flex space-x-2">
                {Object.entries(messageTagConfig).map(([tag, config]) => (
                  <motion.button
                    key={tag}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTag(tag as any)}
                    className={`px-3 py-1 rounded-full flex items-center space-x-1.5 ${
                      selectedTag === tag ? config.color : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Tag className="w-3 h-3" />
                    <span>{config.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex-1 flex items-center space-x-4 bg-cyan-950/20 rounded-xl p-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (replyingTo ? handleReply(replyingTo) : handleSendMessage())}
                placeholder={replyingTo ? `Reply to ${replyingTo.userName}...` : `Type your message...`}
                className="flex-1 bg-transparent px-4 py-2 text-white placeholder-gray-400 focus:outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={replyingTo ? () => handleReply(replyingTo) : handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white disabled:opacity-50 disabled:hover:bg-opacity-50"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Community;