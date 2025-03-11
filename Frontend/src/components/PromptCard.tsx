import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-tr from-gray-900/95 via-gray-800/95 to-gray-900/95 rounded-3xl border border-cyan-500/20 p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl backdrop-blur-xl relative"
        >
          {/* Header */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex justify-between items-start">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                {prompt.name}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700/50 rounded-full transition-all duration-300 hover:rotate-90"
              >
                <X className="w-5 h-5 text-cyan-400" />
              </button>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-cyan-500/10 px-3 py-1.5 rounded-full">
                <Tag className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 font-medium">{prompt.domain}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-700/30 px-3 py-1.5 rounded-full">
                <span className="text-gray-400">by</span>
                <button
                  onClick={() => handleUsernameClick(prompt.username)}
                  className="flex items-center text-sm group relative"
                >
                  <span className="text-gray-200 hover:text-cyan-400 transition-all duration-300 font-medium relative">
                    {prompt.username}
                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Prompt Content */}
          <div className="mt-6">
            <div className="bg-gray-950/50 rounded-2xl p-6 border border-cyan-500/10 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  Prompt Content
                </h3>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 hover:bg-cyan-500/10 rounded-full transition-colors flex items-center gap-2 text-gray-400 hover:text-cyan-400 border border-transparent hover:border-cyan-500/20"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="text-sm font-medium">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-black/40 rounded-xl p-5 border border-gray-800">
                <p className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {prompt.prompt}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PromptCard;
