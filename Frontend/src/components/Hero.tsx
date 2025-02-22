import React from 'react';
import { motion } from 'framer-motion';
import NeuralNetwork from './NeuralNetwork';

const Hero = () => {
  return (
    <div className="min-h-screen relative bg-gradient-to-br ">
      <NeuralNetwork />
      <div className="container mx-auto min-h-screen flex items-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full lg:w-8/12 mx-auto text-center space-y-8"
        >
          <motion.h1 
            className="text-6xl md:text-7xl font-bold mb-6"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-500 to-teal-500 text-justify">
              Transform Your Data Journey
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-white md:w-3/4 mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Discover the power of{' '}
            <motion.span 
              className="text-cyan-400 font-medium"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              vectorized datasets
            </motion.span>.{' '}
            <motion.span 
              className="text-cyan-400 font-medium"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Connect
            </motion.span> globally,{' '}
            <motion.span 
              className="text-cyan-400 font-medium"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              collaborate
            </motion.span> with a community, and{' '}
            <motion.span 
              className="text-cyan-400 font-medium"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              innovate
            </motion.span> for the future of{' '}
            <motion.span 
              className="text-cyan-400 font-medium"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              AI
            </motion.span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-6 mt-8"
          >
            
          </motion.div>
        </motion.div>
      </div>
      {/* Updated divider with full width gradient */}
      <div className="absolute bottom-0 left-0 right-0 w-full">
        <div className="h-[5px] bg-gradient-to-r from-gray-900 via-cyan-500 to-gray-900 opacity-75 w-full"></div>
      </div>
    </div>
  );
};

export default Hero;
