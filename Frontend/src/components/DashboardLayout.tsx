import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
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
} from "lucide-react";
import DatasetGrid from "./DatasetGrid";

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
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
  const [userAvatar, setUserAvatar] = useState(user?.photoURL || "/avatars/avatar1.png");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Navigation Bar */}
      <nav className="bg-gray-900/90 backdrop-blur-lg border-b border-gray-800 fixed w-full z-50">
        <div className="max-w-full mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex-shrink-0 transition-transform hover:scale-105">
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
                  <img
                    className="h-10 w-10 rounded-full ring-2 ring-cyan-400/20"
                    src={userAvatar}
                    alt="User avatar"
                  />
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
                        to="/profile"
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
            {/* User Info */}
            {user && (
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col text-center">
                    <div className="font-medium text-white text-centre items-center">
                      Hey, {user.displayName}!
                    </div>
                    <div className="text-slate-400 text-sm text-left whitespace-nowrap">
                    See what the community is building.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Menu */}
            <nav className="flex-1 px-2 py-4 space-y-2">
              {/* Datasets Section */}
              <div className="space-y-2">
                <div className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-xl hover:bg-gray-800/50 transition-all duration-200 group backdrop-blur-sm border border-transparent hover:border-cyan-500/10">
                  <Database className="h-5 w-5 mr-3 text-cyan-400 group-hover:animate-pulse" />
                  <span className="group-hover:text-cyan-400 transition-colors">Datasets</span>
                </div>

                <div className="ml-4 space-y-1 relative before:absolute before:left-[1.6rem] before:top-0 before:h-full before:w-px before:bg-gradient-to-b before:from-cyan-500/50 before:to-transparent before:opacity-25">
                  {[
                    { icon: FileAudio, label: "Audio Dataset", count: 128 },
                    { icon: Image, label: "Image Dataset", count: 256 },
                    { icon: FileVideo, label: "Video Dataset", count: 64 },
                    { icon: FileText, label: "Text Dataset", count: 512 },
                  ].map(({ icon: Icon, label, count }) => (
                    <button
                      key={label}
                      className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-gray-400 rounded-lg hover:bg-gray-800/50 transition-all duration-200 group hover:pl-6"
                    >
                      <div className="flex items-center">
                        <Icon className="h-4 w-4 mr-3 text-cyan-400/50 group-hover:text-cyan-400 transition-colors" />
                        <span className="group-hover:text-gray-200 transition-colors">{label}</span>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-800/50 text-gray-500 group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-all">
                        {count}
                      </span>
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
                  <span className="group-hover:text-cyan-400 transition-colors">Community</span>
                </div>
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <main className="p-6">
            <DatasetGrid searchQuery={searchQuery} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
