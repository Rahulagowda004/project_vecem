import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Search,
  User,
  ChevronDown,
  LogOut,
  Settings,
  Database,
  Users,
  FileAudio,
  Image,
  FileVideo,
  FileText,
  BookOpen,
  Bot,
  Send,
  TerminalIcon,
  ComputerIcon,
  Laptop,
  Laptop2Icon,
} from "lucide-react";
import DatasetGrid from "./DatasetGrid";
import { getUserProfileByUid } from "../services/userService";
import { getUserDisplayName } from "../utils/userManagement";
import { motion } from "framer-motion";
import { ChatMessage, sendChatMessage } from "../services/chatService";
import { checkApiKey, saveApiKey } from '../services/apiKeyService';
import { toast } from 'react-hot-toast';
import PromptsGrid from "./PromptsGrid";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

interface Prompt {
  name: string;
  domain: string;
  prompt: string;
  username: string;
  createdAt?: string;
  updatedAt?: string;
}

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-red-500"
    >
      <LogOut className="h-4 w-4 mr-3" />
      Logout
    </button>
  );
};

const DashboardLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState(
    user?.photoURL || "/avatars/avatar1.png"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [username, setUsername] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(true);
  const [datasets, setDatasets] = useState([]);
  const [currentView, setCurrentView] = useState("datasets"); // Add this state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content:
        "Hi! I'm VecemBot, your AI assistant for discovering and understanding vectorized datasets. How can I help you today?",
      sender: "bot",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyError, setApiKeyError] = useState('');
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/prompts');
        if (!response.ok) {
          throw new Error('Failed to fetch prompts');
        }
        const data = await response.json();
        setPrompts(data.slice(0, 15)); // Just limit to 15 prompts without sorting
      } catch (error) {
        console.error('Error fetching prompts:', error);
        setPrompts([]);
      }
    };

    fetchPrompts();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !user?.uid) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: chatInput,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsTyping(true);

    try {
      const data = await sendChatMessage(chatInput, user.uid);

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: "bot",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error ? error.message : "I encountered an error. Please try again.",
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.uid) {
        try {
          const profileData = await getUserProfileByUid(user.uid);
          if (profileData?.username) {
            setUsername(profileData.username);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (!user?.uid) return;

      try {
        setAvatarLoading(true);
        const response = await fetch(
          `http://127.0.0.1:5000/user-avatar/${user.uid}`
        );
        const data = await response.json();

        if (data.avatar) {
          setUserAvatar(data.avatar);
        }
      } catch (error) {
        console.error("Error fetching user avatar:", error);
      } finally {
        setAvatarLoading(false);
      }
    };

    fetchUserAvatar();
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Add initial data fetch when component mounts
  useEffect(() => {
    handleCategorySelect("all");
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    setIsFullWidth(currentView === "chatbot");
  }, [currentView]);

  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    try {
      const response = await fetch("http://127.0.0.1:5000/dataset-category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch datasets");
      }

      const data = await response.json();
      if (data.datasets) {
        setDatasets(data.datasets.slice(0, 12)); // Just limit to 12 datasets without sorting
      } else {
        setDatasets([]);
      }
    } catch (error) {
      console.error("Error fetching datasets:", error);
      setDatasets([]);
    }
  };

  const handleChatbotClick = async () => {
    if (!user?.uid) return;

    try {
      const hasApiKey = await checkApiKey(user.uid);
      if (!hasApiKey) {
        setShowApiKeyDialog(true);
      } else {
        setCurrentView('chatbot');
      }
    } catch (error) {
      console.error('Error checking API key:', error);
      toast.error('Failed to verify API key access');
    }
  };

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    try {
      setApiKeyError('');
      await saveApiKey(user.uid, apiKey);
      setShowApiKeyDialog(false);
      setCurrentView('chatbot');
      setApiKey('');
      toast.success('API key saved successfully');
    } catch (error) {
      console.error('Error saving API key:', error);
      setApiKeyError('Failed to save API key. Please try again.');
      toast.error('Failed to save API key');
    }
  };

  return (
    <div className="min-h-screen h-full bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Navigation Bar */}
      <nav className="bg-gray-900/90 backdrop-blur-lg border-b border-gray-800 fixed w-full z-50">
        <div className="max-w-full mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex-shrink-0 transition-transform hover:scale-105"
            >
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200">
                Vecem
              </span>
            </Link>

            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-800 rounded-xl leading-5 bg-gray-800/50 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                  placeholder="Search datasets..."
                />
              </div>
            </div>

            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 focus:outline-none p-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  {avatarLoading ? (
                    <div className="h-10 w-10 rounded-full bg-gray-800 animate-pulse" />
                  ) : (
                    <img
                      className="h-10 w-10 rounded-full ring-2 ring-cyan-400/20 object-cover"
                      src={userAvatar}
                      alt={user.displayName || "User avatar"}
                    />
                  )}
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                      isProfileOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl shadow-lg bg-gray-900 ring-1 ring-cyan-400/10">
                    <div className="py-1 divide-y divide-gray-800">
                      <Link
                        to={username ? `/${username}` : "#"}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                      >
                        <User className="h-4 w-4 mr-3 text-cyan-400" />
                        My Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                      >
                        <Settings className="h-4 w-4 mr-3 text-cyan-400" />
                        Settings
                      </Link>
                      <LogoutButton />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar and Main Content */}
      <div className="flex pt-16 h-full">
        {/* Sidebar */}
        <div className="w-64 fixed h-full bg-gray-900/90 backdrop-blur-lg border-r border-gray-800">
          <div className="flex flex-col h-full">
            {/* Navigation Menu */}
            <nav className="flex-1 px-2 py-4 space-y-2">
              {/* Datasets Section */}
              <div className="space-y-2">
                <div
                  onClick={() => setCurrentView("datasets")}
                  className={`flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-xl hover:bg-gray-800/50 transition-all duration-200 group backdrop-blur-sm border border-transparent hover:border-cyan-500/10 cursor-pointer ${
                    currentView === "datasets" ? "bg-cyan-500/10" : ""
                  }`}
                >
                  <Database className="h-5 w-5 mr-3 text-cyan-400 group-hover:animate-pulse" />
                  <span className="group-hover:text-cyan-400 transition-colors">
                    Datasets
                  </span>
                </div>

                <div className="ml-4 space-y-1 relative before:absolute before:left-[1.6rem] before:top-0 before:h-full before:w-px before:bg-gradient-to-b before:from-cyan-500/50 before:to-transparent before:opacity-25">
                  {/* Dataset category buttons */}
                  <button
                    onClick={() => handleCategorySelect("all")}
                    className={`flex items-center justify-between w-full px-4 py-2.5 text-sm ${
                      selectedCategory === "all"
                        ? "bg-cyan-500/10 text-cyan-400"
                        : "text-gray-400"
                    } rounded-lg hover:bg-gray-800/50 transition-all duration-200 group hover:pl-6`}
                  >
                    <div className="flex items-center">
                      <Database
                        className={`h-4 w-4 mr-3 ${
                          selectedCategory === "all"
                            ? "text-cyan-400"
                            : "text-cyan-400/50"
                        } group-hover:text-cyan-400 transition-colors`}
                      />
                      <span className="group-hover:text-gray-200 transition-colors">
                        All Datasets
                      </span>
                    </div>
                  </button>

                  {[
                    {
                      icon: FileAudio,
                      label: "Audio Dataset",
                      category: "audio",
                    },
                    { icon: Image, label: "Image Dataset", category: "image" },
                    {
                      icon: FileVideo,
                      label: "Video Dataset",
                      category: "video",
                    },
                    { icon: FileText, label: "Text Dataset", category: "text" },
                  ].map(({ icon: Icon, label, category }) => (
                    <button
                      key={label}
                      onClick={() => handleCategorySelect(category)}
                      className={`flex items-center justify-between w-full px-4 py-2.5 text-sm ${
                        selectedCategory === category
                          ? "bg-cyan-500/10 text-cyan-400"
                          : "text-gray-400"
                      } rounded-lg hover:bg-gray-800/50 transition-all duration-200 group hover:pl-6`}
                    >
                      <div className="flex items-center">
                        <Icon
                          className={`h-4 w-4 mr-3 ${
                            selectedCategory === category
                              ? "text-cyan-400"
                              : "text-cyan-400/50"
                          } group-hover:text-cyan-400 transition-colors`}
                        />
                        <span className="group-hover:text-gray-200 transition-colors">
                          {label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompts Section */}
              <button
                onClick={() => setCurrentView("prompts")}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-xl hover:bg-gray-800/50 transition-all duration-200 group backdrop-blur-sm border border-transparent hover:border-cyan-500/10 ${
                  currentView === "prompts" ? "bg-cyan-500/10" : ""
                }`}
              >
                <div className="flex items-center">
                  <TerminalIcon className="h-5 w-5 mr-3 text-cyan-400 group-hover:animate-pulse" />
                  <span className="group-hover:text-cyan-400 transition-colors">
                    Prompts
                  </span>
                </div>
              </button>

              {/* Community Section */}
              <Link
                to="/community"
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-xl hover:bg-gray-800/50 transition-all duration-200 group backdrop-blur-sm border border-transparent hover:border-cyan-500/10"
              >
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-3 text-cyan-400 group-hover:animate-pulse" />
                  <span className="group-hover:text-cyan-400 transition-colors">
                    Community
                  </span>
                </div>
              </Link>

              {/* Documentation Section */}
              <Link
                to="/documentation"
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-xl hover:bg-gray-800/50 transition-all duration-200 group backdrop-blur-sm border border-transparent hover:border-cyan-500/10"
              >
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-3 text-cyan-400 group-hover:animate-pulse" />
                  <span className="group-hover:text-cyan-400 transition-colors">
                    Documentation
                  </span>
                </div>
              </Link>


               {/* ChatBot Section */}
              <button
                onClick={handleChatbotClick}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800/50 transition-all duration-200 group backdrop-blur-sm border border-transparent hover:border-cyan-500/10 rounded-xl ${
                  currentView === "chatbot" ? "bg-cyan-500/10" : ""
                }`}
              >
                <Bot className="h-5 w-5 mr-3 text-cyan-400 group-hover:animate-pulse" />
                <span className="group-hover:text-cyan-400 transition-colors">
                  ChatBot
                </span>
              </button>

             
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 ${isFullWidth ? "ml-64" : "ml-64"} h-full`}>
          <main className="h-full px-6 py-4">
            {currentView === "chatbot" ? (
              <div className="flex flex-col h-[calc(100vh-5rem)] -mt-4 -mx-6">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-6">
                  <div className="h-full w-full space-y-6 py-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${
                          message.sender === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex items-start gap-3 max-w-2xl ${
                            message.sender === "user" ? "flex-row-reverse" : ""
                          }`}
                        >
                          {message.sender === "bot" && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-gray-900" />
                            </div>
                          )}
                          <div
                            className={`${
                              message.sender === "user"
                                ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10"
                                : "bg-gray-800/20"
                            } px-4 py-2 rounded-2xl`}
                          >
                            <p className="text-gray-100 text-sm">
                              {message.content}
                            </p>
                            <div className="mt-1 text-[10px] text-gray-500">
                              {new Date(message.timestamp).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="flex items-center space-x-2 px-4 py-2 rounded-xl">
                          <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                            className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: 0.2,
                            }}
                            className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: 0.4,
                            }}
                            className="w-1.5 h-1.5 bg-purple-400 rounded-full"
                          />
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-800/50 bg-gray-900/80 backdrop-blur-xl mt-auto p-0">
                  <div className="px-6 py-4">
                    <form
                      onSubmit={handleChatSubmit}
                      className="flex w-full space-x-4"
                    >
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask me anything about Vecem..."
                        className="flex-1 bg-gray-800/50 text-white rounded-xl px-6 py-3.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 placeholder-gray-400 border border-gray-700/50"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg flex items-center justify-center gap-2 group"
                      >
                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                    </form>
                  </div>
                </div>
              </div>
            ) : currentView === "prompts" ? (
              <PromptsGrid prompts={prompts} />
            ) : (
              <>
                {/* Enhanced User Welcome Section */}
                {user && (
                  <div className="w-full mb-6">
                    <div className="relative p-6 rounded-2xl bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-2xl overflow-hidden">
                      {/* Decorative Elements */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/10 rounded-full filter blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

                      <div className="relative flex items-center space-x-8">
                        {/* Avatar Section */}
                        <div className="relative group flex-shrink-0">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-cyan-300 to-cyan-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse"></div>
                          <div className="relative p-0.5 bg-gradient-to-r from-gray-900 to-gray-800 rounded-full">
                            <img
                              className="h-20 w-20 rounded-full ring-2 ring-cyan-400/30 object-cover transition-transform duration-300 group-hover:scale-105"
                              src={userAvatar}
                              alt={user.displayName || "User avatar"}
                            />
                          </div>
                        </div>

                        {/* Welcome Text Section */}
                        <div className="space-y-2 flex-1">
                          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                            Welcome back, {getUserDisplayName(user)}
                          </h2>
                          <p className="text-gray-400 text-sm leading-relaxed max-w-2xl tracking-wide">
                            You're in! Now explore datasets, contribute
                            insights, and connect with the community.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="w-full">
                  <DatasetGrid
                    searchQuery={searchQuery}
                    category={selectedCategory}
                    datasets={datasets}
                  />
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* API Key Dialog */}
      {showApiKeyDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
          >
            <h2 className="text-xl font-bold text-white mb-4">Google AI Studio API Key Required</h2>
            <div className="text-gray-300 text-sm mb-6 space-y-3">
              <p>To obtain your Google AI Studio API key:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">Google AI Studio</a></li>
                <li>Sign in with your Google account</li>
                <li>Click on "Get API key" in the top menu</li>
                <li>Either select an existing key or click "Create API key"</li>
                <li>Copy the generated API key and paste it below</li>
              </ol>
              <p className="mt-2 text-yellow-400">Note: Keep your API key secure and never share it publicly.</p>
            </div>
            <form onSubmit={handleApiKeySubmit}>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white mb-4"
                placeholder="Enter your API key"
                required
              />
              {apiKeyError && (
                <p className="text-red-400 text-sm mb-4">{apiKeyError}</p>
              )}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowApiKeyDialog(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                >
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
