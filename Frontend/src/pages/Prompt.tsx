import React, { useState, useRef } from 'react';
import { Upload, PlusCircle, Trash2, ChevronRight, Home, Laptop2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Prompt {
  id: string;
  text: string;
}

function Prompt() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [newPrompt, setNewPrompt] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const newPrompts = text.split('\n')
          .filter(line => line.trim()) // Skip empty lines
          .map((line, index) => ({
            id: `${Date.now()}-${index}`,
            text: line.trim(),
          }));
        setPrompts((prev) => [...prev, ...newPrompts]);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      };
      reader.readAsText(file);
    }
  };

  const handleAddPrompt = () => {
    if (newPrompt.trim()) {
      setPrompts((prev) => [
        ...prev,
        { id: Date.now().toString(), text: newPrompt.trim() },
      ]);
      setNewPrompt('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddPrompt();
    }
  };

  const handleDeletePrompt = (id: string) => {
    setPrompts((prev) => prev.filter((prompt) => prompt.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Updated Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-2 bg-gray-900/80 border-b border-cyan-500/10"
      >
        <nav className="flex items-center space-x-2 text-sm">
          <Link 
            to="/" 
            className="flex items-center text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <Home className="w-4 h-4 mr-1" />
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-600" />
          <span className="text-cyan-400 flex items-center">
            <Laptop2 className="w-4 h-4 mr-1 inline-block" />
            Prompts
          </span>
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="bg-gray-800 rounded-xl shadow-2xl shadow-cyan-500/10 p-8 border border-gray-700">
            <h1 className="text-2xl font-bold text-cyan-400 mb-8 text-center">Prompt Management</h1>
            
            {/* Upload Section */}
            <div className="mb-8">
              <div 
                className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-cyan-400 transition-colors bg-gray-800/50"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-400">Click to upload a text file with prompts</p>
                <p className="text-gray-500 text-sm mt-1">One prompt per line</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt"
                  className="hidden"
                />
              </div>
            </div>

            {/* Add New Prompt Section */}
            <div className="mb-8">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter a new prompt..."
                  className="flex-1 bg-gray-900/50 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 border border-gray-700"
                />
                <button
                  onClick={handleAddPrompt}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all flex items-center gap-2"
                >
                  <PlusCircle className="w-5 h-5" />
                  Add
                </button>
              </div>
            </div>

            {/* Prompts List */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3 group hover:bg-gray-900/70 transition-colors"
                >
                  <span className="text-gray-300">{prompt.text}</span>
                  <button
                    onClick={() => handleDeletePrompt(prompt.id)}
                    className="text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Prompt;