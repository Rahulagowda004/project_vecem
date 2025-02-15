import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Search, ChevronDown, LogOut, Settings, User } from "lucide-react";

const LogoutButton = () => {
  const { logout } = useAuth0();
  return (
    <button
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
      className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
    >
      <LogOut className="h-4 w-4 mr-3" />
      Logout
    </button>
  );
};

const CommunityLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuth0();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 shadow-lg fixed w-full z-50 h-16">
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
                  placeholder="Search community..."
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
                      <LogoutButton />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="pt-16 h-[calc(100vh-4rem)]">{children}</div>
    </div>
  );
};

export default CommunityLayout;
