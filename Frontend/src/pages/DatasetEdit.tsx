import React, { useState, useEffect } from "react";
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
} from "lucide-react";

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 }
};

const DatasetEdit = () => {
  const { datasetId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

  useEffect(() => {
    // Simulating data fetch - replace with actual API call
    setName("Medical Imaging Dataset");
    setDescription("Collection of medical imaging data for AI training");
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
  }, [datasetId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Add your save logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      navigate(`/datasets/${datasetId}`);
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
          {/* Navigation */}
          <div className="py-4 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="text-cyan-400 hover:text-white flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dataset
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg font-medium flex items-center gap-2 
                hover:bg-cyan-700 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Title Section */}
          <div className="py-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-3xl font-bold bg-transparent text-white border-b border-gray-700 
                focus:border-cyan-500 outline-none mb-4"
              placeholder="Dataset Name"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent text-cyan-100 border border-gray-700 rounded-lg px-4 py-2 
                focus:border-cyan-500 outline-none"
              placeholder="Dataset Description"
              rows={2}
            />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Size', value: size.raw, icon: Database, setter: (v: string) => setSize({ ...size, raw: v }) },
                { label: 'Type', value: fileType, icon: FileType, setter: setFileType },
                { label: 'Domain', value: domain, icon: Box, setter: setDomain },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                >
                  <stat.icon className="w-5 h-5 text-cyan-400 mb-2" />
                  <div className="text-sm text-cyan-200 mb-1">{stat.label}</div>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => stat.setter(e.target.value)}
                    className="w-full bg-transparent text-white border-b border-gray-700 focus:border-cyan-500 outline-none"
                  />
                </div>
              ))}
            </div>

            {/* About Section */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-6">About This Dataset</h2>
              
              {/* Overview */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-cyan-200 mb-2">Overview</h3>
                <textarea
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  className="w-full bg-gray-900/50 text-white rounded-lg p-3 border border-gray-700 
                    focus:border-cyan-500 outline-none"
                  rows={3}
                />
              </div>

              {/* Data Structure */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-cyan-200 mb-2">Data Structure</h3>
                <textarea
                  value={dataStructure}
                  onChange={(e) => setDataStructure(e.target.value)}
                  className="w-full bg-gray-900/50 text-white rounded-lg p-3 border border-gray-700 
                    focus:border-cyan-500 outline-none"
                  rows={3}
                />
              </div>

              {/* Contents */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-cyan-200">Contents</h3>
                  <button
                    onClick={() => addListItem(contents, setContents)}
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    + Add Content
                  </button>
                </div>
                {contents.map((content, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={content}
                      onChange={(e) => updateListItem(index, e.target.value, contents, setContents)}
                      className="flex-1 bg-gray-900/50 text-white rounded-lg p-2 border border-gray-700 
                        focus:border-cyan-500 outline-none"
                    />
                    <button
                      onClick={() => removeListItem(index, contents, setContents)}
                      className="text-red-400 hover:text-red-300 px-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Use Cases */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-cyan-200">Use Cases</h3>
                  <button
                    onClick={() => addListItem(useCases, setUseCases)}
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    + Add Use Case
                  </button>
                </div>
                {useCases.map((useCase, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={useCase}
                      onChange={(e) => updateListItem(index, e.target.value, useCases, setUseCases)}
                      className="flex-1 bg-gray-900/50 text-white rounded-lg p-2 border border-gray-700 
                        focus:border-cyan-500 outline-none"
                    />
                    <button
                      onClick={() => removeListItem(index, useCases, setUseCases)}
                      className="text-red-400 hover:text-red-300 px-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetEdit;
