import React, { useState, useEffect, useMemo } from "react";
import { Mail, Github, Edit2, Trash2, Camera, PenSquare } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import AvatarSelector from "../components/AvatarSelector";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getUserProfile, updateUserProfile } from "../services/userService";

interface Dataset {
  id: string;
  name: string;
  description: string;
  visibility: "public" | "private";
  updatedAt: string;
  createdAt: Date;
  size: number;
  format: string;
  owner: string;
  tags: string[];
}

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const displayUsername = user?.displayName || user?.email?.split("@")[0] || "username";

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.displayName || "Guest");
  const [about, setAbout] = useState("About me...");
  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.photoURL || "/avatars/avatar1.png"
  );
  const [githubUrl, setGithubUrl] = useState(
    `https://github.com/${user?.displayName || "username"}`
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [editingDataset, setEditingDataset] = useState<Dataset | null>(null);
  const [showDatasetModal, setShowDatasetModal] = useState(false);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("latest");
  const [username, setUsername] = useState(displayUsername);
  const [hasChangedUsername, setHasChangedUsername] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;

      try {
        const userProfile = await getUserProfile(user.uid);
        setName(userProfile.name || user.displayName || "Guest");
        setAbout(userProfile.bio || "About me...");
        setSelectedAvatar(
          userProfile.profilePicture || user.photoURL || "/avatars/avatar1.png"
        );
        setGithubUrl(
          userProfile.githubUrl ||
            `https://github.com/${user.displayName || "username"}`
        );
        setUsername(userProfile.username || displayUsername);
        setHasChangedUsername(userProfile.hasChangedUsername || false);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    const fetchUserDatasets = async () => {
      if (!user?.uid) return;

      try {
        // Replace with your API call to fetch datasets
        const response = await fetch(`/api/users/${user.uid}/datasets`);
        const data = await response.json();
        setDatasets(data);
      } catch (error) {
        console.error("Error fetching datasets:", error);
      }
    };

    fetchUserDatasets();
  }, [user]);

  const handleSave = async () => {
    setIsEditing(false);

    if (user?.uid) {
      try {
        await updateUserProfile({
          uid: user.uid,
          displayName: name,
          username: username,
          about: about,
          photoURL: selectedAvatar,
          githubUrl: githubUrl,
          hasChangedUsername: true,
        });
        setHasChangedUsername(true);
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (!user?.uid) return;
      setConfirmLoading(true);

      try {
        const response = await fetch(
          `http://127.0.0.1:5000/delete-account/${user.uid}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ password }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete account");
        }

        await logout();
        navigate("/", { replace: true });
      } catch (error: any) {
        console.error("Delete operation error:", error);
        throw new Error(error.message || "Failed to delete account");
      }
    } catch (error: any) {
      console.error("Confirmation error:", error);
      alert(error.message || "Failed to delete account. Please try again.");
    } finally {
      setConfirmLoading(false);
      setPassword("");
      setShowDeleteModal(false);
    }
  };

  const handleEditDataset = (dataset: Dataset) => {
    navigate(`/datasets/${dataset.id}/edit`);
  };

  const pageVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1,
      },
    },
    exit: { opacity: 0 },
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
      },
    },
  };

  const modalVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  const filteredAndSortedDatasets = useMemo(() => {
    let result = [...datasets];

    // Search filtering
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter(
        (dataset) =>
          dataset.name.toLowerCase().includes(searchLower) ||
          dataset.description.toLowerCase().includes(searchLower) ||
          dataset.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
          dataset.format.toLowerCase().includes(searchLower)
      );
    }

    // Sorting
    switch (sortOption) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "size":
        result.sort((a, b) => b.size - a.size);
        break;
      case "latest":
      default:
        result.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        break;
    }

    return result;
  }, [datasets, searchQuery, sortOption]);

  // Update formatFileSize helper function
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Update formatDate helper function
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Please log in to access settings.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-8 mb-8 border border-gray-700/50"
        >
          <h2 className="text-2xl font-bold text-white mb-6">
            Profile Settings
          </h2>
          <div className="flex items-start space-x-10">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <AvatarSelector
                user={user}
                selectedAvatar={selectedAvatar}
                setSelectedAvatar={setSelectedAvatar}
                isEditing={isEditing}
              />
              {isEditing && (
                <span className="text-sm text-gray-400">
                  Click to change avatar
                </span>
              )}
            </div>

            {/* Profile Details Section */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-grow">
                  {isEditing ? (
                    <div className="space-y-6 w-full max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full text-xl bg-gray-700/50 text-cyan-400 rounded-lg px-4 py-2.5 border border-gray-600/50 focus:border-cyan-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Username
                        </label>
                        {hasChangedUsername ? (
                          <input
                            type="text"
                            value={`@${username}`}
                            disabled
                            className="w-full bg-gray-700/30 text-gray-500 rounded-lg px-4 py-2.5 border border-gray-600/30"
                          />
                        ) : (
                          <div className="relative">
                            <span className="absolute left-4 top-2.5 text-gray-400">@</span>
                            <input
                              type="text"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              className="w-full pl-8 bg-gray-700/50 text-cyan-400 rounded-lg px-4 py-2.5 border border-gray-600/50 focus:border-cyan-500/50"
                            />
                            <span className="text-xs text-yellow-400 mt-1 block">
                              Note: Username can only be set once
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={user?.email || ""}
                          disabled
                          className="w-full bg-gray-700/30 text-gray-500 rounded-lg px-4 py-2.5 border border-gray-600/30"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold text-cyan-400">
                        {name}
                      </h1>
                      <p className="text-gray-400 text-lg">
                        @{username}
                      </p>
                      <p className="text-gray-500 mt-2">{user?.email}</p>
                    </>
                  )}
                </div>
                <button
                  onClick={() =>
                    isEditing ? handleSave() : setIsEditing(true)
                  }
                  className="ml-4 px-5 py-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 
                    hover:bg-cyan-500/20 border border-cyan-500/20 font-medium"
                >
                  {isEditing ? "Save Changes" : "Edit Profile"}
                </button>
              </div>

              {/* About Section */}
              <div className="pt-6 border-t border-gray-700/50">
                {isEditing ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      About Me
                    </label>
                    <textarea
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      className="w-full bg-gray-700/50 text-white rounded-xl p-4 border border-gray-600/50 focus:border-cyan-500/50"
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>
                ) : (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                      About
                    </h3>
                    <p className="text-gray-300">{about}</p>
                  </div>
                )}
              </div>

              {/* GitHub Section */}
              <div className="pt-6 border-t border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Github className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-medium text-gray-400">
                    GitHub Profile
                  </h3>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 
                      text-gray-200 focus:border-cyan-500/50 focus:outline-none"
                  />
                ) : (
                  <a
                    href={githubUrl}
                    className="text-gray-300 hover:text-cyan-400 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {githubUrl}
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Datasets Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 mb-8"
        >
          {/* Dataset Header */}
          <div className="border-b border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-gray-100">
                  My Datasets
                </h2>
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-sm border border-cyan-500/20">
                  {datasets.length}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, description, tags..."
                    className="bg-gray-700/50 border border-gray-600 rounded-lg pl-10 pr-4 py-2 w-64
                      text-gray-200 placeholder-gray-400 focus:border-cyan-500/50 focus:outline-none"
                  />
                  <svg
                    className="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 
                    text-gray-200 focus:border-cyan-500/50 focus:outline-none"
                >
                  <option value="latest">Latest Updated</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="size">Size (Largest)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dataset Grid */}
          <motion.ul
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6"
          >
            {filteredAndSortedDatasets.map((dataset) => (
              <motion.li
                key={dataset.id}
                variants={item}
                whileHover={{ scale: 1.02 }}
                className="group relative bg-gray-750/50 rounded-lg p-5 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300 mb-3">
                  {dataset.name}
                </h3>
                <p className="text-gray-300 mb-4">{dataset.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {dataset.visibility}
                  </span>
                  <span className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Updated {dataset.updatedAt}
                  </span>
                </div>
                <button
                  onClick={() => handleEditDataset(dataset)}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-gray-700/50 text-cyan-400 opacity-0 
                    group-hover:opacity-100 transition-opacity hover:bg-gray-600/50"
                >
                  <PenSquare size={16} />
                </button>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -5 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-red-500/20 p-8 w-full"
        >
          <h2 className="text-xl font-semibold text-red-400 mb-4">
            Close Account
          </h2>
          <button
            onClick={handleDeleteAccount}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 
              rounded-xl hover:bg-red-500/20 border border-red-500/20 transition-colors"
          >
            <Trash2 size={18} />
            Delete Account
          </button>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl border border-red-500/20 
                shadow-xl max-w-md w-full"
            >
              <h3 className="text-xl font-semibold text-red-400 mb-4">
                Delete Account
              </h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete your account? This action cannot
                be undone and all your data will be permanently deleted.
              </p>

              {user?.providerData[0]?.providerId !== "google.com" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Please enter your password to confirm:
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700/50 rounded-xl border border-gray-600 
                      text-white placeholder-gray-400 focus:border-red-500/50 
                      focus:ring-2 focus:ring-red-500/20 outline-none"
                    placeholder="Enter your password"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPassword("");
                  }}
                  className="px-4 py-2 rounded-xl bg-gray-700/50 text-gray-300 
                    hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={
                    !password &&
                    user?.providerData[0]?.providerId !== "google.com"
                  }
                  className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 
                    hover:bg-red-500/20 border border-red-500/20 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {confirmLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Delete Account
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dataset Edit Modal */}
      <AnimatePresence>
        {showDatasetModal && editingDataset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 
              flex items-center justify-center p-4"
            onClick={() => setShowDatasetModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl 
                border border-gray-700/50 shadow-xl w-full max-w-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-6">
                Edit Dataset
              </h3>
              {/* Add your dataset edit form here */}
              {/* This should match the form from DatasetDetail.tsx */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
