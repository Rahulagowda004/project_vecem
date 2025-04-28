import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tag, Copy, Check, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PromptCardProps {
  prompt: {
    name: string;
    domain: string;
    prompt: string;
    username: string;
    createdAt?: string;
    updatedAt?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent scrolling of background content when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!prompt || !isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUsernameClick = (username: string) => {
    navigate(`/${username}/view`);
    onClose(); // Close the modal after navigation
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
        style={{
          touchAction: "none", // Prevents scrolling on mobile when interacting with modal
          paddingTop: "env(safe-area-inset-top, 0)",
          paddingBottom: "env(safe-area-inset-bottom, 0)",
          paddingLeft: "env(safe-area-inset-left, 0)",
          paddingRight: "env(safe-area-inset-right, 0)",
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-tr from-gray-900/95 via-gray-800/95 to-gray-900/95 rounded-xl sm:rounded-2xl border border-cyan-500/20 p-3 sm:p-6 max-w-[95vw] sm:max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col shadow-2xl backdrop-blur-xl relative"
        >
          {/* Close button - absolute positioned for mobile */}
          <button
            onClick={onClose}
            className="absolute right-2 top-2 p-1.5 hover:bg-gray-700/50 rounded-full transition-all duration-300 hover:rotate-90 z-10"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
          </button>

          {/* Header */}
          <div className="flex flex-col gap-2 sm:gap-4 mb-2 sm:mb-6 pr-8 sm:pr-0">
            <h2 className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 line-clamp-2">
              {prompt.name}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-cyan-500/10 px-2 py-1 rounded-full">
                <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
                <span className="text-xs text-cyan-400 font-medium">
                  {prompt.domain}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-700/30 px-2 py-1 rounded-full">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                <button
                  onClick={() => handleUsernameClick(prompt.username)}
                  className="flex items-center text-xs group relative"
                >
                  <span className="text-gray-200 hover:text-cyan-400 transition-all duration-300 font-medium relative truncate max-w-[100px] sm:max-w-full">
                    {prompt.username}
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Prompt Content - with scroll container */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <div className="bg-gray-950/50 rounded-lg sm:rounded-xl p-2 sm:p-4 border border-cyan-500/10 shadow-lg flex flex-col flex-1">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm sm:text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Prompt Content
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-cyan-500/10 rounded-full transition-colors flex items-center gap-1.5 text-gray-400 hover:text-cyan-400 border border-transparent hover:border-cyan-500/20"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs font-medium">Copy</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Scrollable content area with enhanced scrollbar */}
              <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar overscroll-contain">
                <div className="bg-black/40 rounded-lg p-2.5 sm:p-4 border border-gray-800 h-full">
                  <p className="text-gray-300 whitespace-pre-wrap font-mono text-xs sm:text-sm leading-relaxed">
                    {prompt.prompt}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with timestamp if available */}
          {prompt.createdAt && (
            <div className="mt-2 text-xs text-gray-500 text-right">
              Created: {new Date(prompt.createdAt).toLocaleDateString()}
              {prompt.updatedAt &&
                prompt.updatedAt !== prompt.createdAt &&
                ` · Updated: ${new Date(
                  prompt.updatedAt
                ).toLocaleDateString()}`}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PromptCard;
