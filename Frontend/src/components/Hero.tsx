import React from 'react';
import { motion } from 'framer-motion';

import PulsatingGridBackground from './NeuralNetwork';

const Hero = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative min-h-screen bg-slate-900 overflow-hidden"
    >
     
      <PulsatingGridBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 opacity-70"></div>
      
      <div className="container relative mx-auto min-h-screen flex items-center z-10 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full lg:w-8/12 mx-auto text-center"
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500 mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            Transform Your Data Journey with Vecem
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 md:w-3/4 mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Discover the power of vectorized datasets. <span className="text-cyan-500">Connect</span> globally, <span className="text-cyan-500">collaborate</span> with a community, and <span className="text-cyan-500">innovate</span> for the future of AI.
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Hero;
