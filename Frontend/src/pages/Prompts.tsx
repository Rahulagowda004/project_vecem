import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Minus, Save } from "lucide-react";
import NavbarPro from "../components/NavbarPro";
import { useAuth } from "../contexts/AuthContext";

const Prompts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prompts, setPrompts] = useState<string[]>([""]);

  const handleAddPrompt = () => {
    setPrompts([...prompts, ""]);
  };

  const handleRemovePrompt = (index: number) => {
    const newPrompts = prompts.filter((_, i) => i !== index);
    setPrompts(newPrompts);
  };

  const handlePromptChange = (index: number, value: string) => {
    const newPrompts = [...prompts];
    newPrompts[index] = value;
    setPrompts(newPrompts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement prompt submission logic
    navigate(`/${user?.displayName}`);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <NavbarPro />
      <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-8 shadow-xl border border-gray-700"
        >
          <h1 className="text-3xl font-bold text-white mb-8">Create Prompt</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Prompt Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none"
                placeholder="Enter prompt name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none resize-none h-32"
                placeholder="Enter prompt description"
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-300">
                  Prompts
                </label>
                <button
                  type="button"
                  onClick={handleAddPrompt}
                  className="flex items-center gap-2 px-3 py-1 bg-cyan-600/20 text-cyan-400 rounded-lg hover:bg-cyan-600/30 transition-all"
                >
                  <Plus size={16} />
                  Add Prompt
                </button>
              </div>
              {prompts.map((prompt, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => handlePromptChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none"
                    placeholder={`Prompt ${index + 1}`}
                    required
                  />
                  {prompts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePrompt(index)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Minus size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-600/20"
              >
                <Save size={18} />
                Save Prompts
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Prompts;
