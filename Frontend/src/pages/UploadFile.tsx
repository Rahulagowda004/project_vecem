import React, { useState, useRef, FormEvent, useEffect } from "react";
import { FileType, Image, Mic, Video, ChevronRight, User } from "lucide-react";
import { uploadDataset, DatasetForm, checkDatasetNameAvailability } from "../services/uploadService";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { getUserProfileByUid } from "../services/userService";

// Add custom type definition for directory input
interface DirectoryInputElement extends HTMLInputElement {
  webkitdirectory: boolean;
  directory?: string;
  mozdirectory?: string;
}

interface UploadProgress {
  progress: number;
  status: "uploading" | "completed" | "error";
}

const UploadFile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [datasetType, setDatasetType] = useState<"Raw" | "Vectorized" | "Both">(
    "Raw"
  );
  const [fileType, setFileType] = useState<
    "Image" | "Audio" | "Text" | "Video"
  >("Text");
  const [error, setError] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    status: "uploading",
  });
  const fileInputRef = useRef<DirectoryInputElement>(null);
  const rawInputRef = useRef<DirectoryInputElement>(null);
  const vectorizedInputRef = useRef<DirectoryInputElement>(null);
  const [formData, setFormData] = useState<DatasetForm>({
    name: "",
    description: "",
    domain: "",
  });
  const [totalSize, setTotalSize] = useState<{ raw: number; vectorized: number }>({
    raw: 0,
    vectorized: 0
  });
  const [nameError, setNameError] = useState<string>("");
  const [isCheckingName, setIsCheckingName] = useState<boolean>(false);
  const nameCheckTimeout = useRef<NodeJS.Timeout>();
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
  const [userProfile, setUserProfile] = useState<{ username: string } | null>(null);

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

  const fileTypeMap = {
    Image: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic"],
    Audio: ["audio/mpeg", "audio/wav", "audio/ogg"],
    Video: ["video/mp4", "video/webm", "video/ogg"],
    Text: [
      "text/plain",
      "text/csv",
      "application/json",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/msword", // .doc
    ],
    Vectorized: ["*/*"] // Allow any file type for vectorized data
  };

  // Modify handleFileInputChange to bypass Windows validation
  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "raw" | "vectorized"
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Skip Windows validation and move directly to our custom validation
    const filesArray = Array.from(files);
    if (type === "raw") {
      const allowedTypes = fileTypeMap[fileType];
      const invalidFiles = filesArray.filter(file => {
        // More permissive check - only validate file extension
        const extension = file.name.split('.').pop()?.toLowerCase();
        return !allowedTypes.some(type => type.includes(extension || ''));
      });

      if (invalidFiles.length > 0) {
        setError(`Invalid file types detected. All files must be ${fileType.toLowerCase()} files.`);
        return;
      }
    }

    setSelectedFiles({ files, type });
    setShowConfirmation(true);
  };

  const handleFileChange = (
    files: FileList | null,
    type: "raw" | "vectorized"
  ) => {
    if (!files || files.length === 0) return;
    setError("");

    const filesArray = Array.from(files);

    // Only validate file types for raw data uploads
    if (type === "raw") {
      const allowedTypes = fileTypeMap[fileType];
      const invalidFiles = filesArray.filter(
        (file) => !allowedTypes.includes(file.type)
      );

      if (invalidFiles.length > 0) {
        setError(
          `Invalid file types detected. All files must be ${fileType.toLowerCase()} files.`
        );
        return;
      }
    }

    // Calculate total size and update progress immediately
    const totalBytes = filesArray.reduce((acc, file) => acc + file.size, 0);
    setTotalSize(prev => ({
      ...prev,
      [type]: totalBytes
    }));

    setUploadProgress({ progress: 0, status: "uploading" });
    simulateFolderUpload(filesArray.length);
  };

  const simulateFolderUpload = (totalFiles: number) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress({
        progress: progress,
        status: progress === 100 ? "completed" : "uploading",
      });
      if (progress >= 100) clearInterval(interval);
    }, 500);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const formatDatasetName = (name: string) => {
    return name.replace(/\s+/g, '_');
  };

  const validateDatasetName = async (name: string) => {
    if (!name) {
      setNameError("");
      return;
    }

    try {
      setIsCheckingName(true);
      const result = await checkDatasetNameAvailability(name);
      if (!result.available) {
        setNameError(result.message);
      } else {
        setNameError("");
      }
    } catch (error) {
      setNameError(error instanceof Error ? error.message : "Error checking dataset name");
    } finally {
      setIsCheckingName(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedName = formatDatasetName(e.target.value);
    setFormData({
      ...formData,
      name: formattedName
    });

    // Clear any existing timeout
    if (nameCheckTimeout.current) {
      clearTimeout(nameCheckTimeout.current);
    }

    // Set a new timeout to check name availability
    nameCheckTimeout.current = setTimeout(() => {
      validateDatasetName(formattedName);
    }, 500);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.uid) {
        try {
          const profile = await getUserProfileByUid(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setUploadProgress({ progress: 0, status: "uploading" });
    setUploadStatus({ show: false, success: false, message: "" });

    if (nameError) {
      setError(nameError);
      return;
    }

    if (!formData.name.trim()) {
      setError("Please provide a dataset name");
      return;
    }

    try {
      let result;
      const datasetId = `${formData.name}_${Date.now()}`;
      const datasetInfoWithId = {
        ...formData,
        datasetId,
        file_type: fileType.toLowerCase(),
      };

      if (datasetType === "Both") {
        const rawFiles = rawInputRef.current?.files;
        const vectorizedFiles = vectorizedInputRef.current?.files;

        if (!rawFiles?.length && !vectorizedFiles?.length) {
          setError(`Please select ${fileType.toLowerCase()} files to upload`);
          return;
        }

        console.log("Uploading both raw and vectorized files:", {
          rawCount: rawFiles?.length,
          vectorizedCount: vectorizedFiles?.length,
        });

        result = await uploadDataset(
          rawFiles,
          vectorizedFiles,
          "both",
          datasetInfoWithId
        );
      } else {
        const files = fileInputRef.current?.files;
        if (!files?.length) {
          setError(`Please select ${fileType.toLowerCase()} files to upload`);
          return;
        }

        console.log(`Uploading ${datasetType.toLowerCase()} files:`, {
          fileCount: files.length,
        });

        result = await uploadDataset(
          datasetType.toLowerCase() === "raw" ? files : null,
          datasetType.toLowerCase() === "vectorized" ? files : null,
          datasetType.toLowerCase() as "raw" | "vectorized",
          datasetInfoWithId
        );
      }

      if (result?.success) {
        setUploadProgress({ progress: 100, status: "completed" });
        setUploadStatus({
          show: true,
          success: true,
          message: "Dataset uploaded successfully!"
        });
        
        // Wait for 4 seconds, then redirect to user profile
        setTimeout(() => {
          if (userProfile?.username) {
            navigate(`/${userProfile.username}`);
          }
        }, 2000);
      } else {
        setUploadProgress({ progress: 0, status: "error" });
        setError(result?.message || "Upload failed");
        setUploadStatus({
          show: true,
          success: false,
          message: result?.message || "Failed to upload dataset"
        });

        // Hide error message after 4 seconds
        setTimeout(() => {
          setUploadStatus({ show: false, success: false, message: "" });
        }, 2000);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadProgress({ progress: 0, status: "error" });
      setUploadStatus({
        show: true,
        success: false,
        message: error instanceof Error ? error.message : "Failed to upload dataset"
      });
      setError(
        error instanceof Error ? error.message : "Failed to upload dataset"
      );

      // Hide error message after 4 seconds
      setTimeout(() => {
        setUploadStatus({ show: false, success: false, message: "" });
      }, 4000);
    }
  };

  // Add helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Add confirmation dialog component
  const ConfirmationDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold mb-4">Confirm File Upload</h3>
        <p className="text-gray-300 mb-4">
          {selectedFiles?.files?.length} files selected. Are you sure you want to proceed with these files?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => {
              setShowConfirmation(false);
              // Clear the file input
              if (selectedFiles?.type === "raw") {
                if (rawInputRef.current) rawInputRef.current.value = "";
              } else if (selectedFiles?.type === "vectorized") {
                if (vectorizedInputRef.current) vectorizedInputRef.current.value = "";
              } else if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setShowConfirmation(false);
              if (selectedFiles) {
                handleFileChange(selectedFiles.files, selectedFiles.type);
              }
            }}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );

  // Update the StatusMessage component to be more prominent
  const StatusMessage = () => {
    if (!uploadStatus.show) return null;

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div 
          className={`p-8 rounded-xl ${
            uploadStatus.success ? 'bg-green-800/90' : 'bg-red-800/90'
          } shadow-lg max-w-md mx-4 text-center transform transition-all duration-300 scale-100`}
        >
          <div className={`text-6xl mb-4 ${
            uploadStatus.success ? 'text-green-400' : 'text-red-400'
          }`}>
            {uploadStatus.success ? '✓' : '✕'}
          </div>
          <h3 className="text-2xl font-semibold mb-2 text-white">
            {uploadStatus.success ? 'Success!' : 'Upload Failed'}
          </h3>
          <p className="text-lg text-gray-200">
            {uploadStatus.message}
          </p>
          {uploadStatus.success && (
            <p className="text-sm text-gray-300 mt-4">
              Redirecting to your profile...
            </p>
          )}
        </div>
      </div>
    );
  };

  // Update file inputs to bypass system dialog checks
  const fileInputProps = {
    className: "w-full px-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/40 outline-none transition text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 file:transition-colors",
    multiple: true,
    directory: "",
    webkitdirectory: "",
    mozdirectory: "",
  };

  return (
    <div className="min-h-screen h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {showConfirmation && <ConfirmationDialog />}
      {uploadStatus.show && <StatusMessage />}
      <div className="min-h-screen h-full w-full max-w-7xl mx-auto px-8 py-6 md:py-8">
        {/* Updated breadcrumb navigation */}
        <nav className="flex mb-6 text-sm text-gray-400">
          {userProfile?.username ? (
            <Link 
              to={`/${userProfile.username}`} 
              className="flex items-center hover:text-cyan-400 transition-colors"
            >
              <User className="w-4 h-4 mr-1" />
              {userProfile.username}
            </Link>
          ) : (
            <span className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              Loading...
            </span>
          )}
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-white">Upload Dataset</span>
        </nav>

        <div className="min-h-[calc(100vh-4rem)] bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-gray-700/50 p-6 md:p-8 overflow-y-auto">
          <h1 className="text-5xl font-bold text-center bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent mb-6">
            Data Specifications
          </h1>
          <h5 className="text-white text-center items-center mb-8">
            Specify your dataset, select the format, ensure compatibility, and track uploads in real time.
          </h5>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dataset Name */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Dataset Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                className={`w-full px-4 py-2 rounded-xl bg-gray-700/50 border 
                  ${nameError ? 'border-red-500' : 'border-gray-600'}
                  text-white placeholder-gray-400
                  focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/40 outline-none transition`}
                placeholder="Enter dataset name"
              />
              {isCheckingName && (
                <p className="text-sm text-gray-400 mt-1">Checking dataset name...</p>
              )}
              {nameError && (
                <p className="text-sm text-red-400 mt-1">{nameError}</p>
              )}

            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Dataset Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600 
                  text-white placeholder-gray-400
                  focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/40 outline-none transition h-32"
                placeholder="Enter dataset description"
              />
            </div>

            {/* Domain Selection */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Domain
              </label>
              <select
                name="domain"
                value={formData.domain}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600 
                  text-white placeholder-gray-400
                  focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/40 outline-none transition"
              >
                <option value="">Select a domain</option>
                {domains.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>

            {/* Dataset Type */}
            <label className="block text-sm font-medium mb-2 text-white">
              Dataset Type
            </label>
            <div className="flex gap-4">
              {["Raw", "Vectorized", "Both"].map((type) => (
                <button
                  key={type}
                  onClick={() => setDatasetType(type as typeof datasetType)}
                  className={`flex-1 px-4 py-2 rounded-xl border-2 transition-all duration-200 
                    ${datasetType === type
                      ? "bg-cyan-600/80 border-cyan-400 shadow-lg shadow-cyan-500/20"
                      : "bg-gray-700/50 border-gray-600 hover:bg-gray-600/50 hover:border-gray-500"
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Vectorized Settings */}
            {(datasetType === "Vectorized" || datasetType === "Both") && (
              <div className="space-y-4 p-6 bg-gray-750 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-4">
                  Vectorized Settings
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">
                      Dataset Dimensions
                    </label>
                    <input
                      type="number"
                      name="dimensions"
                      value={formData.dimensions || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600 
                        text-white placeholder-gray-400
                        focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/40 outline-none transition"
                      placeholder="Enter dimensions"
                      min="100"        
                      max="5000" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">
                      Vector Database
                    </label>
                    <input
                      type="text"
                      name="vectorDatabase"
                      value={formData.vectorDatabase || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600 
                        text-white placeholder-gray-400
                        focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/40 outline-none transition"
                      placeholder="Enter vector database name"
                      pattern="[A-Za-z]+"
                      title="Only letters are allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* File Type Selection */}
            <label className="block text-sm font-medium mb-2 text-white">
              File Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { type: "Image", icon: Image },
                { type: "Audio", icon: Mic },
                { type: "Text", icon: FileType },
                { type: "Video", icon: Video }
              ].map(({ type, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => setFileType(type as typeof fileType)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
                    ${fileType === type
                      ? "bg-cyan-600/80 border-cyan-400 shadow-lg shadow-cyan-500/20"
                      : "bg-gray-700/50 border-gray-600 hover:bg-gray-600/50 hover:border-gray-500"
                    }`}
                >
                  <Icon className="w-6 h-6 mb-2" />
                  {type}
                </button>
              ))}
            </div>

            {/* File Upload Section */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Upload Dataset
              </label>
              <div className="space-y-4">
                {datasetType === "Both" ? (
                  <>
                    {/* Raw Data Upload */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">
                        Raw Data
                      </label>
                      <input
                        {...fileInputProps}
                        ref={rawInputRef}
                        type="file"
                        onChange={(e) => handleFileInputChange(e, "raw")}
                        accept="*/*"
                      />
                    </div>

                    {/* Vectorized Data Upload */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">
                        Vectorized Data
                      </label>
                      <input
                        {...fileInputProps}
                        ref={vectorizedInputRef}
                        type="file"
                        onChange={(e) => handleFileInputChange(e, "vectorized")}
                        accept="*/*"
                      />
                    </div>
                  </>
                ) : (
                  <input
                    {...fileInputProps}
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) =>
                      handleFileInputChange(
                        e,
                        datasetType.toLowerCase() as "raw" | "vectorized"
                      )
                    }
                    accept="*/*" // Accept all files and handle validation in code
                  />
                )}
              </div>

              {error && (
                <p className="text-sm text-red-400 mt-2">
                  {error}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-400">
                Select a folder containing only {fileType.toLowerCase()} files
              </p>
            </div>

            {/* Upload Progress Bars */}
            {uploadProgress.progress > 0 && (
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Upload Progress</span>
                    <span>{uploadProgress.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        uploadProgress.status === "completed"
                          ? "bg-green-500"
                          : uploadProgress.status === "error"
                          ? "bg-red-500"
                          : "bg-cyan-500"
                      }`}
                      style={{ width: `${uploadProgress.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Display file size */}
            <div className="mt-4 space-y-2">
              {datasetType === "Both" ? (
                <>
                  <p className="text-sm text-gray-400">
                    Raw Data Size: {formatFileSize(totalSize.raw)}
                  </p>
                  <p className="text-sm text-gray-400">
                    Vectorized Data Size: {formatFileSize(totalSize.vectorized)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400">
                  Total Size: {formatFileSize(totalSize[datasetType.toLowerCase() as 'raw' | 'vectorized'])}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-cyan-400 
                text-white font-medium rounded-xl shadow-lg shadow-cyan-500/20 
                hover:from-cyan-600 hover:to-cyan-500 transition-colors
                focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            >
              Upload
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadFile;
