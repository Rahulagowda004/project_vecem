import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Copy, Check } from 'lucide-react';

interface PromptCardProps {
  prompt: {
    name: string;
    domain: string;
    prompt: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!prompt || !isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-b from-gray-800/90 to-gray-900/90 rounded-2xl border border-white/10 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">{prompt.name}</h2>
              <div className="flex items-center gap-2 text-cyan-400">
                <Tag className="w-4 h-4" />
                <span>{prompt.domain}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Prompt Content */}
          <div className="mt-4">
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50 relative">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-200">Prompt</h3>
                <button
                  onClick={handleCopy}
                  className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">{prompt.prompt}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PromptCard;
