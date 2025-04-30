import React from "react";
import { motion } from "framer-motion";
import NeuralNetwork from "./NeuralNetwork";

const Hero = () => {
  return (
    <div
      id="hero"
      className="min-h-[calc(100vh-4rem)] relative bg-gradient-to-br pt-12 sm:pt-16 md:pt-20"
    >
      <NeuralNetwork />
      <div className="container mx-auto min-h-[calc(100vh-4rem)] flex items-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full lg:w-10/12 xl:w-8/12 mx-auto text-center space-y-4 sm:space-y-6 md:space-y-8"
        >
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 lg:mb-6 leading-tight"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-500 to-teal-500">
              Transform Your Data Journey
            </span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-white sm:w-11/12 md:w-4/5 lg:w-3/4 mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Discover the power of{" "}
            <motion.span
              className="text-cyan-400 font-medium"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              vectorized datasets
            </motion.span>
            .{" "}
            <motion.span
              className="text-cyan-400 font-medium"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Connect
            </motion.span>{" "}
            globally,{" "}
            <motion.span
              className="text-cyan-400 font-medium"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              collaborate
            </motion.span>{" "}
            with a community, and{" "}
            <motion.span
              className="text-cyan-400 font-medium"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              innovate
            </motion.span>{" "}
            for the future of{" "}
            <motion.span
              className="text-cyan-400 font-medium"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              AI
            </motion.span>
            .
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-6 sm:mt-8 px-4 sm:px-0"
          >
            {/* Placeholder for buttons if needed */}
          </motion.div>
        </motion.div>
      </div>
      
      {/* Bottom gradient divider */}
      <div className="absolute bottom-0 left-0 right-0 w-full">
        <div className="h-[2px] sm:h-[3px] md:h-[4px] bg-gradient-to-r from-gray-900 via-cyan-500 to-gray-900 opacity-75 w-full"></div>
      </div>
    </div>
  );
};

export default Hero;
