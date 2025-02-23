import React, { useState, useEffect } from "react";
import { Mail, Github, Edit2, Trash2 } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { firestore, auth } from '../firebase/firebase';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import AvatarSelector from "../components/AvatarSelector";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(localStorage.getItem("userName") || user?.displayName || "Guest");
  const [about, setAbout] = useState(
    localStorage.getItem("userAbout") || 
    "Creative professional with over 8 years of experience in digital design and art direction."
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Please log in to access settings.</div>
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900"
    >
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 w-full">
        {/* Profile Settings Card */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -5 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 shadow-xl w-full"
        >
          <h1 className="text-4xl text-center font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 
            bg-clip-text text-transparent mb-8 animate-slideDown">
            Profile Configuration
          </h1>
          
          <div className="flex flex-col md:flex-row gap-8 w-full">
            <div className="relative transition-transform duration-300 ease-out hover:scale-102">
              <AvatarSelector
                user={user}
                selectedAvatar={selectedAvatar}
                setSelectedAvatar={setSelectedAvatar}
                isEditing={isEditing}
                className="w-32 h-32 rounded-xl border-2 border-gray-700/50 shadow-xl"
              />
            </div>

            <div className="flex-1 space-y-6 animate-slideIn">
              <div className="flex justify-between items-start">
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-3xl bg-gray-700/50 text-white rounded-xl px-4 py-2 
                      border border-gray-600/50 focus:border-cyan-500/50 focus:ring-2 
                      focus:ring-cyan-500/20 outline-none w-full max-w-md"
                  />
                ) : (
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">
                      {name}
                    </h1>
                    <p className="text-gray-400">@{displayUsername}</p>
                  </div>
                )}

                <button
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                  className={`px-4 py-2 rounded-xl transition-colors ${
                    isEditing
                      ? "bg-gradient-to-r from-cyan-500 to-cyan-400 text-white hover:from-cyan-600 hover:to-cyan-500"
                      : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {isEditing ? "Save Changes" : <Edit2 size={18} />}
                </button>
              </div>

              {isEditing ? (
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="w-full bg-gray-700/50 text-white rounded-xl p-4 
                    border border-gray-600/50 focus:border-cyan-500/50 
                    focus:ring-2 focus:ring-cyan-500/20 outline-none min-h-[100px]"
                />
              ) : (
                <p className="text-gray-300">{about}</p>
              )}

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  {user?.email}
                </div>
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-cyan-400" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="bg-gray-700/50 text-white rounded-lg px-3 py-1 
                        border border-gray-600/50 focus:border-cyan-500/50 
                        focus:ring-2 focus:ring-cyan-500/20 outline-none"
                    />
                  ) : (
                    <a href={githubUrl} 
                       className="text-gray-400 hover:text-cyan-400 transition-colors"
                       target="_blank" 
                       rel="noopener noreferrer"
                    >
                      @{displayUsername}
                    </a>
                  )}
                </div>
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
    </motion.div>
  );
};

export default Settings;