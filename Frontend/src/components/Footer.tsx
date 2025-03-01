import React from 'react';
import { Mail } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { scrollToElement } from '../utils/scroll';
import NeuralNetwork from './NeuralNetwork';

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      scrollToElement('hero');
    } else {
      navigate('/', { state: { scrollToHero: true } });
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <NeuralNetwork />
      <footer className="pt-12 pb-10 border-t border-cyan-500/10 relative z-10">
        <div className="container mx-auto px-4">
          <div className="-mt-12 mb-12">
            <div className="h-[5px] bg-gradient-to-r from-gray-900 via-cyan-500 to-gray-900 opacity-75 w-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 text-left">
              <h4 className="text-3xl font-semibold text-cyan-500">Quick Links</h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <a 
                    href="#hero"
                    onClick={handleAboutClick}
                    className="text-white hover:text-cyan-500 transition-colors cursor-pointer"
                  >
                    About Us
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-span-1 flex items-center justify-center">
              <div className="text-sm text-white text-center hover:text-cyan-500 transition-colors">
                © {new Date().getFullYear()} Vecem. All rights reserved.
              </div>
            </div>

            <div className="col-span-1 text-right">
              <h4 className="text-3xl font-semibold text-cyan-500">Contact Us</h4>
              <div className="mt-4 space-y-4">
                <div className="flex items-center space-x-3 text-gray-400 justify-end">
                  <a
                    href="mailto:vectorembeddings@gmail.com"
                    className="flex items-center gap-2 group"
                  >
                    <Mail size={20} className="text-cyan-500" />
                    <span className="text-white group-hover:text-cyan-500 transition-colors">
                      vectorembeddings@gmail.com
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;