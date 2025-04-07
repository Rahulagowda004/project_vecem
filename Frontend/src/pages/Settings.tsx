import React, { useState, useEffect, useMemo } from "react";
import {
  Mail,
  Github,
  Edit2,
  Trash2,
  Camera,
  PenSquare,
  Upload,
  MessageSquare,
  Clock,
  MessageSquarePlus,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import AvatarSelector from "../components/AvatarSelector";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  getUserProfile,
  updateUserProfile,
  checkUsernameAvailability,
  deleteAccount,
  getUserPrompts,
  deletePrompt, // Add this import
} from "../services/userService";
import {
  deleteUser,
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
} from "firebase/auth";
import { toast } from "react-hot-toast";
import NavbarPro from "../components/NavbarPro";
import { getUserDisplayName } from "../utils/userManagement";
import { API_BASE_URL } from "../config";

interface Dataset {
  id: string;
  name: string;
  description: string;
  upload_type: string;
  updatedAt: string;
  createdAt: string;
  size: number;
}

interface Prompt {
  id: string;
  name: string;
  description: string;
  domain: string;
  prompt: string;
  createdAt: string;
  updatedAt?: string;
}

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const displayUsername =
    user?.displayName || user?.email?.split("@")[0] || "username";

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(getUserDisplayName(user));
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
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [deleteError, setDeleteError] = useState("");
  const [isReauthenticating, setIsReauthenticating] = useState(false);
  const [reAuthError, setReAuthError] = useState("");
  const [reAuthPassword, setReAuthPassword] = useState("");
  const [authMethod, setAuthMethod] = useState<"password" | "google" | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [apiKey, setApiKey] = useState("");
  type ViewType = "datasets" | "prompts";
  const [activeView, setActiveView] = useState<ViewType>("datasets");
  const isDatasetView = (view: ViewType): view is "datasets" =>
    view === "datasets";
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const activeViewCount = useMemo(() => {
    return activeView === "datasets" ? datasets.length : prompts.length || 0;
  }, [datasets, prompts, activeView]);

  const [promptsLoading, setPromptsLoading] = useState(true); // Changed initial state to true
  const [promptsError, setPromptsError] = useState<string | null>(null);
  const [promptToDelete, setPromptToDelete] = useState<Prompt | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        console.log("Fetching user profile for UID:", user.uid); // Debug log
        const userProfile = await getUserProfile(user.uid);
        console.log("Received user profile:", userProfile); // Debug log

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
        setApiKey(userProfile.api_key || ""); // Add this line to initialize API key

        // Process and set datasets
        if (userProfile.datasets && Array.isArray(userProfile.datasets)) {
          console.log("Processing datasets:", userProfile.datasets); // Debug log
          const processedDatasets = userProfile.datasets.map(
            (dataset: any) => ({
              id: dataset.id || dataset._id,
              name: dataset.name,
              description: dataset.description || "",
              upload_type: dataset.upload_type || "unknown",
              updatedAt:
                dataset.updatedAt ||
                dataset.timestamp ||
                new Date().toISOString(),
            })
          );
          setDatasets(processedDatasets);
        } else {
          console.log("No datasets found in user profile"); // Debug log
          setDatasets([]);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    // Detect auth method when component mounts
    if (user?.providerData[0]?.providerId === "google.com") {
      setAuthMethod("google");
    } else {
      setAuthMethod("password");
    }
  }, [user]);

  useEffect(() => {
    const fetchPrompts = async () => {
      if (activeView !== "prompts" || !user?.uid) return;

      setPromptsLoading(true);
      setPromptsError(null);

      try {
        const prompts = await getUserPrompts(user.uid);
        setPrompts(prompts);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load prompts";
        console.error("Error fetching prompts:", error);
        setPromptsError(message);
        toast.error(message);
      } finally {
        setPromptsLoading(false);
      }
    };

    fetchPrompts();
  }, [activeView, user?.uid]);

  const checkUsername = async (value: string) => {
    if (!value || value === username || hasChangedUsername) return;

    setUsernameStatus("checking");
    try {
      const isAvailable = await checkUsernameAvailability(value);
      setUsernameStatus(isAvailable ? "available" : "taken");
    } catch (error) {
      console.error("Error checking username:", error);
      setUsernameStatus("idle");
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    checkUsername(value);
  };

  const handleSave = async () => {
    if (usernameStatus === "taken") {
      toast.error(
        "This username is already taken. Please choose a different one.",
        {
          duration: 4000,
          style: {
            background: "rgba(220, 38, 38, 0.1)",
            color: "#ef4444",
            border: "1px solid rgba(220, 38, 38, 0.2)",
            backdropFilter: "blur(8px)",
            padding: "12px",
            borderRadius: "8px",
          },
        }
      );
      return;
    }
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
          apiKey: apiKey, // Add API Key to the update
        });
        setHasChangedUsername(true);
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setShowDeleteModal(true);
    setDeleteError("");
    setIsReauthenticating(true); // Always start with reauthentication
    setReAuthPassword(""); // Reset password field
  };

  const handleReauthenticate = async (method: "password" | "google") => {
    if (!user) return;

    try {
      if (method === "google") {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
        setIsReauthenticating(false);
        setReAuthError("");
      } else if (reAuthPassword) {
        const credential = EmailAuthProvider.credential(
          user.email!,
          reAuthPassword
        );
        await reauthenticateWithCredential(user, credential);
        setIsReauthenticating(false);
        setReAuthError("");
        setReAuthPassword("");
      }
    } catch (error: any) {
      console.error("Reauthentication error:", error);
      setReAuthError(
        error.code === "auth/wrong-password"
          ? "Incorrect password"
          : "Failed to reauthenticate"
      );
    }
  };

  const confirmDelete = async () => {
    if (!user) return;

    // Check if user has reauthenticated
    if (isReauthenticating) {
      setDeleteError("Please reauthenticate before deleting your account");
      return;
    }

    try {
      setConfirmLoading(true);
      setDeleteError("");

      // Delete from MongoDB first
      await deleteAccount(user.uid);

      // Then delete from Firebase Auth
      await deleteUser(user);

      toast.success("Your account has been successfully deleted");
      await logout();
      navigate("/", { replace: true });
    } catch (error: any) {
      console.error("Delete operation error:", error);

      if (error.code === "auth/requires-recent-login") {
        setIsReauthenticating(true);
        setDeleteError("Please reauthenticate to delete your account");
      } else {
        setDeleteError("Failed to delete account");
      }
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleEditDataset = async (dataset: Dataset) => {
    try {
      // Log the edit click to backend
      const response = await fetch("http://127.0.0.1:5000/dataset-edit-click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user?.uid,
          datasetName: dataset.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to log dataset edit");
      }

      // Navigate to edit page even if logging fails
      navigate(`/${username}/${dataset.name}/edit`);
    } catch (error) {
      console.error("Error logging dataset edit:", error);
      // Still navigate even if logging fails
      navigate(`/${username}/${dataset.name}/edit`);
    }
  };

  const handleDeletePrompt = async (promptId: string) => {
    if (!user?.uid) {
      toast.error("You must be logged in to delete prompts");
      return;
    }

    try {
      await deletePrompt(promptId);
      setPromptToDelete(null);
      setPrompts((prevPrompts) => prevPrompts.filter((p) => p.id !== promptId));
    } catch (error) {
      console.error("Error deleting prompt:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete prompt"
      );
    }
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
          dataset.upload_type.toLowerCase().includes(searchLower)
      );
    }

    // Sorting
    switch (sortOption) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "latest":
      default:
        result.sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt || Date.now()).getTime() -
            new Date(a.updatedAt || a.createdAt || Date.now()).getTime()
        );
        break;
    }

    return result;
  }, [datasets, searchQuery, sortOption]);

  const filteredAndSortedPrompts = useMemo(() => {
    let result = [...prompts];

    // Search filtering
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter(
        (prompt) =>
          prompt.name?.toLowerCase().includes(searchLower) ||
          prompt.description?.toLowerCase().includes(searchLower)
      );
    }

    // Sorting
    switch (sortOption) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
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
  }, [prompts, searchQuery, sortOption]);

  const paginatedItems = useMemo(() => {
    if (activeView === "prompts" && promptsLoading) {
      return []; // Return empty array while loading instead of dummy items
    }

    const items =
      activeView === "datasets"
        ? filteredAndSortedDatasets
        : filteredAndSortedPrompts;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [
    activeView,
    filteredAndSortedDatasets,
    filteredAndSortedPrompts,
    currentPage,
    promptsLoading,
  ]);

  const totalPages = Math.ceil(filteredAndSortedDatasets.length / itemsPerPage);

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  // Update formatFileSize helper function
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <NavbarPro />
      <div className="max-w-5xl mx-auto px-4 py-8 pt-24">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-8 mb-8 border border-gray-700/50 relative z-10"
        >
          <h2 className="text-2xl font-bold text-white mb-6">
            Profile Settings
          </h2>
          <div className="flex items-start space-x-10">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4 relative z-20">
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
            <div className="flex-1 space-y-6 relative z-10">
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
                            <span className="absolute left-4 top-2.5 text-gray-400">
                              @
                            </span>
                            <input
                              type="text"
                              value={username}
                              onChange={handleUsernameChange}
                              className={`w-full pl-8 bg-gray-700/50 text-cyan-400 rounded-lg px-4 py-2.5 border 
                                ${
                                  usernameStatus === "available"
                                    ? "border-green-500/50"
                                    : usernameStatus === "taken"
                                    ? "border-red-500/50"
                                    : "border-gray-600/50"
                                } focus:border-cyan-500/50`}
                            />
                            {usernameStatus === "checking" && (
                              <span className="text-xs text-gray-400 mt-1 block">
                                Checking availability...
                              </span>
                            )}
                            {usernameStatus === "available" && (
                              <span className="text-xs text-green-400 mt-1 block">
                                Username is available!
                              </span>
                            )}
                            {usernameStatus === "taken" && (
                              <span className="text-xs text-red-400 mt-1 block">
                                Username is already taken
                              </span>
                            )}
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
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          API Key
                        </label>
                        <input
                          type="text"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          className="w-full bg-gray-700/50 text-cyan-400 rounded-lg px-4 py-2.5 border border-gray-600/50 focus:border-cyan-500/50"
                          placeholder="Enter your API key"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold text-cyan-400">
                        {name}
                      </h1>
                      <p className="text-gray-400 text-lg">@{username}</p>
                      <p className="text-gray-500 mt-2">{user?.email}</p>
                      <p className="text-gray-500 mt-2">
                        API Key: {apiKey || "Not set"}
                      </p>
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

              {/* GitHub Section */}
              <div className="pt-1">
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

              {/* About Section */}
              <div className="pt-1">
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
            </div>
          </div>
        </motion.div>

        {/* Datasets Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 mb-8 relative z-0"
        >
          {/* Dataset Header */}
          <div className="border-b border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-gray-100">
                  {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
                </h2>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20"
                >
                  <span className="text-cyan-400 font-medium">
                    {activeViewCount}
                  </span>
                </motion.div>
              </div>
            </div>

            <div className="p-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                {/* View Selector */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveView("datasets")}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      activeView === "datasets"
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        : "text-gray-400 hover:text-cyan-400"
                    }`}
                  >
                    Datasets
                  </button>
                  <button
                    onClick={() => setActiveView("prompts")}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      activeView === "prompts"
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        : "text-gray-400 hover:text-cyan-400"
                    }`}
                  >
                    Prompts
                  </button>
                </div>

                {/* Center Search Bar */}
                <div className="flex-1 max-w-md mx-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={`Search ${activeView}...`}
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-cyan-500"
                    />
                    <svg
                      className="w-5 h-5 absolute right-3 top-2.5 text-gray-400"
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
                </div>

                {/* Right Side Filters */}
                <div className="flex items-center space-x-4">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="latest">Sort by: Latest</option>
                    <option value="name">Sort by: Name</option>
                  </select>
                  {searchQuery && (
                    <div className="text-gray-400">
                      Found{" "}
                      {activeView === "datasets"
                        ? filteredAndSortedDatasets.length
                        : filteredAndSortedPrompts.length}{" "}
                      results
                    </div>
                  )}
                </div>
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
            {activeView === "datasets" ? (
              paginatedItems.length > 0 ? (
                paginatedItems.map((dataset: Dataset) => (
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
                        {dataset.upload_type}
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
                        {formatDate(dataset.updatedAt)}
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
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-2 flex flex-col items-center justify-center p-12 text-center"
                >
                  <div className="w-24 h-24 mb-6 text-gray-600">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    No Datasets to Manage
                  </h3>
                  <p className="text-gray-500">
                    You haven't uploaded any datasets yet.
                  </p>
                </motion.div>
              )
            ) : promptsLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-2 flex items-center justify-center p-12"
              >
                <div className="text-gray-400">Loading prompts...</div>
              </motion.div>
            ) : paginatedItems.length > 0 ? (
              paginatedItems.map((prompt) => (
                <motion.li
                  key={prompt.id}
                  variants={item}
                  whileHover={{ scale: 1.02 }}
                  className="group relative bg-gray-750/50 rounded-lg p-5 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300"
                >
                  <h3 className="text-lg font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300 mb-3">
                    {prompt.name}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {prompt.domain || "General"}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(prompt.updatedAt || prompt.createdAt)}
                    </span>
                  </div>
                  <button
                    onClick={() => setPromptToDelete(prompt)}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-gray-700/50 text-red-400 opacity-0 
                        group-hover:opacity-100 transition-opacity hover:bg-gray-600/50"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.li>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-2 flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-24 h-24 mb-6 text-gray-600">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  Your Prompt Library is Empty
                </h3>
                <p className="text-gray-500">
                  Create and manage your AI prompts to streamline your workflow.
                </p>
              </motion.div>
            )}
          </motion.ul>

          {/* Show pagination only if there are settings */}
          {filteredAndSortedDatasets.length > 0 && (
            <div className="border-t border-gray-700/50 p-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePreviousPage}
                  className="text-gray-400 hover:text-cyan-400 flex items-center space-x-2"
                  disabled={currentPage === 1}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span>Previous</span>
                </button>
                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-3 py-1 rounded-lg ${
                        currentPage === index + 1
                          ? "bg-cyan-500/10 text-cyan-400"
                          : "hover:bg-gray-700 text-gray-400"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleNextPage}
                  className="text-gray-400 hover:text-cyan-400 flex items-center space-x-2"
                  disabled={currentPage === totalPages}
                >
                  <span>Next</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
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
                Are you sure you want to permanently delete your account? This
                action is irreversible, and all your data will be lost.
              </p>

              {deleteError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{deleteError}</p>
                </div>
              )}

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

              {isReauthenticating && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-300 mb-3">
                    Please reauthenticate
                  </h4>
                  <p className="text-gray-400 mb-4 text-sm">
                    For security reasons, please verify your identity using one
                    of these methods:
                  </p>

                  <div className="space-y-4">
                    {/* Password Authentication Option */}
                    <div className="space-y-3">
                      <input
                        type="password"
                        value={reAuthPassword}
                        onChange={(e) => setReAuthPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700/50 rounded-xl border border-gray-600 
                          text-white placeholder-gray-400 focus:border-red-500/50 
                          focus:ring-2 focus:ring-red-500/20 outline-none"
                        placeholder="Enter your password"
                      />
                      <button
                        onClick={() => handleReauthenticate("password")}
                        disabled={!reAuthPassword}
                        className="w-full px-4 py-2 rounded-xl bg-red-500/10 text-red-400 
                          hover:bg-red-500/20 border border-red-500/20 transition-colors
                          disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Verify with Password
                      </button>
                    </div>

                    {/* Google Authentication Option */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-600"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-800/90 text-gray-400">
                          Or
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleReauthenticate("google")}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl
                        bg-white hover:bg-gray-100 text-gray-800 font-medium transition-colors"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </button>
                  </div>

                  {reAuthError && (
                    <p className="text-red-400 text-sm mt-3">{reAuthError}</p>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPassword("");
                    setDeleteError("");
                  }}
                  className="px-4 py-2 rounded-xl bg-gray-700/50 text-gray-300 
                    hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={
                    confirmLoading ||
                    (!password &&
                      user?.providerData[0]?.providerId !== "google.com")
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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

      {/* Prompt Delete Confirmation Modal */}
      <AnimatePresence>
        {promptToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPromptToDelete(null)}
          >
            <motion.div
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl border border-red-500/20 shadow-xl max-w-md w-full"
            >
              <h3 className="text-xl font-semibold text-red-400 mb-4">
                Delete Prompt
              </h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete the prompt "
                {promptToDelete.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setPromptToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-gray-700/50 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeletePrompt(promptToDelete.id)}
                  className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 
                    transition-colors flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete Prompt
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
