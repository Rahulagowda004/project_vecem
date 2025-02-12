import React from 'react';
import { FaChevronRight, FaUserCircle } from 'react-icons/fa';

const ResponsiveMenu = ({ showMenu, setShowMenu }) => {
  return (
    <div
      className={`${
        showMenu ? "left-0" : "-left-[100%]"
      } fixed bottom-0 top-0 z-20 flex h-screen w-[75%] flex-col justify-between bg-gray-950 px-8 pb-6 pt-16 text-white md:hidden rounded-r-xl shadow-lg transition-all duration-300`}
      aria-hidden={!showMenu}
    >
      {/* User Info */}
      <div>
        <div className="flex items-center gap-3">
          <FaUserCircle size={50} className="text-white" />
          <div>
            <h1 className="text-lg font-semibold">Hello, User</h1>
            <h2 className="text-sm text-slate-400">Premium User</h2>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="mt-12">
          <ul className="flex flex-col gap-7 text-lg font-semibold">
            <li>
              <a href="/" className="cursor-pointer" onClick={() => setShowMenu(false)}>
                Home
              </a>
            </li>
            <li>
              <a href="#about" className="cursor-pointer" onClick={() => setShowMenu(false)}>
                About
              </a>
            </li>
            <li>
              <a href="#education" className="cursor-pointer" onClick={() => setShowMenu(false)}>
                Education & Experience
              </a>
            </li>
            <li>
              <a href="#project" className="cursor-pointer" onClick={() => setShowMenu(false)}>
                Projects
              </a>
            </li>
            <li>
              <a href="#contact" onClick={() => setShowMenu(false)}>
                <button
                  className="px-3 py-2 flex items-center gap-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition-all"
                >
                  Contact <FaChevronRight />
                </button>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default ResponsiveMenu;
