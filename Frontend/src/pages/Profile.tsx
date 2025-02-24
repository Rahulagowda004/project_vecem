import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Folder,
  Mail,
  Github,
  Search,
  Upload,
  Grid,
  List,
  Download,
  Share2,
} from "lucide-react";
import { useAuth } from '../contexts/AuthContext';  // Replace Auth0 with Firebase auth context
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebase/firebase';
import { User } from 'firebase/auth';

interface ProfileStats {
  projects: number;
  followers: number;
  following: number;
  contributions: number;
}

const initialStats: ProfileStats = {
  projects: 24,
  followers: 1234,
  following: 567,
  contributions: 892,
};

interface FolderItem {
  id: number;
  name: string;
  files: number;
  lastModified: string;
  size: string;
  type: "folder" | "file";
}

const Profile = () => {
  const { user } = useAuth(); // Replace Auth0 hook with Firebase auth context
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState(
    localStorage.getItem("userAbout") ||
    "About me..."
  );
  const [selectedAvatar, setSelectedAvatar] = useState(
    localStorage.getItem("userAvatar") ||
      user?.photoURL ||
      "/avatars/avatar1.png"
  );
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || user?.displayName || "Guest"
  );
  const [stats, setStats] = useState<ProfileStats>(initialStats);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;
      
      try {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setUserName(data.displayName || user.displayName || 'Guest');
          setAboutText(data.about || localStorage.getItem("userAbout") || aboutText);
          setSelectedAvatar(data.photoURL || user.photoURL || '/avatars/avatar1.png');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user]);

  const displayUsername = userData?.username || user?.email?.split('@')[0] || 'username';

  const folders: FolderItem[] = [
    {
      id: 1,
      name: "Project Documentation",
      files: 23,
      lastModified: "2024-01-15",
      size: "156 MB",
      type: "folder",
    },
    {
      id: 2,
      name: "Design Assets",
      files: 145,
      lastModified: "2024-01-20",
      size: "2.1 GB",
      type: "folder",
    },
    {
      id: 3,
      name: "Client Presentations",
      files: 12,
      lastModified: "2024-01-18",
      size: "45 MB",
      type: "folder",
    },
  ];

  const sortedFolders = [...folders].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return (
          new Date(b.lastModified).getTime() -
          new Date(a.lastModified).getTime()
        );
      case "name":
        return a.name.localeCompare(b.name);
      case "size":
        return parseFloat(b.size) - parseFloat(a.size);
      default:
        return 0;
    }
  });

  const filteredFolders = sortedFolders.filter((folder) =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAboutSave = () => {
    setIsEditingAbout(false);
    localStorage.setItem("userAbout", aboutText);
  };

  const handleSaveChanges = async () => {
    setIsEditing(false);
    localStorage.setItem("userAvatar", selectedAvatar);
    localStorage.setItem("userName", userName);
    
    if (user?.uid) {
      try {
        const userRef = doc(firestore, 'users', user.uid);
        await updateDoc(userRef, {
          displayName: userName,
          photoURL: selectedAvatar,
          about: aboutText
        });
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Please log in to view your profile.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={selectedAvatar}
                alt={user?.displayName || "Profile"}
                className="w-32 h-32 rounded-full border-2 border-cyan-400 shadow-xl object-cover"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-white">{userName}</h1>
                  <p className="text-gray-300">@{displayUsername}</p>
                  <p className="text-gray-400 mt-2">{aboutText}</p>

                  <div className="flex gap-6 mt-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail className="w-4 h-4 text-cyan-400" />
                      {user.email}
                    </div>
                    <a
                      href={`https://github.com/${displayUsername}`}
                      className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors"
                    >
                      <Github className="w-4 h-4 text-cyan-400" />
                      @{displayUsername}
                    </a>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {Object.entries(stats).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50"
                  >
                    <div className="text-2xl font-bold text-cyan-400">{value}</div>
                    <div className="text-gray-400 capitalize">{key}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Files Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
          {/* ...existing files section code... */}
        </div>
      </div>
    </div>
  );
};

export default Profile;