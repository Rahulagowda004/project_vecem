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
  LucideIcon, // Add LucideIcon type
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext"; // Add this import at the top
import { toast } from "react-hot-toast";
import {
  fetchDatasetForEdit,
  updateDataset,
  deleteDataset,
  uploadDatasetFiles,
  Dataset,
} from "../services/datasetEditService";

// Add DirectoryInputElement interface
interface DirectoryInputElement extends HTMLInputElement {
  webkitdirectory: boolean;
  directory?: string;
  mozdirectory?: string;
}

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

const DatasetEdit = () => {
  const { user } = useAuth();
  const { username, datasetname } = useParams();
  const navigate = useNavigate();

  // File input refs
  const rawInputRef = useRef<DirectoryInputElement>(null);
  const vectorizedInputRef = useRef<DirectoryInputElement>(null);

  // All state declarations consolidated at the top
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{
    files: FileList | null;
    type: "raw" | "vectorized";
  } | null>(null);

  const [uploadStatus, setUploadStatus] = useState<{
    show: boolean;
    success: boolean;
    message: string;
  }>({ show: false, success: false, message: "" });

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [datasetType, setDatasetType] = useState("Both");
  const [vectorizedSettings, setVectorizedSettings] = useState({
    dimensions: 768,
    vectorDatabase: "Pinecone",
    modelName: "",
  });
  const [domain, setDomain] = useState("");
  const [fileType, setFileType] = useState("");
  const [size, setSize] = useState({ raw: "", vectorized: "" });
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
  const [dataset, setDataset] = useState<Dataset | null>(null);

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        if (!user?.uid || !datasetname) {
          throw new Error("Missing required parameters");
        }

        setIsLoading(true);
        const data = await fetchDatasetForEdit(user.uid, datasetname);

        setDataset(data);
        setName(data.dataset_info.name || datasetname);
        setDescription(data.dataset_info.description || "");
        setDatasetType(data.dataset_type || "Raw");
        setDomain(data.dataset_info.domain || "");
        setFileType(data.dataset_info.file_type || "");

        const hasRawFiles = data.files?.raw?.length > 0;
        const hasVectorizedFiles = data.files?.vectorized?.length > 0;

        setFileSize({
          raw: hasRawFiles ? 1 : 0,
          vectorized: hasVectorizedFiles ? 1 : 0,
        });

        if (data.vectorized_settings) {
          setVectorizedSettings({
            dimensions: data.vectorized_settings.dimensions || 768,
            vectorDatabase:
              data.vectorized_settings.vectorDatabase || "Pinecone",
            modelName: data.vectorized_settings.modelName || "",
          });
        }
      } catch (error) {
        console.error("Error fetching dataset:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to load dataset"
        );
        navigate("/settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDataset();
  }, [datasetname, user, navigate]);

  // Add StatusMessage component
  const StatusMessage = () => {
    if (!uploadStatus.show) return null;

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div
          className={`p-8 rounded-xl ${
            uploadStatus.success ? "bg-green-800/90" : "bg-red-800/90"
          } shadow-lg max-w-md mx-4 text-center transform transition-all duration-300 scale-100`}
        >
          <div
            className={`text-6xl mb-4 ${
              uploadStatus.success ? "text-green-400" : "text-red-400"
            }`}
          >
            {uploadStatus.success ? "✓" : "✕"}
          </div>
          <h3 className="text-2xl font-semibold mb-2 text-white">
            {uploadStatus.success ? "Success!" : "Save Failed"}
          </h3>
          <p className="text-lg text-gray-200">{uploadStatus.message}</p>
          {uploadStatus.success && (
            <p className="text-sm text-gray-300 mt-4">
              Redirecting to dataset page...
            </p>
          )}
        </div>
      </div>
    );
  };

  // Update handleSave function
  const handleSave = async () => {
    if (!dataset?._id) {
      setUploadStatus({
        show: true,
        success: false,
        message: "Dataset ID is missing",
      });
      return;
    }

    setIsSaving(true);
    setUploadStatus({ show: false, success: false, message: "" });

    try {
      const requestData = {
        name,
        description,
        domain,
        fileType,
        datasetType,
        vectorizedSettings: {
          dimensions: vectorizedSettings.dimensions,
          vectorDatabase: vectorizedSettings.vectorDatabase,
          modelName: vectorizedSettings.modelName,
        },
      };

      await updateDataset(dataset._id, user?.uid!, requestData);

      setUploadStatus({
        show: true,
        success: true,
        message: "Dataset updated successfully!",
      });

      setTimeout(() => {
        navigate(`/${username}/${name}`);
      }, 2000);
    } catch (error) {
      console.error("Error updating dataset:", error);
      setUploadStatus({
        show: true,
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update dataset",
      });

      setTimeout(() => {
        setUploadStatus({ show: false, success: false, message: "" });
      }, 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!dataset?._id) return;

    setIsDeleting(true);
    try {
      await deleteDataset(dataset._id, user?.uid!, name);
      toast.success("Dataset deleted successfully");

      setTimeout(() => {
        navigate("/settings");
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

  // Define the interface for stats card items
  interface StatCard {
    label: string;
    value: string | number;
    icon: LucideIcon;
    isReadOnly?: boolean;
    isSelect?: boolean;
    isInput?: boolean;
    isDisabled?: boolean;
    options?: string[];
    setter?: (value: string) => void;
    type?: string;
  }

  const getStatsCards = () => {
    const baseStats: StatCard[] = [
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
        isReadOnly: true,
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
    const vectorizedStats =
      datasetType !== "Vectorized"
        ? [
            {
              label: "Model Name",
              value: vectorizedSettings.modelName,
              icon: Code,
              isInput: true,
              setter: (value: string) =>
                setVectorizedSettings((prev) => ({
                  ...prev,
                  modelName: value,
                })),
            },
            {
              label: "Dimensions",
              value: vectorizedSettings.dimensions,
              icon: Box,
              isInput: true,
              type: "number",
              setter: (value: string) =>
                setVectorizedSettings((prev) => ({
                  ...prev,
                  dimensions: parseInt(value),
                })),
            },
            {
              label: "Vector DB",
              value: vectorizedSettings.vectorDatabase,
              icon: Database,
              isInput: true,
              setter: (value: string) =>
                setVectorizedSettings((prev) => ({
                  ...prev,
                  vectorDatabase: value,
                })),
            },
          ]
        : [];

    return [...baseStats, ...vectorizedStats];
  };

  // The refs are already declared at the top of the component

  // Note: selectedFiles and showConfirmation states are already declared at the top

  // Add file type validation
  const fileTypeMap = {
    Image: {
      mimeTypes: [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/heic",
      ],
      extensions: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".heic"],
    },
    Audio: {
      mimeTypes: ["audio/mpeg", "audio/wav", "audio/ogg"],
      extensions: [".mp3", ".wav", ".ogg"],
    },
    Video: {
      mimeTypes: ["video/mp4", "video/webm", "video/ogg"],
      extensions: [".mp4", ".webm", ".ogg"],
    },
    Text: {
      mimeTypes: [
        "text/plain",
        "text/csv",
        "application/json",
        "application/pdf",
      ],
      extensions: [".txt", ".csv", ".json", ".pdf", ".docx", ".xlsx", ".doc"],
    },
  };

  // Add file change handler
  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "raw" | "vectorized"
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    const filesArray = Array.from(files);

    if (type === "raw") {
      const allowedExtensions =
        fileTypeMap[fileType as keyof typeof fileTypeMap]?.extensions;
      if (!allowedExtensions) {
        toast.error("Invalid file type selected");
        return;
      }

      const invalidFiles = filesArray.filter((file) => {
        const extension = "." + file.name.split(".").pop()?.toLowerCase();
        return !allowedExtensions.includes(extension);
      });

      if (invalidFiles.length > 0) {
        toast.error(
          `Invalid file types detected. Allowed extensions: ${allowedExtensions.join(
            ", "
          )}`
        );
        if (event.target) event.target.value = "";
        return;
      }
    }

    // Create a new FileList-like object with the filtered files
    const filteredFiles = new DataTransfer();
    filesArray.forEach((file) => filteredFiles.items.add(file));

    setSelectedFiles({
      files: filteredFiles.files,
      type,
    });
    setShowConfirmation(true);
  };

  // Add file upload handler
  const handleUpload = async (files: FileList, type: "raw" | "vectorized") => {
    if (!dataset?._id || !user?.uid) {
      toast.error("Missing required information");
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadDatasetFiles(
        type === "raw" ? files : null,
        type === "vectorized" ? files : null,
        type,
        {
          userId: user.uid, // Add this explicitly
          datasetId: dataset._id,
          name: name,
          description: description,
          domain: domain,
          file_type: fileType.toLowerCase(),
          model_name: vectorizedSettings.modelName,
          dimensions: vectorizedSettings.dimensions,
          vector_database: vectorizedSettings.vectorDatabase,
        }
      );

      if (result?.success) {
        toast.success(
          `${type === "raw" ? "Raw" : "Vectorized"} files uploaded successfully`
        );
        setFileSize((prev) => ({
          ...prev,
          [type]: files.length,
        }));
      } else {
        throw new Error(result?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload files"
      );
    } finally {
      setIsUploading(false);
      setShowConfirmation(false);
    }
  };

  // Add ConfirmationDialog component
  const ConfirmationDialog = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold mb-4 text-white">
          Confirm File Upload
        </h3>
        <p className="text-gray-300 mb-4">
          {selectedFiles?.files?.length} files selected. Are you sure you want
          to proceed?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setShowConfirmation(false)}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selectedFiles?.files) {
                handleUpload(selectedFiles.files, selectedFiles.type);
              }
            }}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors text-white"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );

  const renderRightColumn = () => (
    <motion.div variants={fadeIn} className="space-y-6">
      {/* Dataset Status Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-sm font-medium text-gray-400 mb-3">
          Dataset Status
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Raw Data</span>
            <span
              className={fileSize.raw > 0 ? "text-green-400" : "text-gray-500"}
            >
              {fileSize.raw > 0 ? "Available" : "Not Available"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Vectorized Data</span>
            <span
              className={
                fileSize.vectorized > 0 ? "text-green-400" : "text-gray-500"
              }
            >
              {fileSize.vectorized > 0 ? "Available" : "Not Available"}
            </span>
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      {(datasetType === "Raw" || datasetType === "Vectorized") && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-medium text-white mb-4">
            Add {datasetType === "Raw" ? "Vectorized" : "Raw"} Data
          </h3>
          <input
            type="file"
            ref={datasetType === "Raw" ? vectorizedInputRef : rawInputRef}
            onChange={(e) =>
              handleFileInputChange(
                e,
                datasetType === "Raw" ? "vectorized" : "raw"
              )
            }
            multiple
            className="w-full px-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600 
              text-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 
              file:text-sm file:font-medium file:bg-cyan-600 file:text-white 
              hover:file:bg-cyan-700 file:transition-colors"
            accept={
              datasetType === "Raw"
                ? undefined
                : fileTypeMap[
                    fileType as keyof typeof fileTypeMap
                  ]?.extensions.join(",")
            }
          />
          <p className="mt-2 text-sm text-gray-400">
            {datasetType === "Raw"
              ? "Add vectorized data to enable AI-powered search capabilities"
              : `Add raw ${fileType.toLowerCase()} files to store the original data`}
          </p>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0f1829] to-gray-900">
      {uploadStatus.show && <StatusMessage />}
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
                    <div className="text-sm font-medium text-cyan-200">
                      {stat.label}
                    </div>
                  </div>
                  {stat.isReadOnly ? (
                    <div className="text-lg font-semibold text-white">
                      {stat.value} data
                    </div>
                  ) : stat.isSelect ? (
                    <select
                      value={stat.value}
                      onChange={(e) => stat.setter(e.target.value)}
                      disabled={stat.isDisabled}
                      className={`w-full bg-gray-900/50 text-white rounded-lg px-4 py-2 border border-gray-700 
                        ${
                          stat.isDisabled
                            ? "opacity-50 cursor-not-allowed"
                            : "focus:border-cyan-500"
                        } outline-none`}
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
                            >
                              {typeof option === "string"
                                ? option
                                : option.label}
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
                    datasetType.toLowerCase() === "raw"
                      ? "min-h-[230px]"
                      : "min-h-[100px]"
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
      {showConfirmation && <ConfirmationDialog />}
    </div>
  );
};

export default DatasetEdit;
