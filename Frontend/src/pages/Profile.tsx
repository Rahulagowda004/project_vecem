import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Folder,
  Mail,
  Github,
  Search,
  Upload,
  Edit2,
  Grid,
  List,
  Download,
  Share2,
} from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import AvatarSelector from "../components/AvatarSelector";
import CommunityLayout from "../components/CommunityLayout";

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
  const { user, isAuthenticated } = useAuth0();
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState(
    "Creative professional with over 8 years of experience in digital design and art direction. Passionate about creating beautiful, functional designs that enhance user experience. Specialized in UI/UX design and brand identity."
  );
  const [selectedAvatar, setSelectedAvatar] = useState(
    localStorage.getItem("userAvatar") ||
      user?.picture ||
      "/avatars/avatar1.png"
  );
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || user?.name || "Guest"
  );
  const [stats, setStats] = useState<ProfileStats>(initialStats);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");

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
  };

  const handleSaveChanges = () => {
    setIsEditing(false);
    // Save changes to localStorage or a global state
    localStorage.setItem("userAvatar", selectedAvatar);
    localStorage.setItem("userName", userName);
  };

  return (
    <CommunityLayout>
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Simplified Header */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-8">
              <AvatarSelector
                user={user}
                selectedAvatar={selectedAvatar}
                setSelectedAvatar={setSelectedAvatar}
              />
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <h1 className="text-3xl font-bold text-gray-100">
                    {isAuthenticated && user ? userName : "Guest"}
                  </h1>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <Edit2 size={16} className="text-gray-400" />
                  </button>
                </div>
                <p className="text-gray-400 mt-2">{aboutText}</p>
                <div className="flex items-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Mail size={16} />
                    <span>
                      {isAuthenticated && user
                        ? user.email
                        : "guest@example.com"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Github size={16} />
                    <a
                      href="https://github.com/yourusername"
                      className="hover:text-blue-400"
                    >
                      @yourusername
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 mt-8">
              {Object.entries(stats).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-gray-700 rounded-lg p-4 text-center"
                >
                  <h3 className="text-2xl font-bold text-gray-100">{value}</h3>
                  <p className="text-gray-400 capitalize">{key}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Files Section */}
          <div className="bg-gray-800 rounded-lg">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-semibold text-gray-100">Files</h2>
                  <div className="flex items-center bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded ${
                        viewMode === "grid" ? "bg-gray-600" : ""
                      }`}
                    >
                      <Grid size={18} className="text-gray-400" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded ${
                        viewMode === "list" ? "bg-gray-600" : ""
                      }`}
                    >
                      <List size={18} className="text-gray-400" />
                    </button>
                  </div>
                  <select
                    onChange={(e) =>
                      setSortBy(e.target.value as "name" | "date" | "size")
                    }
                    className="bg-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="name">Sort by Name</option>
                    <option value="size">Sort by Size</option>
                  </select>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Search files..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Link to="/upload">
                    <button className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-white flex items-center space-x-2">
                      <Upload size={18} />
                      <span>Upload</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div
                className={`grid gap-4 ${
                  viewMode === "grid" ? "grid-cols-3" : "grid-cols-1"
                }`}
              >
                {filteredFolders.map((folder) => (
                  <div
                    key={folder.id}
                    className="bg-gray-750 rounded-lg p-4 hover:bg-gray-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-600 rounded-lg group-hover:bg-gray-650">
                          <Folder className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-100">
                              {folder.name}
                            </h3>
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                            <span>{folder.files} files</span>
                            <span>{folder.size}</span>
                            <span>
                              {new Date(
                                folder.lastModified
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button className="p-2 hover:bg-gray-600 rounded-full">
                          <Share2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-600 rounded-full">
                          <Download className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CommunityLayout>
  );
};

export default Profile;
