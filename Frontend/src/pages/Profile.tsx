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
import { useAuth0 } from "@auth0/auth0-react";
import AvatarSelector from "../components/AvatarSelector";
import { profileService, ProfileData } from "../services/profileService";

const Profile = () => {
  const { user, isAuthenticated } = useAuth0();
  const [searchTerm, setSearchTerm] = useState("");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(
    localStorage.getItem("userAvatar") ||
    user?.picture ||
    "/avatars/avatar1.png"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const data = await profileService.getProfileData();
        setProfileData(data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  const sortedFolders = profileData?.folders.sort((a, b) => {
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
  }) || [];

  const filteredFolders = sortedFolders.filter((folder) =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-8">
            <AvatarSelector
              user={user}
              selectedAvatar={selectedAvatar}
              setSelectedAvatar={setSelectedAvatar}
            />
            <div className="flex-1">
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-gray-100">
                  {isAuthenticated && user ? user.name : "Guest"}
                </h1>
                <span className="text-gray-400 text-sm mt-1">@{user?.nickname || 'username'}</span>
              </div>
              <p className="text-gray-400 mt-2">{profileData?.about}</p>
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

          <div className="grid grid-cols-4 gap-4 mt-8">
            {Object.entries(profileData?.stats || {}).map(([key, value]) => (
              <div key={key} className="bg-gray-700 rounded-lg p-4 text-center">
                <h3 className="text-2xl font-bold text-gray-100">{value}</h3>
                <p className="text-gray-400 capitalize">{key}</p>
              </div>
            ))}
          </div>
        </div>

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
                            {new Date(folder.lastModified).toLocaleDateString()}
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
  );
};

export default Profile;

