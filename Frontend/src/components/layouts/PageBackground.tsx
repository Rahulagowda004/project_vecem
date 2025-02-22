import React from 'react';
import { motion } from 'framer-motion';
import NeuralNetwork from '../NeuralNetwork';

interface PageBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const PageBackground: React.FC<PageBackgroundProps> = ({ children, className = '' }) => {
  return (
    <motion.div 
      initial={{ opacity: 0.95 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, repeat: 0 }}
      className={`relative min-h-screen overflow-hidden ${className}`}
    >
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
        <NeuralNetwork />
      </div>
      <div className="fixed inset-0 bg-gradient-to-br from-transparent to-gray-900/50"></div>
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default PageBackground;
