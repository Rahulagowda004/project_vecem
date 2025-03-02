import React, { useState, useEffect } from "react";
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
  ChevronRight,
  FileAudio,
  Image,
  FileVideo,
  FileText,
  BookOpen,
} from "lucide-react";
import DatasetGrid from "./DatasetGrid";
import { getUserProfileByUid } from "../services/userService";

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
  const [userAvatar, setUserAvatar] = useState(
    user?.photoURL || "/avatars/avatar1.png"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [username, setUsername] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(true);
  const [datasets, setDatasets] = useState([]);

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
        setDatasets(data.datasets);
      } else {
        setDatasets([]);
      }
    } catch (error) {
      console.error("Error fetching datasets:", error);
      setDatasets([]); // Set empty array on error
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Navigation Bar */}
      <nav className="bg-gray-900/90 backdrop-blur-lg border-b border-gray-800 fixed w-full z-50">
        <div className="max-w-full mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex-shrink-0 transition-transform hover:scale-105"
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent">
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
      <div className="flex pt-16">
        {/* Sidebar */}
        <div className="w-64 fixed h-full bg-gray-900/90 backdrop-blur-lg border-r border-gray-800">
          <div className="flex flex-col h-full">
            {/* Navigation Menu */}
            <nav className="flex-1 px-2 py-4 space-y-2">
              {/* Datasets Section */}
             
              <div className="space-y-2">
                <div className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-xl hover:bg-gray-800/50 transition-all duration-200 group backdrop-blur-sm border border-transparent hover:border-cyan-500/10">
                  <Database className="h-5 w-5 mr-3 text-cyan-400 group-hover:animate-pulse" />
                  <span className="group-hover:text-cyan-400 transition-colors">
                    Datasets
                  </span>
                </div>

                <div className="ml-4 space-y-1 relative before:absolute before:left-[1.6rem] before:top-0 before:h-full before:w-px before:bg-gradient-to-b before:from-cyan-500/50 before:to-transparent before:opacity-25">
                  {/* Add All Datasets button first */}
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
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <main className="p-6">
            {/* Enhanced User Welcome Section */}
            {user && (
              <div className="mb-8 transform transition-all duration-500 ease-in-out hover:scale-[1.02]">
                <div className="relative p-8 rounded-2xl bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl shadow-2xl overflow-hidden">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/10 rounded-full filter blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                  
                  <div className="relative flex items-center space-x-8">
                    {/* Avatar Section */}
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-cyan-300 to-cyan-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse"></div>
                      <div className="relative p-1 bg-gradient-to-r from-gray-900 to-gray-800 rounded-full">
                        <img
                          className="h-20 w-20 rounded-full ring-2 ring-cyan-400/30 object-cover transition-transform duration-300 group-hover:scale-105"
                          src={userAvatar}
                          alt={user.displayName || "User avatar"}
                        />
                      </div>
                    </div>

                    {/* Welcome Text Section */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-100 to-gray-300 bg-clip-text text-transparent">
                          Welcome back, {user.displayName}!
                        </h2>
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></div>
                          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse delay-75"></div>
                          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse delay-150"></div>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm whitespace-nowrap overflow-hidden text-ellipsis leading-relaxed">  
    See what the community is building with <span className="text-cyan-400">Vecem</span>—explore datasets, contribute insights, and collaborate on data-driven discoveries.  
</p>

                    </div>
                  </div>
                </div>
              </div>
            )}

            <DatasetGrid
              searchQuery={searchQuery}
              category={selectedCategory}
              datasets={datasets}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
