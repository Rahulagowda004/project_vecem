import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

import NeuralNetwork from "./NeuralNetwork";
import { getUserData } from "../services/userService";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [userProfileLink, setUserProfileLink] = useState("/profile");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    setIsLoginMode(true);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const updateProfileLink = async () => {
      if (user?.uid) {
        const userData = await getUserData(user.uid);
        if (userData?.username) {
          setUserProfileLink(`/${userData.username}`);
        }
      }
    };
    updateProfileLink();
  }, [user]);

  return (
    <nav className="fixed top-0 w-full z-50" style={{
      paddingTop: 'env(safe-area-inset-top, 0)',
      paddingLeft: 'env(safe-area-inset-left, 0)',
      paddingRight: 'env(safe-area-inset-right, 0)'
    }}>
      <div className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
        <NeuralNetwork />

        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Link
                to="/"
                className="flex items-center text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200 transition-transform hover:scale-105 whitespace-nowrap"
              >
                Vecem
              </Link>
            </div>
            
            {/* Mobile menu button */}
            {user && (
              <button
                onClick={toggleMobileMenu}
                className="sm:hidden p-2 rounded-lg text-gray-300 hover:text-cyan-400 focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            )}
            
            <div className="flex items-center gap-2 sm:gap-4">
              {!user ? (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(true)}
                  className="bg-cyan-500/20 border border-cyan-500/50 text-white px-2.5 sm:px-6 py-1.5 sm:py-2 rounded-lg hover:bg-cyan-600/20 transition-all duration-300 backdrop-blur-sm flex items-center gap-2 text-xs sm:text-sm md:text-base whitespace-nowrap"
                >
                  Login/Signup
                </Link>
              ) : (
                <div className="hidden sm:flex items-center gap-2 sm:gap-6">
                  <Link
                    to="/home"
                    className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                  >
                    Home
                  </Link>
                  <Link
                    to={userProfileLink}
                    className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="bg-red-500/20 border border-red-500/50 text-red-400 px-2.5 sm:px-6 py-1.5 sm:py-2 rounded-lg hover:bg-red-500/30 transition-all duration-300 text-sm"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu */}
          {user && (
            <div
              className={`${
                isMobileMenuOpen ? 'block' : 'hidden'
              } sm:hidden py-2 space-y-2 absolute left-0 right-0 top-full bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 border-t border-gray-700/30 px-4`}
            >
              <Link
                to="/home"
                className="block text-gray-300 hover:text-cyan-400 transition-colors py-2 text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to={userProfileLink}
                className="block text-gray-300 hover:text-cyan-400 transition-colors py-2 text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left text-red-400 hover:text-red-300 transition-colors py-2 text-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal with improved mobile responsiveness */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="relative w-full max-w-md mx-auto">
            <div className="relative bg-gradient-to-b from-gray-800/95 to-gray-900/95 rounded-xl p-4 sm:p-6 border border-gray-700/30 shadow-2xl backdrop-blur-xl">
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-400 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {isLoginMode ? (
                <div className="space-y-4">
                  <Login />
                  <button
                    onClick={() => setIsLoginMode(false)}
                    className="w-full text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors py-2"
                  >
                    Don't have an account? Sign up
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Signup onClose={handleClose} />
                  <button
                    onClick={() => setIsLoginMode(true)}
                    className="w-full text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors py-2"
                  >
                    Already have an account? Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
