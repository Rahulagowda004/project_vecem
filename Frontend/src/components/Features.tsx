import React from 'react';
import { motion } from 'framer-motion';
import { Database, Users, PersonStanding } from 'lucide-react';
import PageBackground from './layouts/PageBackground';
import NeuralNetwork from './NeuralNetwork';

const Features = () => {
  const features = [
    {
      icon: <Database className="w-10 h-10 text-cyan-400" />,
      title: "Hassle-Free Vector Data",
      description: "Easily access and utilize vectorized datasets without the need for high computational power."
    },
    {
      icon: <Users className="w-12 h-12 text-cyan-500" />,
      title: "Open-Source & Community-Driven",
      description: "Contribute, enhance, and innovate—our platform thrives on global collaboration."
    },
    {
      icon: <PersonStanding className="w-12 h-12 text-cyan-500" />,
      title: "Optimized for Accessibility",
      description: "Find and utilize vectorized data easily for research, AI, and other applications."
    }
  ];

  return (
    <div className="py-20 bg-gradient-to-br ">
      <NeuralNetwork />
      <div className="container relative mx-auto px-4">
        <div className="flex flex-wrap">
          <div className="w-full mb-16 text-center">
            <motion.h2 
              className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              Why Choose Vecem?
            </motion.h2>
            <motion.p 
              className="mt-7 text-xl text-white hover:text-cyan-500"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              
            >
              Empowering users with vectorized data
            </motion.p>
          </div>
        </div>
        
        <div className="flex flex-wrap -mx-4">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="w-full md:w-4/12 px-4 mb-8"
            >
              <motion.div 
                whileHover={{ y: -10, boxShadow: "0 0 20px rgba(34, 211, 238, 0.1)" }}
                className="h-full relative flex flex-col bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-cyan-500/10"
              >
                <div className="flex-auto">
                  <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gray-900/50 border border-cyan-500/20">
                    {feature.icon}
                  </div>
                  <h6 className="text-xl font-semibold text-white mb-4">
                    {feature.title}
                  </h6>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;