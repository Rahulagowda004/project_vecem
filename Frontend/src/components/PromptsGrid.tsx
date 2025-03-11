import React from 'react';
import { Users } from 'lucide-react';

interface Prompt {
  id: number;
  title: string;
  description: string;
  category: string;
  complexity: string;
  usage: number;
}

interface PromptsGridProps {
  prompts: Prompt[];
}

const PromptsGrid: React.FC<PromptsGridProps> = ({ prompts }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {prompts.map((prompt) => (
        <div
          key={prompt.id}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-200 group"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-cyan-400">{prompt.title}</h3>
            <span className="px-3 py-1 bg-gray-700/50 rounded-full text-xs text-gray-300">
              {prompt.complexity}
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-4">{prompt.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{prompt.category}</span>
            <div className="flex items-center space-x-1 text-gray-500">
              <Users className="w-3 h-3" />
              <span className="text-xs">{prompt.usage}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PromptsGrid;
