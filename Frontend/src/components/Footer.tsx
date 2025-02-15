import React from 'react';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap text-left lg:text-left">
          <div className="w-full lg:w-4/12 px-4">
          </div>
        </div>
        
        <hr className="my-6 border-gray-700" />
        
        <div className="flex flex-wrap items-center md:justify-between justify-center">
          <div className="w-full lg:w-4/12 px-4">
            <h4 className="text-3xl font-semibold text-white">Quick Links</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white">About Us</a>
              </li>
              {/* <li>
                <a href="#" className="text-gray-400 hover:text-white">Services</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">Blog</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
              </li> */}
            </ul>
          </div>
          
          <div className="w-full lg:w-4/12 px-4">
            <h4 className="text-3xl font-semibold text-white">Contact Us</h4>
            <div className="mt-4 space-y-4">
              <div className="flex items-center space-x-3 text-gray-400">
                <Mail size={20} />
                <span>vectorembeddings@gmail.com</span>
              </div>
              {/* <div className="flex items-center space-x-3 text-gray-400">
                <Phone size={20} />
                <span>+1 (555) 123-4567</span>
              </div> */}
              {/* <div className="flex items-center space-x-3 text-gray-400">
                <MapPin size={20} />
                <span>123 Innovation Drive, Tech City, TC 12345</span>
              </div> */}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center md:justify-between justify-center mt-6">
          <div className="w-full md:w-4/12 px-4 mx-auto text-center">
            <div className="text-sm text-gray-400">
              © {new Date().getFullYear()} Vecem. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;