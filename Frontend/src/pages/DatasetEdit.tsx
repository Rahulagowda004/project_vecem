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
} from "lucide-react";

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 }
};

const DatasetEdit = () => {
  const { username, datasetname } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
      icon: Image
    },
    Audio: {
      label: "Audio Files",
      extensions: ["mp3", "wav", "ogg"],
      icon: Mic
    },
    Text: {
      label: "Text Files",
      extensions: ["txt", "csv", "json", "pdf", "docx", "xlsx", "doc"],
      icon: FileType
    },
    Video: {
      label: "Video Files",
      extensions: ["mp4", "webm", "ogg"],
      icon: Video
    }
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
  const [fileSize, setFileSize] = useState<{ raw: number; vectorized: number }>({
    raw: 0,
    vectorized: 0
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const totalSize = Array.from(files).reduce((acc, file) => acc + file.size, 0);
    setFileSize(prev => ({
      ...prev,
      raw: totalSize
    }));

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) clearInterval(interval);
    }, 500);
  };

  useEffect(() => {
    // Simulating data fetch - replace with actual API call
    setName("Medical Imaging Dataset");
    
    setDatasetType("Both");
    setVectorizedSettings({
      dimensions: 768,
      vectorDatabase: "Pinecone",
    });
    setDomain("Health");
    setFileType("Image");
    setSize({
      raw: "2.3 GB",
      vectorized: "1.1 GB",
    });
    setOverview("Collection of medical imaging data for AI training");
    setDataStructure("The dataset consists of MRI scans in DICOM format along with their vectorized representations.");
    setContents([
      "Raw Data: 10,000 MRI scan files in DICOM format",
      "Metadata: Patient demographics and scan parameters",
      "Vectorized Data: 768-dimensional vectors for each scan",
    ]);
    setUseCases([
      "Medical image analysis",
      "Disease detection",
      "Machine learning model training",
    ]);
    setIsLoading(false);
  }, [datasetname]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Add your save logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      navigate(`/${username}/${datasetname}`);
    } catch (error) {
      console.error('Error saving dataset:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addListItem = (list: string[], setList: (items: string[]) => void) => {
    setList([...list, ""]);
  };

  const updateListItem = (index: number, value: string, list: string[], setList: (items: string[]) => void) => {
    const newList = [...list];
    newList[index] = value;
    setList(newList);
  };

  const removeListItem = (index: number, list: string[], setList: (items: string[]) => void) => {
    setList(list.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-cyan-400">Loading dataset...</div>
      </div>
    );
  }

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
            <Link to={`/${username}/${datasetname}`} className="hover:text-white transition-colors">{name}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium">Edit</span>
          </div>

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
                <motion.div whileHover={{ scale: 1.05 }} className="px-3 py-1 bg-cyan-900/40 text-cyan-400 border border-cyan-700/50 rounded-full text-sm">
                  {domain || "Select Domain"}
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} className="px-3 py-1 bg-cyan-900/40 text-cyan-400 border border-cyan-700/50 rounded-full text-sm">
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
                {isSaving ? 'Saving...' : 'Save Changes'}
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
            <div className="grid grid-cols-3 gap-6">
              {[
                { 
                  label: 'Size', 
                  value: `Raw: ${formatFileSize(fileSize.raw)}${fileSize.vectorized ? `\nVectorized: ${formatFileSize(fileSize.vectorized)}` : ''}`, 
                  icon: Database,
                  isReadOnly: true 
                },
                { 
                  label: 'File Type', 
                  value: fileType, 
                  icon: FileType,
                  isSelect: true,
                  options: Object.entries(fileTypes).map(([type, data]) => ({
                    value: type,
                    label: data.label
                  })),
                  setter: setFileType 
                },
                { 
                  label: 'Domain', 
                  value: domain, 
                  icon: Box, 
                  isSelect: true,
                  options: domains,
                  setter: setDomain 
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700 min-h-[120px] flex flex-col justify-between"
                >
                  <div>
                    <stat.icon className="w-5 h-5 text-cyan-400 mb-2" />
                    <div className="text-sm font-medium text-cyan-200">{stat.label}</div>
                  </div>
                  <div className="flex-1 flex items-center">
                    {stat.isReadOnly ? (
                      <div className="text-white whitespace-pre-line text-lg font-medium">
                        {stat.value}
                      </div>
                    ) : (
                      stat.isSelect ? (
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
                                  key={typeof option === 'string' ? option : option.value} 
                                  value={typeof option === 'string' ? option : option.value}
                                  className="py-2"
                                >
                                  {typeof option === 'string' ? option : option.label}
                                </option>
                              ))
                            : null}
                        </select>
                      ) : null
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* About Section */}
            <motion.div
              variants={fadeIn}
              className="bg-gray-800 rounded-lg p-8 border border-gray-700 shadow-xl mt-8" // Increased padding and margin
            >
              <h2 className="text-xl font-semibold text-white mb-6">About This Dataset</h2>
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
          <motion.div
            variants={fadeIn}
            className="space-y-6"
          >
            {/* File Upload Section */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4">Update Files</h2>
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
              <h2 className="text-lg font-semibold text-white mb-4">Dataset Type</h2>
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
                <h2 className="text-lg font-semibold text-white mb-4">Vectorized Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-cyan-200 mb-1 block">Dimensions</label>
                    <input
                      type="number"
                      value={vectorizedSettings.dimensions}
                      onChange={(e) => setVectorizedSettings({
                        ...vectorizedSettings,
                        dimensions: parseInt(e.target.value)
                      })}
                      className="w-full bg-gray-900/50 text-white rounded-lg p-2 border border-gray-700 
                        focus:border-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-cyan-200 mb-1 block">Vector Database</label>
                    <input
                      type="text"
                      value={vectorizedSettings.vectorDatabase}
                      onChange={(e) => setVectorizedSettings({
                        ...vectorizedSettings,
                        vectorDatabase: e.target.value
                      })}
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
    </div>
  );
};

export default DatasetEdit;
