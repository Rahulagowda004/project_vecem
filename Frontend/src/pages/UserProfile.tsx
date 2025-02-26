import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Add useNavigate
import { motion } from "framer-motion";
import { Upload } from "lucide-react"; // Add Upload icon

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate(); // Add navigate
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("latest");

  // If no username is provided, it means it's the current user's profile
  const isOwnProfile = !username;

  // Use the username parameter to fetch the correct user's data
  useEffect(() => {
    if (username) {
      // Fetch user data based on username
      console.log(`Fetching profile for user: ${username}`);
    } else {
      // Fetch current user's profile
      console.log('Fetching own profile');
    }
  }, [username]);

  // Mock user data
  const user = {
    id: username,
    name: "John Doe",
    username: "@johndoe",
    githubUrl: "https://github.com/johndoe",
    bio: "Researcher in medical imaging and AI.",
    profilePicture: "/path/to/profile-picture.jpg",
    datasets: [
      {
        id: "1",
        name: "Medical Imaging Dataset",
        description: "Collection of medical imaging data for AI training",
        dataType: "both", // can be "raw", "vectorized", or "both"
      },
      {
        id: "1",
        name: "Medical Imaging Dataset",
        description: "Collection of medical imaging data for AI training",
      },
      {
        id: "2",
        name: "Medical Imaging Dataset",
        description: "Collection of medical imaging data for AI training",
      },
      {
        id: "1",
        name: "Medical Imaging Dataset",
        description: "Collection of medical imaging data for AI training",
      },
      {
        id: "1",
        name: "Medical Imaging Dataset",
        description: "Collection of medical imaging data for AI training",
      },
      // ...other datasets
    ],
  };

  // Filter and sort datasets
  const filteredAndSortedDatasets = useMemo(() => {
    let result = [...user.datasets];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(dataset => 
        dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dataset.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "size":
        // Assuming we add a size property later
        break;
      case "latest":
      default:
        // Assuming the current order is latest
        break;
    }
    
    return result;
  }, [user.datasets, searchQuery, sortOption]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
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
              src={user.profilePicture}
              alt="Profile"
              className="w-48 h-48 rounded-full border-4 border-gray-800 shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-shadow duration-300"
            />
          </motion.div>
          
          <div className="flex-grow">
            <motion.div 
              className="bg-gray-800 rounded-lg p-6 shadow-md border border-gray-700 hover:border-cyan-700 transition-colors duration-300"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                  <motion.h1 
                    className="text-3xl font-bold text-cyan-400 hover:text-cyan-300 transition-colors duration-300"
                    whileHover={{ scale: 1.02 }}
                  >
                    {user.name}
                  </motion.h1>
                  <p className="text-gray-400 text-lg font-medium">{user.username}</p>
                </div>
                <motion.span 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-900/50 text-cyan-200 border border-cyan-700"
                  whileHover={{ scale: 1.05 }}
                >
                  Active
                </motion.span>
              </div>
              
              <motion.p 
                className="text-gray-300 text-lg mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {user.bio}
              </motion.p>

              <motion.a
                href={user.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-cyan-300 hover:text-cyan-200 transition-all duration-300 shadow-lg hover:shadow-cyan-900/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                View GitHub Profile
              </motion.a>
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
                  <h2 className="text-2xl font-bold text-gray-100">
                    Datasets
                  </h2>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20"
                  >
                    <span className="text-cyan-400 font-medium">
                      {user.datasets.length}
                    </span>
                  </motion.div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/upload')}
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
                    <svg className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
              {filteredAndSortedDatasets.map((dataset) => (
                <motion.li
                  key={dataset.id}
                  variants={item}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(`/datasets/${dataset.id}`)}
                  className="group relative bg-gray-750/50 rounded-lg p-5 border border-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer"
                >
                  <h3 className="text-lg font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300 mb-3">
                    {dataset.name}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {dataset.description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
                      </svg>
                      {dataset.dataType === 'both' ? 'Raw + Vectorized' :
                       dataset.dataType === 'raw' ? 'Raw Data' :
                       'Vectorized Data'}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                      </svg>
                      Uploaded Jan 15, 2024
                    </span>
                  </div>
                </motion.li>
              ))}
            </motion.ul>

            {/* Show pagination only if there are datasets */}
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
                    <span className="text-gray-400">...</span>
                    <button className="px-3 py-1 rounded-lg hover:bg-gray-700 text-gray-400">10</button>
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
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;
