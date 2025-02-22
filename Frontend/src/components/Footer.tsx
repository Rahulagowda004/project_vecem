import React from 'react';
import { Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import NeuralNetwork from './NeuralNetwork';

const Footer = () => {
  const hoverVariants = {
    initial: { scale: 1 },
    whileHover: { 
      scale: 1.02,
      transition: { duration: 0.2, ease: "easeInOut" }
    }
  };

  const linkHoverVariants = {
    initial: { color: "#ffffff" },
    whileHover: { 
      color: "#22d3ee",
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <NeuralNetwork />
      <footer className="pt-12 pb-10 border-t border-cyan-500/10 relative z-10">
        <div className="container mx-auto px-4">
          {/* Gradient line moved up with negative margin */}
          <div className="-mt-12 mb-12">
            <div className="h-[5px] bg-gradient-to-r from-gray-900 via-cyan-500 to-gray-900 opacity-75 w-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Quick Links - Left */}
            <motion.div 
              variants={hoverVariants}
              initial="initial"
              whileHover="whileHover"
              className="col-span-1 text-left"
            >
              <h4 className="text-3xl font-semibold text-cyan-500">Quick Links</h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <motion.div
                    variants={linkHoverVariants}
                    initial="initial"
                    whileHover="whileHover"
                  >
                    <Link to="/" className="text-white">
                      About Us
                    </Link>
                  </motion.div>
                </li>
              </ul>
            </motion.div>

            {/* Copyright - Center */}
            <motion.div 
              variants={hoverVariants}
              initial="initial"
              whileHover="whileHover"
              className="col-span-1 flex items-center justify-center"
            >
              <motion.div 
                variants={linkHoverVariants}
                initial="initial"
                whileHover="whileHover"
                className="text-sm text-white text-center"
              >
                © {new Date().getFullYear()} Vecem. All rights reserved.
              </motion.div>
            </motion.div>

            {/* Contact Us - Right */}
            <motion.div 
              variants={hoverVariants}
              initial="initial"
              whileHover="whileHover"
              className="col-span-1 text-right"
            >
              <h4 className="text-3xl font-semibold text-cyan-500">Contact Us</h4>
              <div className="mt-4 space-y-4">
                <div className="flex items-center space-x-3 text-gray-400 justify-end">
                  <motion.a
                    href="mailto:vectorembeddings@gmail.com"
                    variants={linkHoverVariants}
                    initial="initial"
                    whileHover="whileHover"
                    className="flex items-center gap-2"
                  >
                    <Mail size={20} className="text-cyan-500 hover:bg-cyan-500" />
                    <span className="text-white hover:bg-cyan-500">vectorembeddings@gmail.com</span>
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;