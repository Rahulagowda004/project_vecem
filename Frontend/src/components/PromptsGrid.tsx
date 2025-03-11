import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Users, Copy, Check } from 'lucide-react';
import PromptCard from './PromptCard';

interface Prompt {
  _id: string;
  prompt_name: string;  // Changed from name to prompt_name
  domain: string;
  prompt: string;
  username: string;
  createdAt?: string;   // Changed from created_at
  updatedAt?: string;   // Changed from updated_at
}

interface PromptsGridProps {
  prompts: Prompt[];
}

const PromptsGrid: React.FC<PromptsGridProps> = ({ prompts }) => {
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (prompt: string, id: string) => {
    navigator.clipboard.writeText(prompt);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {prompts.map((prompt, index) => (
          <motion.div
            key={prompt._id} // Use _id instead of index
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-tr from-gray-900/95 via-gray-800/95 to-gray-900/95 rounded-xl border border-cyan-500/20 p-6 hover:border-cyan-500/40 transition-all duration-300 cursor-pointer group shadow-xl backdrop-blur-xl"
            onClick={() => setSelectedPrompt(prompt)}
          >
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  {prompt.prompt_name}  {/* Changed from name to prompt_name */}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(prompt.prompt, index.toString());
                  }}
                  className="px-3 py-1.5 hover:bg-cyan-500/10 rounded-full transition-colors flex items-center gap-2 text-gray-400 hover:text-cyan-400 border border-transparent hover:border-cyan-500/20"
                >
                  {copied === index.toString() ? (
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
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-cyan-500/10 px-3 py-1.5 rounded-full">
                  <Tag className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-400 font-medium">{prompt.domain}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-700/30 px-3 py-1.5 rounded-full">
                  <span className="text-gray-400">by</span>
                  <span className="text-gray-200 font-medium">{prompt.username}</span>
                </div>
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-4 border border-gray-800">
              <p className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed line-clamp-3">
                {prompt.prompt}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <PromptCard
        prompt={selectedPrompt}
        isOpen={!!selectedPrompt}
        onClose={() => setSelectedPrompt(null)}
      />
    </>
  );
};

export default PromptsGrid;
