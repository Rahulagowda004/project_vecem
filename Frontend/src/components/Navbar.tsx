import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import NeuralNetwork from './NeuralNetwork';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    setIsLoginMode(true);
  };

  return (
    <nav className="fixed top-0 w-full z-50">
       <NeuralNetwork/>
      <div className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
        <div className="container mx-auto flex justify-between items-center p-4 relative z-10">
          <motion.div whileHover={{ scale: 1.02 }}>
            <Link to="/" className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">
              Vecem
            </Link>
          </motion.div>

          <div className="flex items-center gap-4">
            {!user ? (
              <motion.div whileHover={{ scale: 1.02 }}>
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(true)}
                  className="bg-cyan-500/20 border border-cyan-500/50 text-white px-6 py-2.5 rounded-lg hover:bg-cyan-600 transition-all duration-300 backdrop-blur-sm flex items-center gap-2"
                >
                  Login/Signup
                </Link>
              </motion.div>
            ) : (
              <div className="flex items-center gap-6">
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Link to="/home" className="text-gray-300 hover:text-cyan-400 transition-colors">
                    Home
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Link to="/profile" className="text-gray-300 hover:text-cyan-400 transition-colors">
                    Profile
                  </Link>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={logout}
                  className="bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-2.5 rounded-lg hover:bg-red-500/30 transition-all duration-300"
                >
                  Logout
                </motion.button>
              </div>
            )}
          </div>
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
                  className="mt-4 text-cyan-400 hover:text-cyan-300 text-center w-full"
                >
                  Don't have an account? Sign up
                </button>
              </div>
            ) : (
              <div>
                <Signup onClose={handleClose} />
                <button
                  onClick={() => setIsLoginMode(true)}
                  className="mt-4 text-cyan-400 hover:text-cyan-300 text-center w-full"
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