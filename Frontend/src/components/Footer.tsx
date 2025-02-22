import { Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import NeuralNetwork from './NeuralNetwork';

const Footer = () => {
  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <NeuralNetwork />
      <footer className="pt-12 pb-10 border-t border-cyan-500/10 relative z-10">
        <div className="container mx-auto px-4">
          {/* Gradient line moved up with negative margin */}
          <div className="-mt-12 mb-12">
            <div className="h-[5px] bg-gradient-to-r from-gray-900 via-cyan-500 to-gray-900 opacity-75 w-full"></div>
          </div>
        
          <div className="flex flex-wrap text-left lg:text-left">
            <div className="w-full lg:w-4/12 px-4">
            </div>
          </div>
        
          <div className="flex flex-wrap items-center md:justify-between justify-center">
            <motion.div 
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
      </footer>
    </div>
  );
};

export default Footer;