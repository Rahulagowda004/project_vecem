import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Login from '../pages/Login';
import Signup from '../pages/Signup';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    setIsLoginMode(true);
  };

  return (
    <nav className="bg-gray-800 p-4 fixed top-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white font-bold text-xl">
          Vecem
        </Link>

        <div className="flex items-center gap-4">
          {!user ? (
            <Link 
              to="/login" 
              onClick={() => setIsOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Login/Signup
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/home" className="text-white hover:text-gray-300">
                Home
              </Link>
              <Link to="/profile" className="text-white hover:text-gray-300">
                Profile
              </Link>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative">
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-50"
            >
              ✕
            </button>
            {isLoginMode ? (
                <div>
                <Login />
                <button
                  onClick={() => setIsLoginMode(false)}
                  className="mt-4 text-blue-400 hover:text-blue-300 text-center w-full"
                >
                  Don't have an account? Sign up
                </button>
                </div>
            ) : (
              <div>
                <Signup onClose={handleClose} />
                <button
                  onClick={() => setIsLoginMode(true)}
                  className="mt-4 text-blue-400 hover:text-blue-300 text-center w-full"
                >
                  Already have an account? Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;