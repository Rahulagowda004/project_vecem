import React from "react";
import { Mail } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { scrollToElement } from "../utils/scroll";
import NeuralNetwork from "./NeuralNetwork";

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === "/") {
      scrollToElement("hero");
    } else {
      navigate("/", { state: { scrollToHero: true } });
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <NeuralNetwork />
      <footer className="pt-8 sm:pt-10 md:pt-12 pb-6 sm:pb-8 md:pb-10 border-t border-cyan-500/10 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="-mt-8 sm:-mt-10 md:-mt-12 mb-8 sm:mb-10 md:mb-12">
            <div className="h-[3px] sm:h-[4px] md:h-[5px] bg-gradient-to-r from-gray-900 via-cyan-500 to-gray-900 opacity-75 w-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 text-center md:text-left">
              <h4 className="text-2xl sm:text-2xl md:text-3xl font-semibold text-cyan-500">
                Quick Links
              </h4>
              <ul className="mt-3 md:mt-4 space-y-2">
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

            <div className="col-span-1 flex items-center justify-center my-4 md:my-0">
              <div className="text-xs sm:text-sm text-white text-center hover:text-cyan-500 transition-colors">
                © {new Date().getFullYear()} Vecem. All rights reserved.
              </div>
            </div>

            <div className="col-span-1 text-center md:text-right">
              <h4 className="text-2xl sm:text-2xl md:text-3xl font-semibold text-cyan-500">
                Contact Us
              </h4>
              <div className="mt-3 md:mt-4 space-y-3 md:space-y-4">
                <div className="flex items-center space-x-3 text-gray-400 justify-center md:justify-end">
                  <a
                    href="mailto:vectorembeddings@gmail.com"
                    className="flex items-center gap-2 group"
                  >
                    <Mail size={18} className="text-cyan-500" />
                    <span className="text-sm sm:text-base text-white group-hover:text-cyan-500 transition-colors break-all sm:break-normal">
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
