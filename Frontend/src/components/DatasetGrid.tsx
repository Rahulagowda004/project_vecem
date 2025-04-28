import React, { useState, useEffect } from "react";
import {
  FileText,
  Image,
  Music,
  Video,
  ChevronDown,
  Database,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUserProfileByUid } from "../services/userService";

interface Dataset {
  id: string; // Changed from number to string
  name: string;
  type: string;
  files: {
    // Added files property
    raw: string[];
    vectorized: string[];
  };
  lastModified: string;
  icon: React.ElementType;
  description: string;
  datasetType: "raw" | "vectorized";
  domain: string;
  username?: string; // Make username optional since we'll fetch it
  uid: string; // Added uid
}

interface DatasetGridProps {
  searchQuery: string;
  category: string;
  datasets: any[];
}

const getIconForType = (fileType: string) => {
  switch (fileType.toLowerCase()) {
    case "audio":
      return Music;
    case "image":
      return Image;
    case "video":
      return Video;
    case "text":
      return FileText;
    default:
      return FileText;
  }
};

const DatasetGrid = ({ searchQuery, category, datasets }: DatasetGridProps) => {
  const [selectedDataset, setSelectedDataset] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usernameCache, setUsernameCache] = useState<Record<string, string>>(
    {}
  );
  const navigate = useNavigate();

  const fetchUsername = async (uid: string) => {
    if (usernameCache[uid]) return usernameCache[uid];

    try {
      const userProfile = await getUserProfileByUid(uid);
      if (userProfile?.username) {
        setUsernameCache((prev) => ({
          ...prev,
          [uid]: userProfile.username,
        }));
        return userProfile.username;
      }
    } catch (error) {
      console.error("Error fetching username:", error);
    }
    return "Unknown User";
  };

  useEffect(() => {
    // Fetch usernames for all datasets that don't have them cached
    const fetchMissingUsernames = async () => {
      const uniqueUids = [...new Set(processedDatasets.map((d) => d.uid))];
      const missingUids = uniqueUids.filter((uid) => !usernameCache[uid]);

      await Promise.all(missingUids.map(fetchUsername));
    };

    fetchMissingUsernames();
  }, [datasets]);

  const processedDatasets = datasets.map((dataset) => ({
    id: dataset.dataset_id,
    name: dataset.dataset_info.name,
    type: dataset.dataset_info.file_type,
    files: dataset.files,
    lastModified: dataset.timestamp,
    icon: getIconForType(dataset.dataset_info.file_type),
    description: dataset.dataset_info.description,
    datasetType: dataset.upload_type,
    domain: dataset.dataset_info.domain,
    username: usernameCache[dataset.uid] || "Loading...",
    uid: dataset.uid,
  }));

  const filteredDatasets = processedDatasets.filter((dataset) => {
    const searchTerm = searchQuery.toLowerCase();
    const matchesSearch =
      dataset.name.toLowerCase().includes(searchTerm) ||
      dataset.domain.toLowerCase().includes(searchTerm);
    const matchesCategory = category === "all" || dataset.type === category;
    return matchesSearch && matchesCategory;
  });

  const handleDatasetClick = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        {filteredDatasets.length === 0 ? (
          <div className="col-span-full">
            <div className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <Database className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-500 mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-300 mb-1 sm:mb-2">
                No Datasets Found
              </h3>
              <p className="text-sm sm:text-base text-gray-500 text-center">
                {searchQuery
                  ? `No datasets found matching "${searchQuery}"`
                  : category !== "all"
                  ? `No ${category} datasets available`
                  : "There are no datasets available at the moment"}
              </p>
            </div>
          </div>
        ) : (
          filteredDatasets.slice(0, 12).map((dataset) => {
            const Icon = dataset.icon;
            return (
              <div
                key={dataset.id}
                onClick={() => handleDatasetClick(dataset)}
                className="group relative bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 sm:p-4 
                  hover:bg-gray-700/50 transition-all duration-300 cursor-pointer 
                  border border-gray-700/50 hover:border-cyan-500/30 shadow-lg 
                  hover:shadow-cyan-500/10 h-[180px] sm:h-[200px] flex flex-col justify-between"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative flex flex-col h-full">
                  <div className="flex items-start space-x-3 sm:space-x-4 mb-2 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-gray-900/50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-medium text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                        {dataset.name}
                      </h3>
                      <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2 flex-wrap">
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded-full bg-cyan-500/10 text-cyan-400 font-medium">
                          {dataset.datasetType}
                        </span>
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded-full bg-gray-700/50 text-gray-400">
                          {dataset.domain}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-400 text-xs sm:text-sm line-clamp-3 mb-2 sm:mb-4">
                    {dataset.description}
                  </p>

                  <div className="mt-auto text-xs sm:text-sm text-gray-400 flex items-center">
                    <span className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400" />
                      {dataset.type}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dataset Details Modal */}
      {isModalOpen && selectedDataset && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 transition-opacity duration-300">
          <div
            className="bg-gray-900/90 rounded-xl sm:rounded-2xl max-w-2xl w-full p-4 sm:p-6 md:p-8 relative border border-gray-800 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 p-1.5 sm:p-2 rounded-full bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6 md:mb-8 pt-2">
              <div className="p-3 sm:p-4 bg-gray-800/50 rounded-lg sm:rounded-xl">
                {React.createElement(selectedDataset.icon, {
                  className: "h-6 w-6 sm:h-8 sm:w-8 text-cyan-400",
                })}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  {selectedDataset.name}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-cyan-500/10 text-cyan-400 font-medium">
                    {selectedDataset.datasetType}
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-800/50 text-gray-400">
                    {selectedDataset.domain}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="p-3 sm:p-4 bg-gray-800/30 rounded-lg sm:rounded-xl">
                <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                  Description
                </h3>
                <div className="max-h-16 sm:max-h-24 overflow-y-auto custom-scrollbar">
                  <p className="text-sm sm:text-base text-gray-400 leading-relaxed text-justify pr-4">
                    {selectedDataset.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-gray-800/30 rounded-lg sm:rounded-xl">
                  <h3 className="text-base sm:text-lg font-medium text-white mb-2 sm:mb-3">
                    Details
                  </h3>
                  <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                    {[
                      { label: "Type", value: selectedDataset.type },
                      {
                        label: "Dataset Type",
                        value: selectedDataset.datasetType,
                      },
                      { label: "Domain", value: selectedDataset.domain },
                      {
                        label: "Last Modified",
                        value: new Date(
                          selectedDataset.lastModified
                        ).toLocaleDateString(),
                      },
                    ].map(({ label, value }) => (
                      <li
                        key={label}
                        className="flex justify-between items-center"
                      >
                        <span className="text-gray-400">{label}</span>
                        <span className="text-cyan-400 font-medium">
                          {value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 sm:p-4 bg-gray-800/30 rounded-lg sm:rounded-xl flex flex-col h-full">
                  <h3 className="text-base sm:text-lg font-medium text-white mb-2 sm:mb-4">
                    Uploaded by
                  </h3>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex flex-col p-2 bg-gray-800/30 rounded-lg">
                      <button
                        onClick={() => {
                          setIsModalOpen(false);
                          navigate(`/${selectedDataset.username}/view`);
                        }}
                        className="text-left text-gray-300 font-medium hover:text-cyan-400 transition-colors text-sm sm:text-base"
                      >
                        {selectedDataset.username || "Unknown User"}
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        navigate(
                          `/${selectedDataset.username}/${selectedDataset.name}`,
                          {
                            state: { from: "home" },
                          }
                        );
                      }}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 mt-3 sm:mt-4 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors font-medium text-sm sm:text-base"
                    >
                      View Dataset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(31, 41, 55, 0.5);
    border-radius: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(6, 182, 212, 0.3);
    border-radius: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(6, 182, 212, 0.5);
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default DatasetGrid;
