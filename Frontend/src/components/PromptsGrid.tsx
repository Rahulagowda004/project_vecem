import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, TerminalSquare, User } from "lucide-react";
import PromptCard from "./PromptCard";
import { useNavigate } from "react-router-dom";

interface Prompt {
  _id: string;
  prompt_name: string;
  domain: string;
  prompt: string;
  username: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PromptsGridProps {
  prompts: Prompt[];
}

const PromptsGrid: React.FC<PromptsGridProps> = ({ prompts }) => {
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const navigate = useNavigate();

  const handleUsernameClick = (e: React.MouseEvent, username: string) => {
    e.stopPropagation(); // Prevent the prompt card from opening
    navigate(`/${username}/view`);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { y: 10, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <>
      <motion.ul
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-6 p-1 sm:p-3 md:p-6"
      >
        {prompts.map((prompt) => (
          <motion.li
            key={prompt._id}
            variants={item}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setSelectedPrompt(prompt)}
            className="group relative bg-gray-750/50 rounded-lg p-2 sm:p-3 md:p-5 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-md" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2">
                <TerminalSquare className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                <h3 className="text-xs sm:text-base font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300 truncate">
                  {prompt.prompt_name}
                </h3>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-1 sm:mt-2 gap-1 sm:gap-0">
                <span className="flex items-center text-[10px] sm:text-xs text-gray-400">
                  <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                  <span className="truncate max-w-[80px] sm:max-w-full">
                    {prompt.domain || "General"}
                  </span>
                </span>
                <button
                  onClick={(e) => handleUsernameClick(e, prompt.username)}
                  className="flex items-center text-[10px] sm:text-xs text-gray-400 hover:text-cyan-400 transition-colors group"
                >
                  <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                  <span className="truncate max-w-[80px] sm:max-w-[120px] relative">
                    {prompt.username}
                    <span className="absolute left-0 bottom-0 w-0 h-px bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
                  </span>
                </button>
              </div>
            </div>
          </motion.li>
        ))}
      </motion.ul>

      <AnimatePresence>
        <PromptCard
          prompt={
            selectedPrompt
              ? {
                  name: selectedPrompt.prompt_name,
                  domain: selectedPrompt.domain,
                  prompt: selectedPrompt.prompt,
                  username: selectedPrompt.username,
                  createdAt: selectedPrompt.createdAt,
                  updatedAt: selectedPrompt.updatedAt,
                }
              : null
          }
          isOpen={!!selectedPrompt}
          onClose={() => setSelectedPrompt(null)}
        />
      </AnimatePresence>
    </>
  );
};

export default PromptsGrid;
