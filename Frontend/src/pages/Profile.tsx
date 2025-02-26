import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import type { Dataset } from "../types/dataset";

const Profile = () => {
  const { user } = useAuth();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;

      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(
          `http://localhost:5000/user-profile/${user.uid}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setDatasets(data.datasets || []);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      {/* Existing profile content */}

      {/* Datasets List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">My Datasets</h2>
          {datasets.length === 0 ? (
            <p className="text-gray-400">No datasets found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {datasets.map((dataset) => (
                <motion.div
                  key={dataset.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                >
                  <Link
                    to={`/datasets/${dataset.id}`}
                    className="block hover:no-underline"
                  >
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {dataset.name}
                    </h3>
                    <p className="text-gray-400 mb-4 line-clamp-2">
                      {dataset.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-400">{dataset.format}</span>
                      <span className="text-gray-500">
                        {new Date(dataset.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
