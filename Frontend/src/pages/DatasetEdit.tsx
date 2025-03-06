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
          throw new Error("Missing user ID or dataset name");
        }

        setIsLoading(true);
        const response = await fetch(
          "http://127.0.0.1:5000/dataset-edit-click",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              uid: user.uid,
              datasetName: datasetname,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to fetch dataset");
        }

        const data = await response.json();
        console.log("Fetched dataset:", data); // Debug log
        setDataset(data);

        // Set form values from dataset
        setName(data.dataset_info.name);
        setDescription(data.dataset_info.description || "");
        setDatasetType(data.upload_type);
        setDomain(data.dataset_info.domain);
        setFileType(data.dataset_info.file_type);
        if (data.vectorized_settings) {
          setVectorizedSettings(data.vectorized_settings);
        }
      } catch (error) {
        console.error("Error fetching dataset:", error);
        toast.error("Failed to load dataset information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataset();
  }, [datasetname, user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!dataset?._id) {
        throw new Error("No dataset ID found");
      }

      const response = await fetch(
        `http://127.0.0.1:5000/update-dataset/${dataset._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            domain,
            fileType,
            datasetType,
            vectorizedSettings,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update dataset");
      }

      navigate(`/${username}/${name}`);
    } catch (error) {
      console.error("Error saving dataset:", error);
      // Add error handling UI here
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!dataset?._id) return;

    setIsDeleting(true);
    try {
      // First, delete from MongoDB and Azure Blob Storage
      const deleteResponse = await fetch(
        `http://127.0.0.1:5000/api/datasets/${dataset._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user?.uid,
            datasetName: name
          })
        }
      );

      if (!deleteResponse.ok) {
        const error = await deleteResponse.json();
        throw new Error(error.detail || "Failed to delete dataset");
      }

      // If MongoDB deletion was successful
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
            <h3 className="text-xl font-semibold text-white mb-2">Delete Dataset</h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete this dataset? This action cannot be undone.
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

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Breadcrumb Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-2 bg-gray-900/80 border-b border-cyan-500/10"
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

      {/* Sticky Header - Remove old breadcrumb */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800"
      >
        <div className="max-w-6xl mx-auto px-4">
          {/* Title and Actions */}
          <div className="py-4 flex justify-between items-start">
            <motion.div
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              className="space-y-2"
            >
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-3xl font-bold bg-transparent text-white outline-none w-full max-w-2xl"
                placeholder="Dataset Name"
              />
              <div className="flex gap-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1 bg-cyan-900/40 text-cyan-400 border border-cyan-700/50 rounded-full text-sm"
                >
                  {domain || "Select Domain"}
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1 bg-cyan-900/40 text-cyan-400 border border-cyan-700/50 rounded-full text-sm"
                >
                  {fileType || "Select Type"}
                </motion.div>
              </div>
            </motion.div>
            <motion.div
              initial={{ x: 20 }}
              animate={{ x: 0 }}
              className="flex gap-2"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-medium flex items-center gap-2 
                  hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-600/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg font-medium flex items-center gap-2 
                  hover:bg-red-500/20 border border-red-500/20 transition-all"
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            variants={{
              initial: { opacity: 0 },
              animate: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6">
              {[
                {
                  label: "Size",
                  value: `Raw: ${formatFileSize(fileSize.raw)}${
                    fileSize.vectorized
                      ? `\nVectorized: ${formatFileSize(fileSize.vectorized)}`
                      : ""
                  }`,
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
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700 min-h-[120px] flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2">
                    <stat.icon className="w-5 h-5 text-cyan-400" />
                    <div className="text-sm font-medium text-cyan-200">{stat.label}</div>
                  </div>
                  <div className="flex-1 flex items-center mt-5"> {/* Increase margin-top to add more space */}
                    {stat.isReadOnly ? (
                      <div className="text-white whitespace-pre-line text-lg font-medium">
                        {stat.value}
                      </div>
                    ) : stat.isSelect ? (
                      <select
                        value={stat.value}
                        onChange={(e) => stat.setter(e.target.value)}
                        className="w-full bg-gray-900/50 text-white rounded-lg px-4 py-3 border border-gray-700 
                          focus:border-cyan-500 outline-none text-lg font-medium"
                      >
                        <option value="">Select {stat.label}</option>
                        {Array.isArray(stat.options)
                          ? stat.options.map((option) => (
                              <option
                                key={
                                  typeof option === "string"
                                    ? option
                                    : option.value
                                }
                                value={
                                  typeof option === "string"
                                    ? option
                                    : option.value
                                }
                                className="py-2"
                              >
                                {typeof option === "string"
                                  ? option
                                  : option.label}
                              </option>
                            ))
                          : null}
                      </select>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            {/* About Section */}
            <motion.div
              variants={fadeIn}
              className="bg-gray-800 rounded-lg p-8 border border-gray-700 shadow-xl mt-8" // Increased padding and margin
            >
              <h2 className="text-xl font-semibold text-white mb-6">
                About This Dataset
              </h2>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-900/50 text-white rounded-lg p-4 border border-gray-700 
                  focus:border-cyan-500 outline-none text-lg leading-relaxed min-h-[282px]
                  font-medium resize-none"
                placeholder="Enter detailed dataset description"
              />
            </motion.div>
          </motion.div>
          {/* Sidebar */}
          <motion.div variants={fadeIn} className="space-y-6">
            {/* File Upload Section */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4">
                Update Files
              </h2>
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
            {/* Dataset Type */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4">
                Dataset Type
              </h2>
              <select
                value={datasetType}
                onChange={(e) => setDatasetType(e.target.value)}
                className="w-full bg-gray-900/50 text-white rounded-lg p-2 border border-gray-700 
                  focus:border-cyan-500 outline-none"
              >
                <option value="Raw">Raw</option>
                <option value="Vectorized">Vectorized</option>
                <option value="Both">Both</option>
              </select>
            </div>
            {/* Vectorized Settings */}
            {(datasetType === "Vectorized" || datasetType === "Both") && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Vectorized Settings
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-cyan-200 mb-1 block">
                      Dimensions
                    </label>
                    <input
                      type="number"
                      value={vectorizedSettings.dimensions}
                      onChange={(e) =>
                        setVectorizedSettings({
                          ...vectorizedSettings,
                          dimensions: parseInt(e.target.value),
                        })
                      }
                      className="w-full bg-gray-900/50 text-white rounded-lg p-2 border border-gray-700 
                        focus:border-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-cyan-200 mb-1 block">
                      Vector Database
                    </label>
                    <input
                      type="text"
                      value={vectorizedSettings.vectorDatabase}
                      onChange={(e) =>
                        setVectorizedSettings({
                          ...vectorizedSettings,
                          vectorDatabase: e.target.value,
                        })
                      }
                      className="w-full bg-gray-900/50 text-white rounded-lg p-2 border border-gray-700 
                        focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
      <AnimatePresence>
        {showDeleteModal && <DeleteModal />}
      </AnimatePresence>
    </div>
  );
};

export default DatasetEdit;
