import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
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
} from "lucide-react";

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 }
};

const DatasetDetail = () => {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);
  const [isCodeOpen, setIsCodeOpen] = useState(false);

  // Dataset structure matching upload form fields
  const dataset = {
    name: "Medical Imaging Dataset",
    description: "Collection of medical imaging data for AI training",
    datasetType: "Both",
    vectorizedSettings: {
      dimensions: 768,
      vectorDatabase: "Pinecone",
    },
    domain: "Health",
    fileType: "Image",
    size: {
      raw: "2.3 GB",
      vectorized: "1.1 GB",
    },
    uploadDate: "2024-02-20",
    owner: "Medical Research Lab",
    status: {
      uploadComplete: true,
      processingComplete: true,
    },
    detailedDescription: {
      overview: "Collection of medical imaging data for AI training",
      dataStructure:
        "The dataset consists of MRI scans in DICOM format along with their vectorized representations.",
      contents: [
        "Raw Data: 10,000 MRI scan files in DICOM format",
        "Metadata: Patient demographics and scan parameters",
        "Vectorized Data: 768-dimensional vectors for each scan",
      ],
      useCases: [
        "Medical image analysis",
        "Disease detection",
        "Machine learning model training",
      ],
    },
    downloads: {
      raw: {
        url: "/api/datasets/raw/download",
        size: "2.3 GB",
        format: "ZIP (DICOM files)",
      },
      vectorized: {
        url: "/api/datasets/vectorized/download",
        size: "1.1 GB",
        format: "Parquet",
      },
    },
  };

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
dataset = vc.load_dataset("${id}")

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
    <div className="min-h-screen bg-gray-900">
      {/* Sticky Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800"
      >
        <div className="max-w-6xl mx-auto px-4">
          {/* Breadcrumb */}
          <div className="py-4 flex items-center gap-2 text-sm text-cyan-400">
            <Link to="/datasets" className="hover:text-white transition-colors">Datasets</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium">{dataset.name}</span>
          </div>
          
          {/* Title and Actions */}
          <div className="py-4 flex justify-between items-start">
            <motion.div
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              className="space-y-2"
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent">
                {dataset.name}
              </h1>
              <div className="flex gap-2">
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1 bg-cyan-900/40 text-cyan-400 border border-cyan-700/50 rounded-full text-sm"
                >
                  {dataset.domain}
                </motion.span>
                <motion.span 
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1 bg-cyan-900/40 text-cyan-400 border border-cyan-700/50 rounded-full text-sm"
                >
                  {dataset.fileType}
                </motion.span>
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
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-cyan-700 transition-all shadow-lg shadow-blue-600/20"
              >
                <Download className="w-4 h-4" />
                Download Dataset
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
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Size', value: dataset.size.raw, icon: Database },
                { label: 'Type', value: dataset.fileType, icon: FileType },
                { label: 'Domain', value: dataset.domain, icon: Box },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={fadeIn}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-cyan-700 transition-colors shadow-lg"
                >
                  <stat.icon className="w-5 h-5 text-cyan-400 mb-2" />
                  <div className="text-sm text-cyan-200">{stat.label}</div>
                  <div className="text-lg font-semibold text-white mt-1">{stat.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Description Section */}
            <motion.div
              variants={fadeIn}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl"
            >
              <h2 className="text-xl font-semibold text-white mb-4">About This Dataset</h2>
              <p className="text-white text-lg leading-relaxed min-h-[270px]">
                {dataset.description}
              </p>
            </motion.div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            variants={fadeIn}
            className="space-y-6"
          >
            {/* Code Usage Section */}
            <motion.div
              layout
              className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-xl"
            >
              <motion.button
                whileHover={{ backgroundColor: "rgba(75, 85, 99, 0.3)" }}
                onClick={() => setIsCodeOpen(!isCodeOpen)}
                className="w-full p-4 flex items-center justify-between text-left text-white"
              >
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-xl font-semibold">Python Usage</h2>
                </div>
                <svg
                  className={`w-5 h-5 transform transition-transform ${
                    isCodeOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </motion.button>

              <AnimatePresence>
                {isCodeOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    className="border-t border-gray-700 p-4"
                  >
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-cyan-200">
                          {pythonExamples.basic.label}
                        </h3>
                        <button
                          onClick={() => handleCopy(pythonExamples.basic.code)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                        <code className="text-sm text-white">
                          {pythonExamples.basic.code}
                        </code>
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* About Section */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Uploaded User</h2>
              <div className="space-y-3">
                <p className="text-cyan-100">
                  Uploaded by:{" "}
                  <Link to={`/user-profile/${dataset.owner}`} className="text-cyan-400 hover:text-white transition-colors">
                    {dataset.owner}
                  </Link>
                </p>
                <p className="text-cyan-100">
                  Upload Date:{" "}
                  <span className="text-white">
                    {new Date(dataset.uploadDate).toLocaleDateString()}
                  </span>
                </p>
              </div>
            </div>

            {/* Vectorized Settings */}
            {(dataset.datasetType === "Vectorized" ||
              dataset.datasetType === "Both") && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Vectorized Settings
                </h2>
                <div className="space-y-3">
                  <div>
                    <div className="text-cyan-200 mb-1">Dimensions</div>
                    <div className="bg-gray-700 p-2 rounded text-white">
                      {dataset.vectorizedSettings.dimensions}
                    </div>
                  </div>
                  <div>
                    <div className="text-cyan-200 mb-1">Vector Database</div>
                    <div className="bg-gray-700 p-2 rounded text-white">
                      {dataset.vectorizedSettings.vectorDatabase}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default DatasetDetail;
