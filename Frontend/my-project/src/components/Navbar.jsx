import React, { useState, useEffect } from 'react';
import { HiMenuAlt3, HiMenuAlt1 } from "react-icons/hi";
import { FaSearch } from "react-icons/fa";
import ResponsiveMenu from './ResponsiveMenu';
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  
  // Load avatar from local storage
  const userAvatar = localStorage.getItem("userAvatar") || "/avatars/default.png"; // Default avatar path

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <div className="bg-gray-950 -mb-7 z-50 w-full py-3 fixed">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-4 md:px-0">
        {/* Logo and Search */}
        <div className="flex items-center gap-4">
          <h1 className="text-l font-semibold text-white">VECTOR EMBEDDINGS</h1>
          {/* Search Bar */}
          <form className="hidden md:flex items-center bg-white/10 backdrop-blur-sm rounded-md px-3 py-1 hover:bg-white/20 transition-all">
            <input
              type="text"
              placeholder="Search models, datasets, users..."
              className="outline-none px-2 py-1 text-gray-800 text-sm w-60 bg-transparent"
            />
            <button
              type="submit"
              className="bg-blue-500 px-3 py-1 text-white rounded-md text-sm font-semibold flex items-center gap-1"
            >
              <FaSearch className="text-white text-sm" />
            </button>
          </form>
        </div>

        {/* Menu Section */}
        <nav className="hidden md:block">
          <ul className="flex gap-7 text-l items-center font-semibold text-white">
            <li><a href="/" className="cursor-pointer">Home</a></li>
            <li><a href="#about" className="cursor-pointer">About</a></li>
            <li><a href="#project" className="cursor-pointer">Datasets</a></li>

            {/* User Information or Login */}
            {isAuthenticated ? (
              <li className="flex items-center gap-3">
                {/* Profile Link */}
                <Link to="/profile" className="cursor-pointer">
                  <img
                    src={userAvatar} // Display the selected avatar
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full border-2 border-white"
                  />
                </Link>

               
              </li>
            ) : (
              <li>
                <button className="px-3 py-1 cursor-pointer rounded-md bg-blue-500 text-white flex items-center gap-1 shadow-md border-blue-400 border-2" onClick={() => loginWithRedirect()}>
                  Log In
                </button>
              </li>
            )}
          </ul>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden text-white text-4xl">
          {showMenu ? (
            <HiMenuAlt3 onClick={toggleMenu} />
          ) : (
            <HiMenuAlt1 onClick={toggleMenu} />
          )}
        </div>
      </div>

      {/* Mobile Responsive Menu */}
      {showMenu && <ResponsiveMenu showMenu={showMenu} setShowMenu={setShowMenu} />}
    </div>
  );
};

export default Navbar;