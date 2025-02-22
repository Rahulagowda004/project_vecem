import React from 'react';
import { motion } from 'framer-motion';
import { Database, Users, PersonStanding } from 'lucide-react';
import NeuralNetwork from './NeuralNetwork';

const Features = () => {
  const cardVariants = {
    initial: { 
      opacity: 0,
      y: 20 
    },
    animate: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.2,
        duration: 0.5,
        ease: "easeOut"
      }
    }),
    whileHover: {
      scale: 1.05,
      y: -5,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const iconVariants = {
    initial: { 
      scale: 0,
      rotate: -180 
    },
    animate: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    },
    whileHover: {
      scale: 1.2,
      rotate: 15,
      transition: {
        duration: 0.2,
        type: "spring",
        stiffness: 300
      }
    }
  };

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
    <div className="py-20 bg-gradient-to-br">
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
              custom={index}
              initial="initial"
              animate="animate"
              whileHover="whileHover"
              variants={cardVariants}
              className="w-full md:w-4/12 px-4 mb-8"
            >
              <div className="h-full relative flex flex-col bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-cyan-500/10">
                <div className="flex-auto">
                  <motion.div 
                    variants={iconVariants}
                    className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gray-900/50 border border-cyan-500/20"
                  >
                    {feature.icon}
                  </motion.div>
                  <motion.h6 
                    variants={{
                      whileHover: { 
                        color: "#22d3ee",
                        x: 5,
                        transition: { duration: 0.2 }
                      }
                    }}
                    className="text-xl font-semibold text-cyan-500 mb-4"
                  >
                    {feature.title}
                  </motion.h6>
                  <motion.p 
                    variants={{
                      whileHover: { 
                        color: "#94a3b8",
                        transition: { duration: 0.2 }
                      }
                    }}
                    className="text-white leading-relaxed"
                  >
                    {feature.description}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;