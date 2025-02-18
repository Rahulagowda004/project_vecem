import React from 'react';
import { Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import PulsatingGridBackground from './NeuralNetwork';

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative bg-slate-900 pt-12 pb-8 border-t border-cyan-500/10 overflow-hidden"
    >
      <PulsatingGridBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 opacity-70"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-wrap text-left lg:text-left">
          <div className="w-full lg:w-4/12 px-4">
          </div>
        </div>
        
        <hr className="my-4 border-cyan-500" />
        
        <div className="flex flex-wrap items-center md:justify-between justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            whileHover={{ scale: 1.02 }}
            className="w-full lg:w-4/12 px-4"
          >
            <h4 className="text-3xl font-semibold text-cyan-500">Quick Links</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-white hover:text-cyan-500">About Us</a>
              </li>
            </ul>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            whileHover={{ scale: 1.02 }}
            className="w-full lg:w-4/12 px-4"
          >
            <h4 className="text-3xl font-semibold text-cyan-500">Contact Us</h4>
            <div className="mt-4 space-y-4">
              <div className="flex items-center space-x-3 text-gray-400">
                <Mail size={20} className="text-cyan-500" />
                <span className="text-white hover:text-cyan-500">vectorembeddings@gmail.com</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-wrap items-center md:justify-between justify-center mt-6">
          <div className="w-full md:w-4/12 px-4 mx-auto text-center">
            <div className="text-sm text-white hover:text-cyan-500 justify-left text-centre">
              © {new Date().getFullYear()} Vecem. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;