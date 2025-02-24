import React, { useState, useEffect, useMemo } from "react";
import { Mail, Github, Edit2, Trash2, Camera, PenSquare } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { firestore, auth } from '../firebase/firebase';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import AvatarSelector from "../components/AvatarSelector";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Dataset {
  id: string;
  name: string;
  description: string;
  tags: string[];
  visibility: 'public' | 'private';
  createdAt: Date;
  updatedAt: Date;
  size: number;
  format: string;
  owner: string;
}

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(localStorage.getItem("userName") || user?.displayName || "Guest");
  const [about, setAbout] = useState(
    localStorage.getItem("userAbout") || 
    "About me..."
  );
  const [selectedAvatar, setSelectedAvatar] = useState(
    localStorage.getItem("userAvatar") ||
    user?.photoURL ||
    "/avatars/avatar1.png"
  );
  const [githubUrl, setGithubUrl] = useState(
    localStorage.getItem("githubUrl") || 
    `https://github.com/${user?.displayName || 'username'}`
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [editingDataset, setEditingDataset] = useState<Dataset | null>(null);
  const [showDatasetModal, setShowDatasetModal] = useState(false);

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("latest");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;
      
      try {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setName(data.displayName || localStorage.getItem("userName") || user.displayName || "Guest");
          setAbout(data.about || localStorage.getItem("userAbout") || about);
          setSelectedAvatar(data.photoURL || localStorage.getItem("userAvatar") || user.photoURL || "/avatars/avatar1.png");
          setGithubUrl(data.githubUrl || localStorage.getItem("githubUrl") || `https://github.com/${user.displayName || 'username'}`);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    const fetchUserDatasets = async () => {
      if (!user?.uid) return;
      
      try {
        const datasetsRef = collection(firestore, 'datasets');
        const q = query(datasetsRef, where('owner', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedDatasets = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Dataset[];
        setDatasets(fetchedDatasets);
      } catch (error) {
        console.error('Error fetching datasets:', error);
      }
    };

    fetchUserDatasets();
  }, [user]);

  // Add sample datasets if none exist
  useEffect(() => {
    if (datasets.length === 0) {
      const sampleDatasets: Dataset[] = [
        {
          id: '1',
          name: 'Medical Imaging Dataset',
          description: 'A collection of MRI and CT scan images for research purposes',
          tags: ['medical', 'imaging', 'healthcare'],
          visibility: 'public',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-02-01'),
          size: 2048576, // 2MB
          format: 'DICOM',
          owner: user?.uid || ''
        },
        {
          id: '2',
          name: 'Patient Records Analysis',
          description: 'Anonymized patient records for pattern analysis',
          tags: ['analytics', 'healthcare', 'records'],
          visibility: 'private',
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-02-05'),
          size: 1048576, // 1MB
          format: 'CSV',
          owner: user?.uid || ''
        },
        {
          id: '3',
          name: 'Clinical Trial Results',
          description: 'Results from recent clinical trials on new treatments',
          tags: ['clinical', 'research', 'trials'],
          visibility: 'public',
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-10'),
          size: 3145728, // 3MB
          format: 'XLS',
          owner: user?.uid || ''
        }
      ];
      setDatasets(sampleDatasets);
    }
  }, []);

  const displayUsername = user?.displayName || user?.email?.split('@')[0] || 'username';

  const handleSave = async () => {
    setIsEditing(false);
    localStorage.setItem("userName", name);
    localStorage.setItem("userAbout", about);
    localStorage.setItem("githubUrl", githubUrl);
    localStorage.setItem("userAvatar", selectedAvatar);

    if (user?.uid) {
      try {
        await updateDoc(doc(firestore, 'users', user.uid), {
          displayName: name,
          about,
          githubUrl,
          photoURL: selectedAvatar
        });
      } catch (error) {
        console.error('Error updating profile:', error);
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

      // Check if user is signed in with Google
      const isGoogleUser = user.providerData[0]?.providerId === 'google.com';

      try {
        if (isGoogleUser) {
          // Re-authenticate with Google
          const provider = new GoogleAuthProvider();
          await signInWithPopup(auth, provider);
        } else {
          // Re-authenticate with password
          if (!password) {
            throw new Error('Password is required');
          }
          const credential = EmailAuthProvider.credential(user.email!, password);
          await reauthenticateWithCredential(user, credential);
        }

        // Delete Firestore data first
        const collections = ['users', 'datasets', 'profiles', 'uploads'];
        await Promise.all(collections.map(async (collectionName) => {
          const q = query(
            collection(firestore, collectionName),
            where('userId', '==', user.uid)
          );
          const querySnapshot = await getDocs(q);
          return Promise.all(querySnapshot.docs.map(doc => deleteDoc(doc.ref)));
        }));

        // Delete user document
        await deleteDoc(doc(firestore, 'users', user.uid));

        // Delete the authentication user
        await user.delete();
        
        // Clear local storage and states
        localStorage.clear();
        setShowDeleteModal(false);
        setConfirmLoading(false);
        
        // Navigate to home page
        navigate('/', { replace: true });

      } catch (error: any) {
        console.error('Delete operation error:', error);
        throw new Error(error.message || 'Failed to delete account');
      }

    } catch (error: any) {
      console.error('Confirmation error:', error);
      alert(error.message || 'Failed to delete account. Please try again.');
    } finally {
      setConfirmLoading(false);
      setPassword('');
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
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0 }
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100
      }
    }
  };

  const modalVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const filteredAndSortedDatasets = useMemo(() => {
    let result = [...datasets];
    
    // Search filtering
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter(dataset => 
        dataset.name.toLowerCase().includes(searchLower) ||
        dataset.description.toLowerCase().includes(searchLower) ||
        dataset.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
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
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
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
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
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
          <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>
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
                        <input
                          type="text"
                          value={`@${displayUsername}`}
                          disabled
                          className="w-full bg-gray-700/30 text-gray-500 rounded-lg px-4 py-2.5 border border-gray-600/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full bg-gray-700/30 text-gray-500 rounded-lg px-4 py-2.5 border border-gray-600/30"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold text-cyan-400">{name}</h1>
                      <p className="text-gray-400 text-lg">@{displayUsername}</p>
                      <p className="text-gray-500 mt-2">{user?.email}</p>
                    </>
                  )}
                </div>
                <button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className="ml-4 px-5 py-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 
                    hover:bg-cyan-500/20 border border-cyan-500/20 font-medium"
                >
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
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
                    <h3 className="text-sm font-medium text-gray-400 mb-2">About</h3>
                    <p className="text-gray-300">{about}</p>
                  </div>
                )}
              </div>

              {/* GitHub Section */}
              <div className="pt-6 border-t border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Github className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-medium text-gray-400">GitHub Profile</h3>
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
                  <a href={githubUrl} 
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
                <h2 className="text-2xl font-bold text-gray-100">My Datasets</h2>
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
          <div className="p-6">
            {filteredAndSortedDatasets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No datasets found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAndSortedDatasets.map((dataset) => (
                  <motion.div
                    key={dataset.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-750/50 rounded-lg p-5 border border-gray-700/50 
                      hover:border-cyan-500/50 transition-all relative group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-cyan-400 mb-1">
                          {dataset.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${
                              dataset.visibility === 'public' ? 'bg-green-400' : 'bg-yellow-400'
                            }`} />
                            {dataset.visibility}
                          </span>
                          <span>•</span>
                          <span>{formatFileSize(dataset.size)}</span>
                          <span>•</span>
                          <span>{dataset.format}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEditDataset(dataset)}
                        className="p-2 rounded-lg bg-gray-700/50 text-cyan-400 opacity-0 
                          group-hover:opacity-100 transition-opacity hover:bg-gray-600/50"
                      >
                        <PenSquare size={16} />
                      </button>
                    </div>
                    <p className="text-gray-300 mb-3 line-clamp-2">{dataset.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {dataset.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs rounded-full bg-cyan-500/10 
                            text-cyan-400 border border-cyan-500/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-end text-sm text-gray-400">
                      <span>Updated {formatDate(new Date(dataset.updatedAt))}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination if needed */}
          {filteredAndSortedDatasets.length > 0 && (
            <div className="border-t border-gray-700/50 p-4">
              <div className="flex items-center justify-between">
                <button className="text-gray-400 hover:text-cyan-400 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </button>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400">1</button>
                  <button className="px-3 py-1 rounded-lg hover:bg-gray-700 text-gray-400">2</button>
                  <button className="px-3 py-1 rounded-lg hover:bg-gray-700 text-gray-400">3</button>
                </div>
                <button className="text-gray-400 hover:text-cyan-400 flex items-center space-x-2">
                  <span>Next</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
          <h2 className="text-xl font-semibold text-red-400 mb-4">Close Account</h2>
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
              onClick={e => e.stopPropagation()}
              className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl border border-red-500/20 
                shadow-xl max-w-md w-full"
            >
              <h3 className="text-xl font-semibold text-red-400 mb-4">
                Delete Account
              </h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete your account? This action cannot be undone 
                and all your data will be permanently deleted.
              </p>
              
              {user?.providerData[0]?.providerId !== 'google.com' && (
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
                    setPassword('');
                  }}
                  className="px-4 py-2 rounded-xl bg-gray-700/50 text-gray-300 
                    hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={!password && user?.providerData[0]?.providerId !== 'google.com'}
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
              onClick={e => e.stopPropagation()}
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