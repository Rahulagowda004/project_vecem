import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { User, ChevronDown, LogOut, Settings, Menu, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState(
    user?.photoURL || "/avatars/default.png"
  );
  const [username, setUsername] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(true);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

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

  const profileMenuLinks = [
    {
      to: username ? `/${username}` : "#",
      icon: <User className="h-4 w-4 mr-3 text-cyan-400" />,
      label: "My Profile",
    },
    {
      to: "/settings",
      icon: <Settings className="h-4 w-4 mr-3 text-cyan-400" />,
      label: "Settings",
    },
  ];

  return (
    <nav className="bg-gray-900/90 backdrop-blur-lg border-b border-gray-800 fixed w-full z-50">
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex-shrink-0 transition-transform hover:scale-105"
          >
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent">
              Vecem
            </span>
          </Link>
          <div className="flex-1" /> {/* Spacer */}
          {/* Mobile menu button */}
          <div className="sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
          {/* Desktop profile dropdown */}
          {user && (
            <div className="hidden sm:block relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 focus:outline-none p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                {avatarLoading ? (
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-800 animate-pulse" />
                ) : (
                  <img
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full ring-2 ring-cyan-400/20 object-cover"
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
                    {profileMenuLinks.map((link, index) => (
                      <Link
                        key={index}
                        to={link.to}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                      >
                        {link.icon}
                        {link.label}
                      </Link>
                    ))}
                    <LogoutButton />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div
        className={`sm:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-gray-900/95 backdrop-blur-lg transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0)",
          paddingLeft: "env(safe-area-inset-left, 0)",
          paddingRight: "env(safe-area-inset-right, 0)",
        }}
      >
        <div className="px-4 py-3 space-y-2 flex flex-col h-full">
          {user && (
            <>
              <div className="px-3 py-4 border-b border-gray-800 flex items-center">
                {avatarLoading ? (
                  <div className="h-10 w-10 rounded-full bg-gray-800 animate-pulse mr-4" />
                ) : (
                  <img
                    className="h-10 w-10 rounded-full ring-2 ring-cyan-400/20 object-cover mr-4"
                    src={userAvatar}
                    alt={user.displayName || "User avatar"}
                  />
                )}
                <div>
                  <span className="text-gray-100 text-sm font-medium block">
                    {username || user.email}
                  </span>
                  <span className="text-gray-400 text-xs">{user.email}</span>
                </div>
              </div>

              {profileMenuLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.to}
                  className="flex items-center px-4 py-3 text-base rounded-xl text-gray-300 hover:bg-gray-800 transition-colors active:bg-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="bg-gray-800/80 p-2 rounded-lg mr-4">
                    {React.cloneElement(link.icon, {
                      className: "h-5 w-5 text-cyan-400",
                    })}
                  </div>
                  {link.label}
                </Link>
              ))}

              <div className="mt-auto border-t border-gray-800 pt-4 pb-8">
                <button
                  onClick={() => {
                    const { logout } = useAuth();
                    logout().then(() => {
                      navigate("/");
                      setMobileMenuOpen(false);
                    });
                  }}
                  className="w-full flex items-center justify-center px-4 py-3 text-base font-medium rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 active:bg-red-500/30 transition-colors"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarPro;
