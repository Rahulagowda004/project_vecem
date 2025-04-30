import { useState, useEffect, useRef } from "react";
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
  Send,
  TerminalSquare,
  Bot,
  X,
} from "lucide-react";
import DatasetGrid from "./DatasetGrid";
import { getUserProfileByUid } from "../services/userService";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage, sendChatMessage } from "../services/chatService";
import { checkApiKey, saveApiKey } from "../services/apiKeyService";
import { toast } from "react-hot-toast";
import PromptsGrid from "./PromptsGrid";
import Community from "../pages/Community";
import { API_BASE_URL } from "../config";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: string;
}

interface Prompt {
  _id: string;
  prompt_name: string;
  domain: string;
  prompt: string;
  username: string;
  createdAt?: string;
  updatedAt?: string;
}

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState(
    user?.photoURL || "/avatars/avatar1.png"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [username, setUsername] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(true);
  const [datasets, setDatasets] = useState([]);
  const [currentView, setCurrentView] = useState<
    "datasets" | "chatbot" | "prompts" | "community"
  >("datasets");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content:
        "Welcome to Vecora! I help you optimize system messages, refine prompts, create new ones, and improve AI interactions. Ask me anything about prompt engineering!",
      sender: "bot",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiKeyError, setApiKeyError] = useState("");
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);
  const [userName, setUserName] = useState("");
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/prompts`);
        if (!response.ok) {
          throw new Error("Failed to fetch prompts");
        }
        const data = await response.json();
        setPrompts(data.slice(0, 15));
        setFilteredPrompts(data.slice(0, 15));
      } catch (error) {
        console.error("Error fetching prompts:", error);
        setPrompts([]);
        setFilteredPrompts([]);
      }
    };

    fetchPrompts();
  }, []);

  // Add search effect
  useEffect(() => {
    if (currentView === "prompts") {
      const filtered = prompts.filter(
        (prompt) =>
          prompt.prompt_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          prompt.domain.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPrompts(filtered);
    }
  }, [searchQuery, currentView, prompts]);

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
        content:
          error instanceof Error
            ? error.message
            : "I encountered an error. Please try again.",
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
        const response = await fetch(`${API_BASE_URL}/user-avatar/${user.uid}`);
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

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.uid) {
        try {
          const profileData = await getUserProfileByUid(user.uid);
          if (profileData?.name) {
            setUserName(profileData.name);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    try {
      const response = await fetch(`${API_BASE_URL}/dataset-category`, {
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
        setApiKey(""); // Reset API key input
        setApiKeyError(""); // Reset any previous errors
        setShowApiKeyDialog(true);
      } else {
        setCurrentView("chatbot");
      }
    } catch (error) {
      console.error("Error checking API key:", error);
      toast.error("Failed to verify API key access");
    }
  };

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    try {
      setApiKeyError("");
      await saveApiKey(user.uid, apiKey);
      setShowApiKeyDialog(false);
      setCurrentView("chatbot");
      setApiKey("");
      toast.success("API key saved successfully");
    } catch (error) {
      console.error("Error saving API key:", error);
      setApiKeyError("Failed to save API key. Please try again.");
      toast.error("Failed to save API key");
    }
  };

  return (
    <div className="min-h-screen h-full bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Navigation Bar */}
      <nav
        className="bg-gray-900/90 backdrop-blur-lg border-b border-gray-800 fixed w-full z-50"
        style={{
          paddingTop: "env(safe-area-inset-top, 0)",
          paddingLeft: "env(safe-area-inset-left, 0)",
          paddingRight: "env(safe-area-inset-right, 0)",
        }}
      >
        <div className="max-w-full mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-1.5 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 active:scale-95"
                aria-label="Toggle navigation menu"
                aria-expanded={isMobileMenuOpen}
              >
                <div className="relative w-5 h-5 flex items-center justify-center">
                  {/* Three lines that animate to X */}
                  <span
                    className={`absolute h-0.5 w-3.5 bg-current transform transition-all duration-300 ease-in-out ${
                      isMobileMenuOpen ? "rotate-45" : "-translate-y-1"
                    }`}
                  ></span>
                  <span
                    className={`absolute h-0.5 w-3.5 bg-current transform transition-all duration-300 ease-in-out ${
                      isMobileMenuOpen ? "opacity-0" : "opacity-100"
                    }`}
                  ></span>
                  <span
                    className={`absolute h-0.5 w-3.5 bg-current transform transition-all duration-300 ease-in-out ${
                      isMobileMenuOpen ? "-rotate-45" : "translate-y-1"
                    }`}
                  ></span>
                </div>
              </button>

              <Link
                to="/"
                className="flex-shrink-0 flex items-center transition-transform hover:scale-105"
              >
                <span className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200">
                  Vecem
                </span>
              </Link>
            </div>

            <div className="flex-1 max-w-2xl mx-2 sm:mx-8 hidden sm:block">
              {currentView !== "chatbot" && currentView !== "community" && (
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-800 rounded-xl leading-5 bg-gray-800/50 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all text-sm"
                    placeholder={`Search ${
                      currentView === "prompts" ? "prompts" : "datasets"
                    }...`}
                  />
                </div>
              )}

              {currentView === "chatbot" && (
                <div className="flex items-center justify-center space-x-2">
                  <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
                  <h1 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Vecora
                  </h1>
                </div>
              )}

              {currentView === "community" && (
                <div className="flex items-center justify-center space-x-2">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
                  <h1 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Community
                  </h1>
                </div>
              )}
            </div>

            {/* Mobile search bar */}
            {currentView !== "chatbot" && currentView !== "community" && (
              <div className="sm:hidden flex items-center mr-2">
                <button
                  onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 active:scale-95 transition-all"
                  aria-label="Open search"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            )}

            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-1 sm:space-x-3 focus:outline-none p-1.5 sm:p-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  {avatarLoading ? (
                    <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-full bg-gray-800 animate-pulse" />
                  ) : (
                    <img
                      className="h-7 w-7 sm:h-10 sm:w-10 rounded-full ring-2 ring-cyan-400/20 object-cover"
                      src={userAvatar}
                      alt={user.displayName || "User avatar"}
                    />
                  )}
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 hidden sm:block ${
                      isProfileOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl sm:rounded-2xl shadow-lg bg-gray-900 ring-1 ring-cyan-400/10">
                    <div className="py-1 divide-y divide-gray-800">
                      <Link
                        to={username ? `/${username}` : "#"}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="h-4 w-4 mr-3 text-cyan-400" />
                        My Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
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

        {/* Mobile Search Modal */}
        <AnimatePresence>
          {isMobileSearchOpen &&
            currentView !== "chatbot" &&
            currentView !== "community" && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-14 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 shadow-lg px-3 py-3"
                style={{
                  paddingTop: "calc(env(safe-area-inset-top, 0) + 0.75rem)",
                  paddingLeft: "calc(env(safe-area-inset-left, 0) + 0.75rem)",
                  paddingRight: "calc(env(safe-area-inset-right, 0) + 0.75rem)",
                }}
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-700 rounded-xl bg-gray-800/50 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all text-sm"
                    placeholder={`Search ${
                      currentView === "prompts" ? "prompts" : "datasets"
                    }...`}
                    autoFocus
                  />
                  <button
                    onClick={() => setIsMobileSearchOpen(false)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
        </AnimatePresence>
      </nav>

      {/* Sidebar and Main Content */}
      <div
        className="flex pt-14 sm:pt-16 h-full"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0)",
        }}
      >
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 sm:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.div
          ref={sidebarRef}
          className={`fixed left-0 h-full bg-gray-900/90 backdrop-blur-lg border-r border-gray-800 z-40 transition-all transform sm:translate-x-0 sm:w-64 ${
            isMobileMenuOpen ? "translate-x-0 w-56" : "-translate-x-full w-56"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Close button for mobile */}
            <div className="sm:hidden flex items-center justify-end p-2 sticky top-0 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800/50 z-10">
  <button
    onClick={() => setIsMobileMenuOpen(false)}
    className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all flex items-center justify-center"
  >
    <X className="h-4 w-4" />
  </button>
</div>


            {/* Navigation Menu with adjusted mobile spacing */}
            <nav className="flex-1 px-2 py-2 sm:py-4 space-y-1.5 sm:space-y-2 overflow-y-auto">
              {/* Datasets Section */}
              <div className="space-y-1 sm:space-y-2">
                <div
                  onClick={() => setCurrentView("datasets")}
                  className={`flex items-center w-full px-3 sm:px-4 py-1.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-800/50 transition-all duration-200 group backdrop-blur-sm border border-transparent hover:border-cyan-500/10 cursor-pointer ${
                    currentView === "datasets" ? "bg-cyan-500/10" : ""
                  }`}
                >
                  <Database className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-cyan-400 group-hover:animate-pulse" />
                  <span className="group-hover:text-cyan-400 transition-colors">
                    Datasets
                  </span>
                </div>

                <div className="ml-4 space-y-1 relative before:absolute before:left-[1.1rem] sm:before:left-[1.6rem] before:top-0 before:h-full before:w-px before:bg-gradient-to-b before:from-cyan-500/50 before:to-transparent before:opacity-25">
                  {/* Dataset category buttons */}
                  <button
                    onClick={() => handleCategorySelect("all")}
                    className={`flex items-center justify-between w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm ${
                      selectedCategory === "all"
                        ? "bg-cyan-500/10 text-cyan-400"
                        : "text-gray-400"
                    } rounded-lg hover:bg-gray-800/50 transition-all duration-200 group hover:pl-5 sm:hover:pl-6`}
                  >
                    <div className="flex items-center">
                      <Database
                        className={`h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 ${
                          selectedCategory === "all"
                            ? "text-cyan-400"
                            : "text-cyan-400/50"
                        } group-hover:text-cyan-400 transition-colors`}
                      />
                      <span className="group-hover:text-gray-200 transition-colors truncate">
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
                      className={`flex items-center justify-between w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm ${
                        selectedCategory === category
                          ? "bg-cyan-500/10 text-cyan-400"
                          : "text-gray-400"
                      } rounded-lg hover:bg-gray-800/50 transition-all duration-200 group hover:pl-5 sm:hover:pl-6`}
                    >
                      <div className="flex items-center">
                        <Icon
                          className={`h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3 ${
                            selectedCategory === category
                              ? "text-cyan-400"
                              : "text-cyan-400/50"
                          } group-hover:text-cyan-400 transition-colors`}
                        />
                        <span className="group-hover:text-gray-200 transition-colors truncate">
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
                className={`flex items-center w-full px-3 sm:px-4 py-1.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-800/50 transition-all duration-200 group backdrop-blur-sm border border-transparent hover:border-cyan-500/10 ${
                  currentView === "prompts" ? "bg-cyan-500/10" : ""
                }`}
              >
                <TerminalSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-cyan-400 group-hover:animate-pulse" />
                <span className="group-hover:text-cyan-400 transition-colors">
                  Prompts
                </span>
              </button>

              {/* Community Section */}
              <button
                onClick={() => setCurrentView("community")}
                className={`flex items-center w-full px-3 sm:px-4 py-1.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-800/50 transition-all duration-200 group backdrop-blur-sm border border-transparent hover:border-cyan-500/10 ${
                  currentView === "community" ? "bg-cyan-500/10" : ""
                }`}
              >
                <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-cyan-400 group-hover:animate-pulse" />
                <span className="group-hover:text-cyan-400 transition-colors">
                  Community
                </span>
              </button>

              {/* ChatBot Section */}
              <button
                onClick={handleChatbotClick}
                className={`flex items-center w-full px-3 sm:px-4 py-1.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-800/50 transition-all duration-200 group backdrop-blur-sm border border-transparent hover:border-cyan-500/10 ${
                  currentView === "chatbot" ? "bg-cyan-500/10" : ""
                }`}
              >
                <Bot className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-cyan-400 group-hover:animate-pulse" />
                <span className="group-hover:text-cyan-400 transition-colors">
                  Vecora
                </span>
              </button>

              {/* Documentation Section */}
              <Link
                to="/documentation"
                className="flex items-center w-full px-3 sm:px-4 py-1.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-800/50 transition-all duration-200 group backdrop-blur-sm border border-transparent hover:border-cyan-500/10"
              >
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-cyan-400 group-hover:animate-pulse" />
                <span className="group-hover:text-cyan-400 transition-colors">
                  Documentation
                </span>
              </Link>
            </nav>
          </div>
        </motion.div>

        {/* Main Content */}
        <div
          className={`flex-1 ${
            isFullWidth ? "" : ""
          } sm:ml-64 transition-all duration-300 h-full`}
          style={{
            paddingLeft: "env(safe-area-inset-left, 0)",
            paddingRight: "env(safe-area-inset-right, 0)",
          }}
        >
          <main className="h-full relative">
            {currentView === "community" ? (
              <div className="flex flex-col h-[calc(100vh-4rem)]">
                <div className="flex-1 overflow-y-auto">
                  <Community />
                </div>
              </div>
            ) : currentView === "chatbot" ? (
              <div className="flex flex-col h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-3 sm:px-4 pt-2">
                  <div className="h-full w-full space-y-3 sm:space-y-4 py-2">
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
                          className={`flex items-start gap-2 sm:gap-3 max-w-xs sm:max-w-md md:max-w-2xl ${
                            message.sender === "user" ? "flex-row-reverse" : ""
                          }`}
                        >
                          {message.sender === "bot" && (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0">
                              <motion.div
                                className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400"
                                whileHover={{
                                  scale: 1.2,
                                  rotate: [0, -10, 10, -10, 0],
                                  transition: { duration: 0.5 },
                                }}
                                animate={{
                                  scale: [1, 1.1, 1],
                                  rotate: [0, 5, 0, -5, 0],
                                  y: [0, -3, 0],
                                }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                              >
                                <Bot className="w-full h-full" />
                              </motion.div>
                            </div>
                          )}
                          <div
                            className={`${
                              message.sender === "user"
                                ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10"
                                : "bg-gray-800/20"
                            } px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl`}
                          >
                            <p className="text-xs sm:text-sm text-gray-100">
                              {message.content}
                            </p>
                            <div className="mt-1 text-[10px] text-gray-500 text-right">
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
                <div className="border-t border-gray-800/50 bg-gray-900/80 backdrop-blur-xl mt-auto">
                  <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
                    <form
                      onSubmit={handleChatSubmit}
                      className="flex w-full space-x-2 sm:space-x-4"
                    >
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask about prompt engineering..."
                        className="flex-1 bg-gray-800/50 text-white rounded-lg sm:rounded-xl px-4 sm:px-6 py-2.5 sm:py-3.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 placeholder-gray-400 border border-gray-700/50 text-sm sm:text-base"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="px-4 sm:px-6 py-2.5 sm:py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg sm:rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg flex items-center justify-center gap-2 group"
                      >
                        <Send className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Enhanced User Welcome Section */}
                {user && (
                  <div className="w-full px-2 sm:px-6 pt-2 sm:pt-6 mb-2 sm:mb-4">
                    <div className="relative p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-2xl overflow-hidden">
                      {/* Decorative Elements */}
                      <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-cyan-500/10 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                      <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-cyan-400/10 rounded-full filter blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

                      <div className="relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                        {/* Avatar Section */}
                        <div className="relative group flex-shrink-0 mx-auto sm:mx-0">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-cyan-300 to-cyan-500 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                          <div className="relative p-0.5 bg-gradient-to-r from-gray-900 to-gray-800 rounded-full">
                            <img
                              className="h-14 w-14 sm:h-20 sm:w-20 rounded-full ring-2 ring-cyan-400/20 object-cover transition-transform duration-300 group-hover:scale-105"
                              src={userAvatar}
                              alt={user.displayName || "User avatar"}
                            />
                          </div>
                        </div>

                        {/* Welcome Text Section */}
                        <div className="space-y-0.5 flex-1 text-center sm:text-left mt-1 sm:mt-0">
                          <h2 className="text-lg sm:text-3xl font-semibold bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                            Welcome back, {userName || "Guest"}
                          </h2>
                          <p className="text-xs sm:text-sm text-gray-400 tracking-wide line-clamp-2">
                            You're live on Vecem! Explore datasets, craft
                            prompts, and make your mark in our creative
                            community.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="w-full px-3 sm:px-6">
                  {currentView === "prompts" ? (
                    filteredPrompts.length > 0 ? (
                      <PromptsGrid prompts={filteredPrompts} />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-gray-800/50 rounded-xl border border-gray-700/50 mt-4">
                        <TerminalSquare className="w-8 h-8 sm:w-12 sm:h-12 text-gray-500 mb-3 sm:mb-4" />
                        <h3 className="text-base sm:text-lg font-medium text-gray-300 mb-1 sm:mb-2">
                          No Prompts Found
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 text-center">
                          There are no prompts available at the moment.
                        </p>
                      </div>
                    )
                  ) : (
                    <DatasetGrid
                      searchQuery={searchQuery}
                      category={selectedCategory}
                      datasets={datasets}
                    />
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* API Key Dialog - make responsive */}
      {showApiKeyDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="bg-gradient-to-b from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md mx-auto border border-gray-700/30 shadow-2xl relative overflow-hidden"
          >
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-cyan-500/10 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 sm:w-48 h-32 sm:h-48 bg-blue-500/10 rounded-full filter blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

            <motion.div
              className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-cyan-400 relative"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl"></div>
              <Bot className="w-full h-full relative z-10" />
            </motion.div>

            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2 sm:mb-3 text-center">
              Connect to Google AI Studio
            </h2>

            <div className="text-gray-300 space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <p className="text-sm sm:text-base text-center text-gray-400">
                Enter your API key to unlock the full potential of Vecora's AI
                capabilities
              </p>

              <div className="flex flex-col gap-3 sm:gap-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-3 sm:p-5 rounded-lg sm:rounded-xl border border-gray-700/30">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-cyan-400 text-xs sm:text-sm">1</span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-300">
                      Visit{" "}
                      <a
                        href="https://makersuite.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 inline-flex items-center group"
                      >
                        Google AI Studio
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 ml-1 transform group-hover:translate-x-0.5 transition-transform"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7 17L17 7M17 7H7M17 7V17"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </a>
                    </p>
                  </div>
                </div>

                {[
                  "Sign in with your Google account",
                  'Click on "Get API key" in the top menu',
                  "Create a new API key or select an existing one",
                  "Copy your API key and paste it below",
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-cyan-400 text-xs sm:text-sm">
                        {index + 2}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-300">{step}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border border-yellow-500/10 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 text-yellow-400">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <p className="text-yellow-300/90 text-xs sm:text-sm">
                    Your API key is sensitive information. Never share it
                    publicly or commit it to version control.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleApiKeySubmit}
              className="space-y-4 sm:space-y-6"
            >
              <div className="relative">
                <label
                  htmlFor="apiKey"
                  className="block text-xs sm:text-sm font-medium text-gray-300 mb-1 sm:mb-2"
                >
                  Your API Key
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg blur transition duration-300 group-hover:opacity-75 opacity-50"></div>
                  <input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="block w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 relative z-10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                    placeholder="Enter your API key"
                    required
                  />
                </div>
              </div>

              {apiKeyError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs sm:text-sm flex items-center gap-2"
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {apiKeyError}
                </motion.p>
              )}

              <div className="flex justify-end gap-2 sm:gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowApiKeyDialog(false)}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 text-gray-400 hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-800/50 text-xs sm:text-sm"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg flex items-center gap-1 sm:gap-2 group"
                >
                  <span>Save API Key</span>
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 transform group-hover:translate-x-0.5 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
