import React, { useState, useEffect } from "react";
import { Mail, Github, Edit2, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";
import AvatarSelector from "../components/AvatarSelector";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { updateUserProfile } from "../services/userService";

// Add these animation variants before the Dataset interface
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const modalVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

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
}

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(
    localStorage.getItem("userName") || user?.displayName || "Guest"
  );
  const [about, setAbout] = useState(
    localStorage.getItem("userAbout") || "About me..."
  );
  const [selectedAvatar, setSelectedAvatar] = useState(
    localStorage.getItem("userAvatar") ||
      user?.photoURL ||
      "/avatars/avatar1.png"
  );
  const [githubUrl, setGithubUrl] = useState(
    localStorage.getItem("githubUrl") ||
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

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) {
        navigate("/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setName(
            data.displayName ||
              localStorage.getItem("userName") ||
              user.displayName ||
              "Guest"
          );
          setAbout(data.about || localStorage.getItem("userAbout") || about);
          setSelectedAvatar(
            data.photoURL ||
              localStorage.getItem("userAvatar") ||
              user.photoURL ||
              "/avatars/avatar1.png"
          );
          setGithubUrl(
            data.githubUrl ||
              localStorage.getItem("githubUrl") ||
              `https://github.com/${user.displayName || "username"}`
          );
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Show a more user-friendly error message
        alert("Failed to load user data. Please try refreshing the page.");
      }
    };

    fetchUserData();
  }, [user, navigate]);

  useEffect(() => {
    const fetchUserDatasets = async () => {
      if (!user?.uid) return;

      try {
        // For now, using mock data similar to UserProfile
        const mockDatasets = [
          {
            id: "1",
            name: "Medical Imaging Dataset",
            description: "Collection of medical imaging data for AI training",
            visibility: "public",
            updatedAt: "2d",
            createdAt: new Date("2024-01-15"),
            size: 2048576, // 2MB
            format: "DICOM",
            owner: user?.uid || "",
          },
          {
            id: "2",
            name: "Patient Records Analysis",
            description: "Anonymized patient records for pattern analysis",
            visibility: "private",
            updatedAt: "5d",
            createdAt: new Date("2024-01-20"),
            size: 1048576, // 1MB
            format: "CSV",
            owner: user?.uid || "",
          },
          {
            id: "3",
            name: "Clinical Trial Results",
            description:
              "Results from recent clinical trials on new treatments",
            visibility: "public",
            updatedAt: "10d",
            createdAt: new Date("2024-02-01"),
            size: 3145728, // 3MB
            format: "XLS",
            owner: user?.uid || "",
          },
        ];
        setDatasets(mockDatasets);
      } catch (error) {
        console.error("Error fetching datasets:", error);
      }
    };

    fetchUserDatasets();
  }, [user]);

  const displayUsername =
    user?.displayName || user?.email?.split("@")[0] || "username";

  const handleSave = async () => {
    setIsEditing(false);
    localStorage.setItem("userName", name);
    localStorage.setItem("userAbout", about);
    localStorage.setItem("githubUrl", githubUrl);
    localStorage.setItem("userAvatar", selectedAvatar);

    if (user?.uid) {
      try {
        await updateUserProfile({
          uid: user.uid,
          displayName: name,
          about,
          githubUrl,
          photoURL: selectedAvatar,
        });
        console.log("Profile updated successfully");
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }
  };

  // Add this function before the handleSave function
  const confirmDelete = async () => {
    setConfirmLoading(true);
    try {
      if (user?.uid) {
        await deleteDoc(doc(firestore, "users", user.uid));
      }
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please try again.");
    } finally {
      setConfirmLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      if (user?.uid) {
        await deleteDoc(doc(firestore, "users", user.uid));
      }
      await logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting account:", error);
    }
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
                    <>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="text-2xl bg-gray-700 text-gray-100 rounded px-2 py-1 mb-1"
                      />
                    </>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold text-gray-100">
                        {name}
                      </h1>
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
                <div className="flex items-center space-x-2 text-gray-400">
                  <Github size={16} />
                  {isEditing ? (
                    <input
                      type="text"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="Enter GitHub URL"
                      className="bg-gray-700 text-gray-100 rounded px-2 py-1 text-sm w-64"
                    />
                  ) : (
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-400"
                    >
                      @{user?.displayName || "username"}
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-700">
                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Trash2 size={16} />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>
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
