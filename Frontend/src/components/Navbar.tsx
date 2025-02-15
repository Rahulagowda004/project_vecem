import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-900 fixed w-full z-10 top-0 shadow-lg ">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center ">
        <Link to="/" className="text-2xl font-bold text-white ">
          Vecem
        </Link>
        <div className="flex space-x-4">
          <Link to="/" className="text-gray-300 hover:text-white hover:text-indigo-500">
            Home
          </Link>
          <Link to="/" className="text-gray-300 hover:text-white hover:text-indigo-500">
            About
          </Link>
          <Link to="/" className="text-gray-300 hover:text-white hover:text-indigo-500">
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;