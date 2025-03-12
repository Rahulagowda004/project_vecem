import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Share2,
  Box,
  Database,
  FileType,
  Copy,
  Check,
  Code,
  ChevronRight,
  ExternalLink,
  ArrowLeft,
  Save,
  Upload,
  Image,
  Mic,
  Video,
  Trash2,
  AlertTriangle,
  Home,
  UserCircle2, // Add this import
  Settings, // Add this import
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext"; // Add this import at the top
import { toast } from "react-hot-toast";

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

const DatasetEdit = () => {
  const { user } = useAuth(); // Add this near the top of the component
  const { username, datasetname } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add domains array at the top of the component
  const domains = [
    "Health",
    "Education",
    "Automobile",
    "Finance",
    "Business",
    "Banking",
    "Retail",
    "Government",
    "Sports",
    "Social Media",
    "Entertainment",
    "Telecommunication",
    "Energy",
    "E-Commerce",
  ];

  // Add this right after the domains array
  const fileTypes = {
    Image: {
      label: "Image Files",
      extensions: ["jpg", "jpeg", "png", "gif", "webp", "heic"],
      icon: Image,
    },
    Audio: {
      label: "Audio Files",
      extensions: ["mp3", "wav", "ogg"],
      icon: Mic,
    },
    Text: {
      label: "Text Files",
      extensions: ["txt", "csv", "json", "pdf", "docx", "xlsx", "doc"],
      icon: FileType,
    },
    Video: {
      label: "Video Files",
      extensions: ["mp4", "webm", "ogg"],
      icon: Video,
    },
  };

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [datasetType, setDatasetType] = useState("Both");
  const [vectorizedSettings, setVectorizedSettings] = useState({
    dimensions: 768,
    vectorDatabase: "Pinecone",
  });
  const [domain, setDomain] = useState("");
  const [fileType, setFileType] = useState("");
  const [size, setSize] = useState({
    raw: "",
    vectorized: "",
  });
  const [overview, setOverview] = useState("");
  const [dataStructure, setDataStructure] = useState("");
  const [contents, setContents] = useState<string[]>([]);
  const [useCases, setUseCases] = useState<string[]>([]);
  const [fileSize, setFileSize] = useState<{ raw: number; vectorized: number }>(
    {
      raw: 0,
      vectorized: 0,
    }
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const totalSize = Array.from(files).reduce(
      (acc, file) => acc + file.size,
      0
    );
    setFileSize((prev) => ({
      ...prev,
      raw: totalSize,
    }));

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) clearInterval(interval);
    }, 500);
  };

  const [dataset, setDataset] = useState(null);

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        if (!user?.uid || !datasetname) {
          throw new Error("Missing required parameters");
        }

        setIsLoading(true);
        console.log("Fetching dataset:", datasetname);

        const response = await fetch(
          "http://127.0.0.1:5000/dataset-edit-click",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify({
              uid: user.uid,
              datasetName: datasetname,
            }),
          }
        );

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned non-JSON response");
        }

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Server Error:", errorData);
          throw new Error(errorData.detail || "Failed to fetch dataset");
        }

        const data = await response.json();
        if (!data || !data.dataset_info) {
          throw new Error("Invalid dataset response format");
        }

        setDataset(data);
        
        // Update form values with dataset information
        setName(data.dataset_info.name || datasetname);
        setDescription(data.dataset_info.description || "");
        setDatasetType(data.dataset_type || "Raw"); // Use the dataset_type from backend
        setDomain(data.dataset_info.domain || "");
        setFileType(data.dataset_info.file_type || "");

        // Update file availability state based on files information
        const hasRawFiles = data.files?.raw?.length > 0;
        const hasVectorizedFiles = data.files?.vectorized?.length > 0;
        
        setFileSize({
          raw: hasRawFiles ? 1 : 0,
          vectorized: hasVectorizedFiles ? 1 : 0
        });

        // Set vectorized settings if available
        if (data.vectorized_settings) {
          setVectorizedSettings({
            dimensions: data.vectorized_settings.dimensions || 768,
            vectorDatabase: data.vectorized_settings.vectorDatabase || "Pinecone",
            modelName: data.vectorized_settings.modelName || ""
          });
        }

      } catch (error) {
        console.error("Error fetching dataset:", error);
        toast.error(error instanceof Error ? error.message : "Failed to load dataset");
        navigate("/settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataset();
  }, [datasetname, user, navigate]);

  const handleSave = async () => {
    if (!dataset?._id) {
      toast.error("Dataset ID is missing");
      return;
    }

    setIsSaving(true);
    try {
      const requestData = {
        name,
        description,
        domain,
        fileType,
        datasetType,
        vectorizedSettings,
        userId: user?.uid // Add user ID to request
      };

      const response = await fetch(
        `http://127.0.0.1:5000/update-dataset/${dataset._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(requestData),
        }
      );

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server Error:", errorData);
        throw new Error(errorData.detail || "Failed to update dataset");
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success("Dataset updated successfully");
        setTimeout(() => {
          navigate(`/${username}/${datasetname}`);
        }, 1500);
      } else {
        throw new Error(result.message || "Failed to update dataset");
      }
    } catch (error) {
      console.error("Error updating dataset:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update dataset");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!dataset?._id) return;

    setIsDeleting(true);
    try {
      // Mark the dataset as deleted in the database
      const deleteResponse = await fetch(
        `http://127.0.0.1:5000/api/datasets/${dataset._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user?.uid,
            datasetName: name,
          }),
        }
      );

      if (!deleteResponse.ok) {
        const error = await deleteResponse.json();
        throw new Error(error.detail || "Failed to delete dataset");
      }

      // If marking as deleted was successful
      toast.success("Dataset deleted successfully");

      // Redirect to user profile after successful deletion
      setTimeout(() => {
        navigate(`/${username}`);
      }, 1500);
    } catch (error) {
      console.error("Error deleting dataset:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete dataset from database"
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const addListItem = (list: string[], setList: (items: string[]) => void) => {
    setList([...list, ""]);
  };

  const updateListItem = (
    index: number,
    value: string,
    list: string[],
    setList: (items: string[]) => void
  ) => {
    const newList = [...list];
    newList[index] = value;
    setList(newList);
  };

  const removeListItem = (
    index: number,
    list: string[],
    setList: (items: string[]) => void
  ) => {
    setList(list.filter((_, i) => i !== index));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Please log in to access this page.</div>
      </div>
    );
  }

  if (!datasetname || !username) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400">Invalid URL parameters</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-cyan-400">Loading dataset...</div>
      </div>
    );
  }

  const DeleteModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setShowDeleteModal(false)}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-red-500/20"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-500/10 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Delete Dataset
            </h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete this dataset? This action cannot
              be undone.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 rounded-lg bg-gray-700/50 text-gray-300 
              hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 
              hover:bg-red-500/20 border border-red-500/20 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "Deleting..." : "Delete Dataset"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  const getStatsCards = () => {
    const baseStats = [
      {
        label: "Dataset Type",
        value: datasetType,
        icon: Database,
        isReadOnly: true,
      },
      {
        label: "File Type",
        value: fileType,
        icon: FileType,
        isSelect: true,
        options: Object.entries(fileTypes).map(([type, data]) => ({
          value: type,
          label: data.label,
        })),
        setter: setFileType,
      },
      {
        label: "Domain",
        value: domain,
        icon: Box,
        isSelect: true,
        options: domains,
        setter: setDomain,
      },
    ];

    // Only add vectorized settings for Raw or Both types
    const vectorizedStats = datasetType !== "Vectorized" ? [
      {
        label: "Model Name",
        value: vectorizedSettings.modelName || "Not specified",
        icon: Code,
        isInput: true,
        setter: (value: string) => setVectorizedSettings(prev => ({ ...prev, modelName: value }))
      },
      {
        label: "Dimensions",
        value: vectorizedSettings.dimensions,
        icon: Box,
        isInput: true,
        type: "number",
        setter: (value: string) => setVectorizedSettings(prev => ({ ...prev, dimensions: parseInt(value) }))
      },
      {
        label: "Vector DB",
        value: vectorizedSettings.vectorDatabase,
        icon: Database,
        isInput: true,
        setter: (value: string) => setVectorizedSettings(prev => ({ ...prev, vectorDatabase: value }))
      }
    ] : [];

    return [...baseStats, ...vectorizedStats];
  };

  const renderRightColumn = () => (
    <motion.div variants={fadeIn} className="space-y-6">
      {/* Upload Section - Only show for Raw or Vectorized types */}
      {datasetType !== "Both" ? (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              {datasetType === "Raw" ? "Add Vectorized Data" : "Add Raw Data"}
            </h2>
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-sm border border-cyan-500/20">
              {datasetType === "Raw" ? "Vectorization" : "Raw Data"}
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            {datasetType === "Raw" 
              ? "Convert your raw data into vector embeddings for advanced search capabilities."
              : "Add the original raw data to complement your vectorized dataset."
            }
          </p>

          <div className="space-y-4">
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="w-full px-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600 
                  focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/40 outline-none transition
                  text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 
                  file:text-sm file:font-medium file:bg-cyan-600 file:text-white 
                  hover:file:bg-cyan-700 file:transition-colors"
                multiple
                directory=""
                webkitdirectory=""
                accept={datasetType === "Raw" 
                  ? undefined // For vectorized uploads, accept all files
                  : fileTypes[fileType]?.extensions.map(ext => `.${ext}`).join(',')} // For raw uploads, restrict by file type
              />
              <Upload className="absolute right-3 top-2.5 text-cyan-400 w-5 h-5" />
            </div>

            {uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Upload Progress</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-cyan-400" />
            <span className="text-gray-400">
              This dataset already contains both raw and vectorized files
            </span>
          </div>
        </div>
      )}

      {/* Dataset Status Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Dataset Status</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Raw Data</span>
            <span className={fileSize.raw > 0 ? "text-green-400" : "text-gray-500"}>
              {fileSize.raw > 0 ? "Available" : "Not Available"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Vectorized Data</span>
            <span className={fileSize.vectorized > 0 ? "text-green-400" : "text-gray-500"}>
              {fileSize.vectorized > 0 ? "Available" : "Not Available"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0f1829] to-gray-900">
      {/* Breadcrumb Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-4 bg-gray-900/90 border-b border-cyan-500/10 backdrop-blur-sm"
      >
        <nav className="flex items-center space-x-2 text-sm">
          <Link
            to={`/settings`}
            className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <Settings className="w-4 h-4" /> {/* Add this icon */}
            Settings
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-600" />
          <span className="text-cyan-400">Edit</span>
        </nav>
      </motion.div>

      {/* Header Section - Updated */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 py-6"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <motion.div className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-4xl font-bold bg-transparent text-white outline-none w-full max-w-2xl"
                placeholder="Dataset Name"
              />
              <div className="flex flex-wrap gap-2">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-1.5 bg-cyan-900/40 text-cyan-400 border border-cyan-700/50 rounded-full text-sm"
                >
                  {domain || "Select Domain"}
                </motion.span>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-1.5 bg-cyan-900/40 text-cyan-400 border border-cyan-700/50 rounded-full text-sm"
                >
                  {fileType || "Select Type"}
                </motion.span>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-1.5 bg-cyan-900/40 text-cyan-400 border border-cyan-700/50 rounded-full text-sm"
                >
                  {datasetType}
                </motion.span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div className="flex flex-wrap gap-3 w-full md:w-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 md:flex-none px-6 py-2.5 bg-cyan-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-600/20"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDeleteModal(true)}
                className="flex-1 md:flex-none px-6 py-2.5 bg-red-500/10 text-red-400 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-red-500/20 border border-red-500/20 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Delete Dataset
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="max-w-6xl mx-auto px-4 py-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <motion.div className="lg:col-span-2 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {getStatsCards().map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={fadeIn}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-cyan-700/50 transition-colors shadow-xl"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <stat.icon className="w-5 h-5 text-cyan-400" />
                    <div className="text-sm font-medium text-cyan-200">{stat.label}</div>
                  </div>
                  {stat.isReadOnly ? (
                    <div className="text-lg font-semibold text-white">
                      {stat.value} data
                    </div>
                  ) : stat.isSelect ? (
                    <select
                      value={stat.value}
                      onChange={(e) => stat.setter(e.target.value)}
                      className="w-full bg-gray-900/50 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-cyan-500 outline-none"
                    >
                      <option value="">Select {stat.label}</option>
                      {Array.isArray(stat.options)
                        ? stat.options.map((option) => (
                            <option
                              key={typeof option === "string" ? option : option.value}
                              value={typeof option === "string" ? option : option.value}
                            >
                              {typeof option === "string" ? option : option.label}
                            </option>
                          ))
                        : null}
                    </select>
                  ) : stat.isInput ? (
                    <input
                      type={stat.type || "text"}
                      value={stat.value}
                      onChange={(e) => stat.setter(e.target.value)}
                      className="w-full bg-gray-900/50 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-cyan-500 outline-none"
                      placeholder={`Enter ${stat.label.toLowerCase()}`}
                    />
                  ) : null}
                </motion.div>
              ))}
            </div>

            {/* Description Section */}
            <motion.div
              variants={fadeIn}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 shadow-xl"
            >
              <h2 className="text-2xl font-semibold text-white mb-6">
                About This Dataset
              </h2>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full bg-gray-900/50 text-white rounded-lg p-4 border border-gray-700 
                  focus:border-cyan-500 outline-none text-lg leading-relaxed
                  font-medium resize-none ${
                    datasetType.toLowerCase() === "raw" ? "min-h-[230px]" : "min-h-[100px]"
                  }`}
                placeholder="Enter detailed dataset description"
              />
            </motion.div>
          </motion.div>

          {/* Right Column - Settings */}
          {renderRightColumn()}
        </div>
      </motion.div>
      <AnimatePresence>{showDeleteModal && <DeleteModal />}</AnimatePresence>
    </div>
  );
};

export default DatasetEdit;
