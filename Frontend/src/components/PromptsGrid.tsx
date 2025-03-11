import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';
import PromptCard from './PromptCard';

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <>
      <motion.ul
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
      >
        {prompts.map((prompt) => (
          <motion.li
            key={prompt._id}
            variants={item}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedPrompt(prompt)}
            className="group relative bg-gray-750/50 rounded-lg p-5 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300 mb-3">
              {prompt.prompt_name}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span className="flex items-center">
                <Tag className="w-4 h-4 mr-1" />
                {prompt.domain || "General"}
              </span>
            </div>
          </motion.li>
        ))}
      </motion.ul>

      <PromptCard
        prompt={selectedPrompt ? {
          name: selectedPrompt.prompt_name,
          domain: selectedPrompt.domain,
          prompt: selectedPrompt.prompt,
          username: selectedPrompt.username,
          createdAt: selectedPrompt.createdAt,
          updatedAt: selectedPrompt.updatedAt
        } : null}
        isOpen={!!selectedPrompt}
        onClose={() => setSelectedPrompt(null)}
      />
    </>
  );
};

export default PromptsGrid;
