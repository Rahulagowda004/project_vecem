import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { User, ChevronDown, LogOut, Settings, Bot } from "lucide-react";
import { getUserProfileByUid } from "../services/userService";
import { API_BASE_URL } from "../config";

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

const NavbarPro = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState(
    user?.photoURL || "/avatars/default.png"
  );
  const [username, setUsername] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(true);

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

  return (
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
          <div className="flex-1" /> {/* Spacer */}
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
  );
};

export default NavbarPro;
