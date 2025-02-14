import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
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
  FileText
} from 'lucide-react';
import DatasetGrid from './DatasetGrid';

const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <button
      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
    >
      <LogOut className="h-4 w-4 mr-3" />
      Logout
    </button>
  );
};

const DashboardLayout = () => {
  const { user, isAuthenticated } = useAuth0();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['datasets']);
  const [userAvatar, setUserAvatar] = useState(localStorage.getItem("userAvatar") || user?.picture || "/avatars/avatar1.png");
  const [userName, setUserName] = useState(localStorage.getItem("userName") || user?.name || "Guest");

  useEffect(() => {
    const handleStorageChange = () => {
      setUserAvatar(localStorage.getItem("userAvatar") || user?.picture || "/avatars/avatar1.png");
      setUserName(localStorage.getItem("userName") || user?.name || "Guest");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [user]);

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev =>
      prev.includes(menu)
        ? prev.filter(item => item !== menu)
        : [...prev, menu]
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-gray-800 shadow-lg fixed w-full z-50">
        <div className="max-w-full mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex-shrink-0">
              <span className="text-2xl font-bold text-indigo-500">Vecem</span>
            </Link>

            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Search datasets..."
                />
              </div>
            </div>

            {isAuthenticated && user && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 focus:outline-none"
                >
                  <img
                    className="h-8 w-8 rounded-full"
                    src={userAvatar}
                    alt={user.name}
                  />
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isProfileOpen ? 'transform rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link to="/profile" className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                        <User className="h-4 w-4 mr-3" />
                        My Profile
                      </Link>
                      <Link to="/settings" className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                        <Settings className="h-4 w-4 mr-3" />
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
        <div className="w-64 fixed h-full bg-gray-800 shadow-lg">
          <div className="flex flex-col h-full">
            {/* User Info */}
            {isAuthenticated && user && (
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={userAvatar}
                    alt={user.name}
                  />
                  <div>
                    <div className="font-medium text-gray-200">{user.name}</div>
                    
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Menu */}
            <nav className="flex-1 px-2 py-4 space-y-1">
              {/* Datasets Section */}
              <div>
                <button
                  onClick={() => toggleMenu('datasets')}
                  className="flex items-center justify-between w-full px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
                >
                  <div className="flex items-center">
                    <Database className="h-5 w-5 mr-3" />
                    Datasets
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-transform ${expandedMenus.includes('datasets') ? 'transform rotate-90' : ''}`} />
                </button>

                {expandedMenus.includes('datasets') && (
                  <div className="ml-8 mt-2 space-y-1">
                    <button className="flex items-center w-full px-2 py-2 text-sm text-gray-400 rounded-md hover:bg-gray-700 hover:text-white">
                      <FileAudio className="h-4 w-4 mr-3" />
                      Audio Dataset
                    </button>
                    <button className="flex items-center w-full px-2 py-2 text-sm text-gray-400 rounded-md hover:bg-gray-700 hover:text-white">
                      <Image className="h-4 w-4 mr-3" />
                      Image Dataset
                    </button>
                    <button className="flex items-center w-full px-2 py-2 text-sm text-gray-400 rounded-md hover:bg-gray-700 hover:text-white">
                      <FileVideo className="h-4 w-4 mr-3" />
                      Video Dataset
                    </button>
                    <button className="flex items-center w-full px-2 py-2 text-sm text-gray-400 rounded-md hover:bg-gray-700 hover:text-white">
                      <FileText className="h-4 w-4 mr-3" />
                      Text Dataset
                    </button>
                  </div>
                )}
              </div>

              {/* Community Section */}
              <button className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white">
                <Users className="h-5 w-5 mr-3" />
                Community
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <main className="p-6">
            <DatasetGrid />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;