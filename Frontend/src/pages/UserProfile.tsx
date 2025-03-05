import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import {
  getUserProfile,
  getUserProfileByUsername,
  getUserData,
} from "../services/userService";
import type { UserProfileData } from "../services/userService";
import { useAuth } from "../contexts/AuthContext";
import NavbarPro from "../components/NavbarPro";
import { getUserDisplayName, getUserUsername } from "../utils/userManagement";

interface UserProfileData {
  uid: string;
  name: string;
  username: string;
  bio?: string;
  profilePicture?: string;
  githubUrl?: string;
  datasets: {
    id: string;
    name: string;
    description: string;
    upload_type: string;
    uploadedAt: string;
    updatedAt: string;
    timestamp: string;
  }[];
}

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("latest");
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!username) {
          throw new Error("Username is required");
        }

        // Get profile data by username
        const profileData = await getUserProfileByUsername(username);
        console.log("Profile data received:", profileData); // Debug log

        if (!profileData) {
          throw new Error("Profile not found");
        }

        // Set the name to display name from profile or getUserDisplayName as fallback
        const displayName = profileData.name || getUserDisplayName(user);

        // Ensure datasets array exists
        const processedData = {
          ...profileData,
          name: displayName,
          datasets: profileData.datasets.map(dataset => ({
            ...dataset,
            uploadedAt: formatDate(dataset.timestamp),
            updatedAt: formatDate(dataset.updatedAt || dataset.timestamp || new Date().toISOString()) // Ensure updatedAt is also formatted
          })) || [],
        };

        setUserData(processedData);
      } catch (err) {
        console.error("Error in fetchUserData:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserData();
    }
  }, [username, user]);

  // Filter and sort datasets
  const filteredAndSortedDatasets = useMemo(() => {
    if (!userData?.datasets) return [];

    let result = [...userData.datasets];

    if (searchQuery) {
      result = result.filter(
        (dataset) =>
          dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dataset.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (sortOption) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "latest":
      default:
        result.sort(
          (a, b) =>
            new Date(b.updatedAt || 0).getTime() -
            new Date(a.updatedAt || 0).getTime()
        );
        break;
    }

    return result;
  }, [userData?.datasets, searchQuery, sortOption]);

  const paginatedDatasets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedDatasets.slice(startIndex, endIndex);
  }, [filteredAndSortedDatasets, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedDatasets.length / itemsPerPage);

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handleDatasetClick = async (datasetId: string, datasetName: string) => {
    try {
      // Log the click to backend
      const response = await fetch("http://127.0.0.1:5000/dataset-click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: userData?.uid,
          datasetName: datasetName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to log dataset click");
      }

      // Navigate using new URL pattern
      navigate(`/${username}/${datasetName}`);
    } catch (error) {
      console.error("Error logging dataset click:", error);
      // Still navigate even if logging fails
      navigate(`/${username}/${datasetName}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-cyan-400">Loading profile...</div>
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

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Profile not found</div>
      </div>
    );
  }

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
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <NavbarPro />
      <div className="max-w-5xl mx-auto px-4 py-8 pt-24">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row gap-6"
        >
          <motion.div
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img
              src={userData.profilePicture || "/default-avatar.png"}
              alt="Profile"
              className="w-48 h-48 rounded-full border-4 border-gray-800 shadow-[0_0_15px_rgba(0,255,255,0.1)]"
            />
          </motion.div>

          <div className="flex-grow">
            <motion.div className="bg-gray-800 rounded-lg p-6 shadow-md border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold text-cyan-400">
                    {userData.name}
                  </h1>
                  <p className="text-gray-400 text-lg font-medium">
                    @{userData.username}
                  </p>
                </div>
              </div>

              <p className="text-gray-300 text-lg mb-4">
                {userData.bio || "No bio provided"}
              </p>

              {userData.githubUrl && (
                <motion.a
                  href={userData.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-cyan-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  View GitHub Profile
                </motion.a>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Datasets Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700">
            <div className="border-b border-gray-700/50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold text-gray-100">Datasets</h2>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20"
                  >
                    <span className="text-cyan-400 font-medium">
                      {userData.datasets.length}
                    </span>
                  </motion.div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/upload")}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg 
                    hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-600/20"
                >
                  <Upload size={18} />
                  Upload Dataset
                </motion.button>
              </div>
            </div>

            {/* Dataset Filters and Search */}
            <div className="p-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search datasets..."
                      className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-cyan-500 w-64"
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
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-gray-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="latest">Sort by: Latest</option>
                    <option value="name">Sort by: Name</option>
                    <option value="size">Sort by: Size</option>
                  </select>
                </div>
                {searchQuery && (
                  <div className="text-gray-400">
                    Found {filteredAndSortedDatasets.length} results
                  </div>
                )}
              </div>
            </div>

            {/* Dataset Grid */}
            <motion.ul
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6"
            >
              {paginatedDatasets.map((dataset) => (
                <motion.li
                  key={dataset.id}
                  variants={item}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleDatasetClick(dataset.id, dataset.name)}
                  className="group relative bg-gray-750/50 rounded-lg p-5 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer"
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
                      {dataset.upload_type || "Unknown Type"}
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
                      {new Date(dataset.updatedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </motion.li>
              ))}
            </motion.ul>

            {/* Show pagination only if there are datasets */}
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
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;
