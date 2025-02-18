import React from 'react';
import { Menu, X } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PulsatingGridBackground from './NeuralNetwork';
import NeuralNetwork from './NeuralNetwork';

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  const handleLogin = async () => {
    await loginWithRedirect();
    navigate('/home');
  };

  return (
    <button
      onClick={handleLogin}
      className="bg-cyan-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-cyan-500 transition-colors"
    >
      Log In / Sign Up
    </button>
  );
};

interface NavbarProps {
  onLogin: () => void;
}

const Navbar = ({ onLogin }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="fixed w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-cyan-500/10 overflow-hidden">
      <NeuralNetwork />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <span className="text-2xl font-bold text-cyan-500">Vecem</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-centre space-x-4">
            <LoginButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-white"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-slate-800/90 backdrop-blur-md"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <LoginButton />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;