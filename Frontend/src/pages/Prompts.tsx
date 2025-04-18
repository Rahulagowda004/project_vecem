import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Minus, Save, User, ChevronRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfileByUid } from "../services/userService";
import { saveUserPrompt } from "../services/promptService";

const Prompts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [domain, setDomain] = useState("");
  const [userProfile, setUserProfile] = useState<{ username: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{
    show: boolean;
    success: boolean;
    message: string;
  }>({ show: false, success: false, message: "" });

  const domains = [
    "Health",
    "Education",
    "Automobile",
    "Finance",
    "Business",
    "Banking",
    "Retail",
    "Government",
    "Sports",
    "Social Media",
    "Entertainment",
    "Telecommunication",
    "Energy",
    "E-Commerce",
  ];

  const formatPromptName = (value: string) => {
    return value.replace(/\s+/g, '_');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedName = formatPromptName(e.target.value);
    setName(formattedName);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.uid) {
        try {
          const profile = await getUserProfileByUid(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  const StatusMessage = () => {
    if (!uploadStatus.show) return null;

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div
          className={`p-8 rounded-xl ${
            uploadStatus.success ? "bg-green-800/90" : "bg-red-800/90"
          } shadow-lg max-w-md mx-4 text-center transform transition-all duration-300 scale-100`}
        >
          <div
            className={`text-6xl mb-4 ${
              uploadStatus.success ? "text-green-400" : "text-red-400"
            }`}
          >
            {uploadStatus.success ? "✓" : "✕"}
          </div>
          <h3 className="text-2xl font-semibold mb-2 text-white">
            {uploadStatus.success ? "Success!" : "Upload Failed"}
          </h3>
          <p className="text-lg text-gray-200">{uploadStatus.message}</p>
          {uploadStatus.success && (
            <p className="text-sm text-gray-300 mt-4">
              Redirecting to your profile...
            </p>
          )}
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setUploadStatus({ show: false, success: false, message: "" });

    try {
      if (!userProfile?.username) {
        throw new Error("Username not found");
      }

      await saveUserPrompt({
        username: userProfile.username,
        prompt_name: name.trim(),
        prompt: prompt.trim(),
        domain: domain,
      });

      setUploadStatus({
        show: true,
        success: true,
        message: "Prompt saved successfully!",
      });

      // Wait for 2 seconds before redirecting
      setTimeout(() => {
        navigate(`/${userProfile.username}`);
      }, 2000);
    } catch (error: any) {
      console.error("Error saving prompt:", error);
      setError(error.message || "Failed to save prompt. Please try again.");
      setUploadStatus({
        show: true,
        success: false,
        message: error.message || "Failed to save prompt",
      });

      // Hide error message after 4 seconds
      setTimeout(() => {
        setUploadStatus({ show: false, success: false, message: "" });
      }, 4000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {uploadStatus.show && <StatusMessage />}
      <div className="min-h-screen h-full w-full max-w-7xl mx-auto px-8 py-6 md:py-8">
        {/* Breadcrumb navigation */}
        <nav className="flex mb-6 text-sm text-gray-400">
          {userProfile?.username ? (
            <Link
              to={`/${userProfile.username}`}
              className="flex items-center hover:text-cyan-400 transition-colors"
            >
              <User className="w-4 h-4 mr-1" />
              {userProfile.username}
            </Link>
          ) : (
            <span className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              Loading...
            </span>
          )}
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-white">Upload Prompt</span>
        </nav>

        <div className="min-h-[calc(100vh-4rem)] bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-gray-700/50 p-6 md:p-8 overflow-y-auto">
          <h1 className="text-3xl font-bold text-white mb-6">Create Prompt</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-200">
                  Prompt Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 
                    text-white placeholder-gray-400"
                  placeholder="Enter_prompt_name"
                  required
                  pattern="[A-Za-z0-9_]+"
                  title="Only letters, numbers and underscores are allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-200">
                  Domain
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 
                    text-white placeholder-gray-400"
                  required
                >
                  <option value="">Select a domain</option>
                  {domains.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-200">
                Prompt Content
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 
                  text-white placeholder-gray-400 resize-none h-64"
                placeholder="Enter your prompt content"
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg 
                  hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-cyan-600 
                  text-white rounded-lg hover:bg-cyan-700 transition-colors
                  disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Save size={18} />
                    Save
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Prompts;
