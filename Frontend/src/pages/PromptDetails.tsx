import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Edit2, Trash2, User, ChevronRight, Copy } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfileByUid } from "../services/userService";
import type { PromptData } from "../services/promptService";

const PromptDetails = () => {
  const navigate = useNavigate();
  const { username, promptname } = useParams();
  const { user } = useAuth();
  const [promptData, setPromptData] = useState<PromptData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState<PromptData | null>(null);

  useEffect(() => {
    const fetchPromptData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/prompts/${username}/${promptname}/view`);
        if (!response.ok) throw new Error('Failed to fetch prompt data');
        const data = await response.json();
        setPromptData(data);
        setEditedPrompt(data);
      } catch (error) {
        setError('Error loading prompt data');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username && promptname) {
      fetchPromptData();
    }
  }, [username, promptname]);

  const handleCopyPrompt = async () => {
    if (promptData?.prompt) {
      await navigator.clipboard.writeText(promptData.prompt);
      // You could add a toast notification here
      alert('Prompt copied to clipboard!');
    }
  };

  const handleSaveChanges = async () => {
    if (!editedPrompt) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/prompts/${username}/${promptname}/view`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedPrompt)
      });

      if (!response.ok) throw new Error('Failed to update prompt');
      setPromptData(editedPrompt);
      setIsEditing(false);
    } catch (error) {
      setError('Error updating prompt');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/prompts/${username}/${promptname}/view`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete prompt');
      navigate(`/${username}`);
    } catch (error) {
      setError('Error deleting prompt');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="min-h-screen h-full w-full max-w-7xl mx-auto px-8 py-6 md:py-8">
        <nav className="flex mb-6 text-sm text-gray-400">
          <Link to={`/${username}`} className="flex items-center hover:text-cyan-400 transition-colors">
            <User className="w-4 h-4 mr-1" />
            {username}
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link 
            to={`/${username}/${promptname}/view`} 
            className="text-white hover:text-cyan-400 transition-colors"
          >
            {promptname}
          </Link>
        </nav>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-gray-700/50 p-6 md:p-8"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{promptData?.prompt_name}</h1>
              <p className="text-gray-400">Domain: {promptData?.domain}</p>
            </div>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyPrompt}
                className="p-2 rounded-lg bg-gray-700/50 text-cyan-400 hover:bg-gray-700 transition-colors"
              >
                <Copy className="w-5 h-5" />
              </motion.button>
              {user && username === user.displayName && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-2 rounded-lg bg-gray-700/50 text-cyan-400 hover:bg-gray-700 transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeleteModal(true)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <textarea
                value={editedPrompt?.prompt || ''}
                onChange={(e) => setEditedPrompt(prev => ({ ...prev!, prompt: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 
                  text-white placeholder-gray-400 resize-none h-64"
              />
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700/50">
              <pre className="text-gray-300 whitespace-pre-wrap font-mono">
                {promptData?.prompt}
              </pre>
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl border border-red-500/20 max-w-md w-full"
          >
            <h3 className="text-xl font-semibold text-red-400 mb-4">Delete Prompt</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this prompt? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 border border-red-500/20 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PromptDetails;
