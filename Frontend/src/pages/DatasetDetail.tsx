import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
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
  Home,
  UserCircle2, // Add this import
} from "lucide-react";
import { toast } from "react-hot-toast";

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

const DatasetDetail = () => {
  const { username, datasetname } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Add this line
  const isFromHome = location.state?.from === "home"; // Add this line to get the state
  const { user } = useAuth(); // Add this near the top with other hooks
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isCodeOpen, setIsCodeOpen] = useState(false);

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        setLoading(true);

        if (!username || !datasetname) {
          throw new Error("Invalid URL parameters");
        }

        const response = await fetch("http://127.0.0.1:5000/dataset-click", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            username,
            datasetName: datasetname,
          }),
        });

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

        setDataset({
          name: data.dataset_info.name,
          description: data.dataset_info.description,
          datasetType: data.upload_type,
          domain: data.dataset_info.domain,
          fileType: data.dataset_info.file_type,
          size: {
            raw: `${data.files.raw?.length || 0} files`, // Update with actual size calculation
            vectorized: `${data.files.vectorized?.length || 0} files`,
          },
          uploadDate: data.timestamp,
          owner: data.username, // Change this line to use data.username
          files: data.files,
          base_directory: data.base_directory,
          vectorizedSettings: {
            dimensions:
              data.dataset_info.dimensions ||
              data.dataset_info.vectorized_settings?.dimensions,
            vectorDatabase:
              data.dataset_info.vector_database ||
              data.dataset_info.vectorized_settings?.vector_database,
            modelName:
              data.dataset_info.model_name ||
              data.dataset_info.vectorized_settings?.model_name,
          },
        });
      } catch (error) {
        console.error("Error fetching dataset:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to load dataset"
        );
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchDataset();
  }, [username, datasetname, navigate]);

  const handleDownload = async (fileType: string) => {
    if (!dataset?.name || !dataset?.owner) {
      console.error("Dataset name or owner not available");
      return;
    }

    const downloadUrl = `https://vecem.blob.core.windows.net/datasets/${dataset.owner}/${dataset.name}/${fileType}.zip`;

    // Create an anchor element and trigger download
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${dataset.name}_${fileType}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-cyan-400">Loading dataset...</div>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400">Dataset not found</div>
      </div>
    );
  }

  interface PythonExamples {
    basic: {
      label: string;
      code: string;
    };
  }

  const pythonExamples: PythonExamples = {
    basic: {
      label: "Basic Usage",
      code: `import vecem as vc
# Load the dataset
dataset = vc.load_dataset("${username}/${datasetname}/${dataset.datasetType}")
# Access the data
data = dataset.get_files()  # For raw files`,
    },
  } as const;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0f1829] to-gray-900">
      {/* Breadcrumb Navigation - Keep existing code but update styles */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-4 bg-gray-900/90 border-b border-cyan-500/10 backdrop-blur-sm"
      >
        <nav className="flex items-center space-x-2 text-sm">
          <Link
            to={`/${username}${
              user?.uid === dataset?.owner_uid ? "" : "/view"
            }`}
            className="text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <UserCircle2 className="w-4 h-4 mr-1 inline-block" />
            {username}
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-600" />
          <span className="text-cyan-400 flex items-center">
            <Database className="w-4 h-4 mr-1 inline-block" />
            {dataset?.name || "Loading..."}
          </span>
        </nav>
      </motion.div>

      {/* Header Section - Reorganized for better hierarchy */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 py-6"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <motion.div className="space-y-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent">
                {dataset.name}
              </h1>
              <div className="flex flex-wrap gap-2">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-1.5 bg-cyan-900/40 text-cyan-400 border border-cyan-700/50 rounded-full text-sm"
                >
                  {dataset.domain}
                </motion.span>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-1.5 bg-cyan-900/40 text-cyan-400 border border-cyan-700/50 rounded-full text-sm"
                >
                  {dataset.fileType}
                </motion.span>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-1.5 bg-cyan-900/40 text-cyan-400 border border-cyan-700/50 rounded-full text-sm"
                >
                  {dataset.datasetType}
                </motion.span>
              </div>
            </motion.div>

            {/* Download Buttons - Updated styling */}
            <motion.div className="flex flex-wrap gap-3 w-full md:w-auto">
              {dataset.datasetType === "both" ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDownload("raw")}
                    className="flex-1 md:flex-none px-6 py-2.5 bg-cyan-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-600/20"
                  >
                    <Download className="w-4 h-4" />
                    Raw Dataset
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDownload("vectorized")}
                    className="flex-1 md:flex-none px-6 py-2.5 bg-cyan-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-600/20"
                  >
                    <Download className="w-4 h-4" />
                    Vectorized Dataset
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDownload(dataset.datasetType)}
                  className="flex-1 md:flex-none px-6 py-2.5 bg-cyan-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-600/20"
                >
                  <Download className="w-4 h-4" />
                  Download Dataset
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content - Reorganized grid layout */}
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="max-w-6xl mx-auto px-4 py-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Dataset Info */}
          <motion.div className="lg:col-span-2 space-y-8">
            {/* Stats Cards - Updated grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                {
                  label: "Dataset Type",
                  value:
                    dataset.datasetType.charAt(0).toUpperCase() +
                    dataset.datasetType.slice(1),
                  icon: Database,
                },
                { label: "File Type", value: dataset.fileType, icon: FileType },
                { label: "Domain", value: dataset.domain, icon: Box },
                ...(dataset.datasetType.toLowerCase() === "vectorized" ||
                dataset.datasetType.toLowerCase() === "both"
                  ? [
                      {
                        label: "Dimensions",
                        value:
                          dataset.vectorizedSettings?.dimensions?.toString() ||
                          "N/A",
                        icon: Box,
                      },
                      {
                        label: "Model",
                        value: dataset.vectorizedSettings?.modelName || "N/A",
                        icon: Code,
                      },
                      {
                        label: "Vector DB",
                        value:
                          dataset.vectorizedSettings?.vectorDatabase || "N/A",
                        icon: Database,
                      },
                    ]
                  : []),
              ].map((stat, index) => (
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
                  <div className="text-lg font-semibold text-white">
                    {stat.value}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Description Section - Enhanced styling */}
            <motion.div
              variants={fadeIn}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 shadow-xl"
            >
              <h2 className="text-2xl font-semibold text-white mb-6">
                About This Dataset
              </h2>
              <p
                className={`text-gray-200 text-lg leading-relaxed ${
                  dataset.datasetType.toLowerCase() === "raw"
                    ? "min-h-[230px]"
                    : "min-h-[100px]"
                }`}
              >
                {dataset.description}
              </p>
            </motion.div>
          </motion.div>

          {/* Right Column - Sidebar */}
          <motion.div variants={fadeIn} className="space-y-6">
            {/* Code Usage Section - Updated styling */}
            <motion.div
              layout
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 shadow-xl"
            >
              <div className="w-full p-4 flex items-center justify-between text-left text-white">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-xl font-semibold">Python Usage</h2>
                </div>
              </div>
              <div className="border-t border-gray-700 p-4">
                <div className="mb-4 relative">
                  <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto scrollbar-thumb-white scrollbar-track-gray-800">
                    <button
                      onClick={() => handleCopy(pythonExamples.basic.code)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                      }}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <code className="text-sm text-white">
                      {pythonExamples.basic.code}
                    </code>
                  </pre>
                </div>
              </div>
            </motion.div>

            {/* About Section - Enhanced with metadata */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold text-white mb-4">
                Uploaded User
              </h2>
              <div className="space-y-3">
                <p className="text-cyan-100">
                  Uploaded by:{" "}
                  <Link
                    to={`/${dataset.owner}/view`}
                    className="text-cyan-400 hover:text-white transition-colors"
                  >
                    {dataset.owner}
                  </Link>
                </p>
                <p className="text-cyan-100">
                  Upload Date:{" "}
                  <span className="text-white">
                    {new Date(dataset.uploadDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default DatasetDetail;
