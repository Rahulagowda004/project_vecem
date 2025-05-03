import React, { useState, useRef, FormEvent, useEffect } from "react";
import {
  FileType,
  Image,
  Mic,
  Video,
  ChevronRight,
  User,
  Folder,
} from "lucide-react";
import {
  uploadDataset,
  DatasetForm,
  checkDatasetNameAvailability,
  uploadFolders,
} from "../services/uploadService";
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

interface DatasetForm {
  name: string;
  description: string;
  domain: string;
  license: string;
  dimensions?: number;
  vectorDatabase?: string;
  modelName?: string; // Add this line
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
    license: "",
  });
  const [totalSize, setTotalSize] = useState<{
    raw: number;
    vectorized: number;
  }>({
    raw: 0,
    vectorized: 0,
  });
  const [nameError, setNameError] = useState<string>("");
  const [isCheckingName, setIsCheckingName] = useState<boolean>(false);
  const nameCheckTimeout = useRef<NodeJS.Timeout>();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{
    files: FileList | null;
    type: "raw" | "vectorized";
    isFolderUpload?: boolean;
    info?: {
      count?: number;
      size?: number;
      description?: string;
    };
  } | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{
    show: boolean;
    success: boolean;
    message: string;
  }>({ show: false, success: false, message: "" });
  const [userProfile, setUserProfile] = useState<{ username: string } | null>(
    null
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [folderContents, setFolderContents] = useState<{
    raw: File[];
    vectorized: File[];
  }>({
    raw: [],
    vectorized: [],
  });
  const rawFolderInputRef = useRef<HTMLInputElement>(null);
  const vectorizedFolderInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const licenses = [
    "CC0 1.0 Universal (Public Domain Dedication)",
    "Creative Commons Attribution 4.0 International (CC BY 4.0)",
    "Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)",
    "Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)",
    "Creative Commons Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)",
    "Open Data Commons Public Domain Dedication and License (PDDL)",
    "Open Data Commons Attribution License (ODC-By)",
    "Open Data Commons Open Database License (ODbL)",
    "MIT License (for datasets with code)",
    "Apache License 2.0 (optional for datasets + software tools)",
    "Proprietary License (Custom Terms)",
    "Research-Only License (for datasets restricted to academic or research use)",
    "No License (All rights reserved)"
  ];

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
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/msword",
      ],
      extensions: [".txt", ".csv", ".json", ".pdf", ".docx", ".xlsx", ".doc"],
    },
  };

  // Remove folderMode state as we'll detect automatically
  const [selectedUploadTypes, setSelectedUploadTypes] = useState<{
    raw: "files" | "folders" | null;
    vectorized: "files" | "folders" | null;
  }>({
    raw: null,
    vectorized: null,
  });

  // Update handleFileInputChange to set upload type to files
  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "raw" | "vectorized"
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setError("Please select files");
      return;
    }

    // Create a new FileList-like object with the files
    const filesArray = Array.from(files);
    const filteredFiles = new DataTransfer();
    filesArray.forEach((file) => filteredFiles.items.add(file));

    setSelectedFiles({
      files: filteredFiles.files,
      type,
    });

    // Update selected upload type
    setSelectedUploadTypes((prev) => ({
      ...prev,
      [type]: "files",
    }));

    setShowConfirmation(true);
  };

  // Function to handle folder selection
  const handleFolderSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "raw" | "vectorized"
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setError("Please select a folder containing files");
      return;
    }

    const filesArray = Array.from(files);

    // Group files by their top-level folders
    const folderGroups: { [folderName: string]: File[] } = {};
    filesArray.forEach((file) => {
      const path = file.webkitRelativePath;
      const topFolder = path.split("/")[0]; // Get top-level folder name

      if (!folderGroups[topFolder]) {
        folderGroups[topFolder] = [];
      }
      folderGroups[topFolder].push(file);
    });

    // Update the folder contents for the appropriate type
    if (type === "raw") {
      // Add to existing files rather than replacing them
      setFolderContents((prev) => ({
        ...prev,
        raw: [...prev.raw, ...filesArray],
      }));
    } else {
      setFolderContents((prev) => ({
        ...prev,
        vectorized: [...prev.vectorized, ...filesArray],
      }));
    }

    // Update selected upload type
    setSelectedUploadTypes((prev) => ({
      ...prev,
      [type]: "folders",
    }));

    setError("");

    // Calculate total size and file count for the confirmation dialog
    const totalSize = filesArray.reduce((sum, file) => sum + file.size, 0);
    const filesCount = filesArray.length;
    const folderCount = Object.keys(folderGroups).length;

    // Create a readable description of the folders
    const foldersDescription = Object.entries(folderGroups)
      .map(([folder, files]) => `${folder} (${files.length} files)`)
      .join(", ");

    setSelectedFiles({
      files: files,
      type,
      isFolderUpload: true,
      info: {
        count: filesCount,
        size: totalSize,
        description: foldersDescription,
      },
    });

    // Show folder selection summary
    console.log(
      `Selected ${folderCount} folders with ${filesCount} files for ${type} data`
    );
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
    setTotalSize((prev) => ({
      ...prev,
      [type]: totalBytes,
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
    return name.replace(/\s+/g, "_");
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
      setNameError(
        error instanceof Error ? error.message : "Error checking dataset name"
      );
    } finally {
      setIsCheckingName(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedName = formatDatasetName(e.target.value);
    setFormData({
      ...formData,
      name: formattedName,
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
    setIsUploading(true);

    // Validate all mandatory fields
    const mandatoryFields = {
      name: "Dataset name",
      description: "Dataset description",
      domain: "Domain",
    };

    // Additional mandatory fields for vectorized data
    if (datasetType === "Vectorized" || datasetType === "Both") {
      Object.assign(mandatoryFields, {
        modelName: "Model name",
        dimensions: "Dataset dimensions",
        vectorDatabase: "Vector database",
      });
    }

    // Check for empty mandatory fields
    for (const [field, label] of Object.entries(mandatoryFields)) {
      if (!formData[field as keyof DatasetForm]) {
        setError(`${label} is required`);
        setIsUploading(false);
        return;
      }
    }

    // Validate file or folder selection
    let hasFiles = false;

    // Check for folder uploads
    if (
      datasetType === "Both" &&
      folderContents.raw.length > 0 &&
      folderContents.vectorized.length > 0
    ) {
      hasFiles = true;
    } else {
      if (datasetType === "Raw" && folderContents.raw.length > 0)
        hasFiles = true;
      if (datasetType === "Vectorized" && folderContents.vectorized.length > 0)
        hasFiles = true;
    }

    if (!hasFiles) {
      setError(
        `Please select ${fileType.toLowerCase()} ${
          folderContents.raw.length > 0 || folderContents.vectorized.length > 0
            ? "folders"
            : "files"
        } to upload`
      );
      setIsUploading(false);
      return;
    }

    // Check if dataset name already exists
    try {
      const nameCheckResult = await checkDatasetNameAvailability(formData.name);
      if (!nameCheckResult.available) {
        setError("Dataset name already exists. Please use a different name.");
        setIsUploading(false);
        return;
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error checking dataset name"
      );
      setIsUploading(false);
      return;
    }

    // Continue with upload logic
    try {
      let result;
      const datasetId = `${formData.name}_${Date.now()}`;
      const datasetInfoWithId = {
        ...formData,
        datasetId,
        file_type: fileType.toLowerCase(),
        // Add vectorized settings to the dataset info
        model_name: formData.modelName,
        dimensions: parseInt(formData.dimensions as string),
        vector_database: formData.vectorDatabase,
      };

      if (
        folderContents.raw.length > 0 ||
        folderContents.vectorized.length > 0
      ) {
        // Handle folder upload
        result = await uploadFolders(
          {
            raw: folderContents.raw,
            vectorized: folderContents.vectorized,
          },
          datasetType.toLowerCase() as "raw" | "vectorized" | "both",
          datasetInfoWithId
        );
      } else {
        // Handle file upload (existing logic)
        if (datasetType === "Both") {
          const rawFiles = rawInputRef.current?.files;
          const vectorizedFiles = vectorizedInputRef.current?.files;

          if (!rawFiles?.length && !vectorizedFiles?.length) {
            setError(`Please select ${fileType.toLowerCase()} files to upload`);
            setIsUploading(false);
            return;
          }

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
            setIsUploading(false);
            return;
          }

          result = await uploadDataset(
            datasetType.toLowerCase() === "raw" ? files : null,
            datasetType.toLowerCase() === "vectorized" ? files : null,
            datasetType.toLowerCase() as "raw" | "vectorized",
            datasetInfoWithId
          );
        }
      }

      if (result?.success) {
        setUploadProgress({ progress: 100, status: "completed" });
        setUploadStatus({
          show: true,
          success: true,
          message: "Dataset uploaded successfully!",
        });

        // Wait for 4 seconds, then redirect to user profile
        setTimeout(() => {
          if (userProfile?.username) {
            navigate(`/${userProfile.username}`);
          }
          setIsUploading(false); // Reset uploading state after redirect
        }, 2000);
      } else {
        setUploadProgress({ progress: 0, status: "error" });
        setError(result?.message || "Upload failed");
        setUploadStatus({
          show: true,
          success: false,
          message: result?.message || "Failed to upload dataset",
        });

        // Hide error message after 4 seconds
        setTimeout(() => {
          setUploadStatus({ show: false, success: false, message: "" });
          setIsUploading(false); // Reset uploading state after error message
        }, 2000);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadProgress({ progress: 0, status: "error" });
      setUploadStatus({
        show: true,
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to upload dataset",
      });
      setError(
        error instanceof Error ? error.message : "Failed to upload dataset"
      );

      // Hide error message after 4 seconds
      setTimeout(() => {
        setUploadStatus({ show: false, success: false, message: "" });
        setIsUploading(false); // Reset uploading state after error message
      }, 4000);
    }
  };

  // Add helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Add confirmation dialog component
  const ConfirmationDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold mb-4">
          Confirm {selectedFiles?.isFolderUpload ? "Folder" : "File"} Upload
        </h3>
        <div className="mb-4">
          {selectedFiles?.isFolderUpload ? (
            <div className="space-y-2">
              <p className="text-gray-300">
                Selected {selectedFiles.info?.count} files
              </p>
              <p className="text-gray-400 text-sm">
                Size: {formatFileSize(selectedFiles.info?.size || 0)}
              </p>
              <p className="text-gray-400 text-sm">
                Folders: {selectedFiles.info?.description}
              </p>
            </div>
          ) : (
            <p className="text-gray-300">
              {selectedFiles?.files?.length} files selected
            </p>
          )}
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => {
              setShowConfirmation(false);
              // Clear the file input
              if (selectedFiles?.type === "raw") {
                if (rawFolderInputRef.current) {
                  rawFolderInputRef.current.value = "";
                  setFolderContents((prev) => ({ ...prev, raw: [] }));
                } else if (rawInputRef.current) {
                  rawInputRef.current.value = "";
                }
              } else if (selectedFiles?.type === "vectorized") {
                if (vectorizedFolderInputRef.current) {
                  vectorizedFolderInputRef.current.value = "";
                  setFolderContents((prev) => ({ ...prev, vectorized: [] }));
                } else if (vectorizedInputRef.current) {
                  vectorizedInputRef.current.value = "";
                }
              } else {
                if (folderInputRef.current) {
                  folderInputRef.current.value = "";
                  if (selectedFiles?.type === "raw") {
                    setFolderContents((prev) => ({ ...prev, raw: [] }));
                  } else {
                    setFolderContents((prev) => ({ ...prev, vectorized: [] }));
                  }
                } else if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
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
                if (selectedFiles.isFolderUpload) {
                  // For folder uploads, we've already processed the files
                  // Just continue with the rest of the flow
                } else {
                  // For file uploads, use existing handleFileChange
                  handleFileChange(selectedFiles.files, selectedFiles.type);
                }
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
            {uploadStatus.success ? "Success!" : "Upload Failed"}
          </h3>
          <p className="text-lg text-gray-200">{uploadStatus.message}</p>
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
    className:
      "w-full px-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/40 outline-none transition text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 file:transition-colors",
    multiple: true,
  };

  // Add folder input properties
  const folderInputProps = {
    className:
      "w-full px-4 py-2 rounded-xl bg-gray-700/50 border border-gray-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/40 outline-none transition text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 file:transition-colors",
    multiple: true,
  };

  // Create a function to correctly apply folder input attributes
  const applyFolderAttributes = (
    inputRef: React.RefObject<HTMLInputElement>
  ) => {
    if (inputRef.current) {
      // Set webkitdirectory as a boolean property rather than a string attribute
      inputRef.current.webkitdirectory = true;
    }
  };

  useEffect(() => {
    // Apply the webkitdirectory attribute to all folder input refs
    applyFolderAttributes(rawFolderInputRef);
    applyFolderAttributes(vectorizedFolderInputRef);
    applyFolderAttributes(folderInputRef);
  }, []);

  // Additionally set webkitdirectory whenever selectedUploadTypes changes
  useEffect(() => {
    if (selectedUploadTypes.raw === "folders") {
      applyFolderAttributes(rawFolderInputRef);
    }
    if (selectedUploadTypes.vectorized === "folders") {
      applyFolderAttributes(vectorizedFolderInputRef);
    }
  }, [selectedUploadTypes]);

  useEffect(() => {
    // Set initial upload types based on datasetType to avoid null states
    if (
      selectedUploadTypes.raw === null ||
      selectedUploadTypes.vectorized === null
    ) {
      setSelectedUploadTypes({
        raw: "folders", // Default to folders for better UX
        vectorized: "folders", // Default to folders for better UX
      });
    }
  }, [datasetType]);

  // Create a specialized FolderInput component for selecting folders
  // This will replace our existing implementation
  const FolderInput = React.forwardRef<
    HTMLInputElement,
    {
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
      className?: string;
    }
  >((props, ref) => {
    return (
      <input
        type="file"
        ref={ref}
        onChange={props.onChange}
        onClick={props.onClick}
        className={props.className}
        // Set attributes directly in HTML to ensure browser compatibility
        webkitdirectory="true"
        directory="true"
        mozdirectory="true"
        multiple
      />
    );
  });

  return (
    <div className="min-h-screen h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {showConfirmation && <ConfirmationDialog />}
      {uploadStatus.show && <StatusMessage />}
      <div className="min-h-screen h-full w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 mobile-safe-padding">
        {/* Mobile-optimized breadcrumb navigation */}
        <nav className="flex flex-wrap items-center gap-2 sm:gap-0 mb-4 sm:mb-6 text-sm text-gray-400">
          {userProfile?.username ? (
            <Link
              to={`/${userProfile.username}`}
              className="flex items-center hover:text-cyan-400 transition-colors min-h-[44px]"
            >
              <User className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="break-all">{userProfile.username}</span>
            </Link>
          ) : (
            <span className="flex items-center min-h-[44px]">
              <User className="w-4 h-4 mr-1 flex-shrink-0" />
              Loading...
            </span>
          )}
          <ChevronRight className="w-4 h-4 mx-1 sm:mx-2 flex-shrink-0" />
          <span className="text-white min-h-[44px] flex items-center">Upload Dataset</span>
        </nav>

        <div className="min-h-[calc(100vh-6rem)] bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-gray-700/50 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent mb-4 sm:mb-6">
            Data Specifications
          </h1>
          <h5 className="text-white text-center items-center mb-6 sm:mb-8 text-sm sm:text-base">
            Specify your dataset, select the format, ensure compatibility, and track uploads in real time.
          </h5>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Dataset Name */}
            <div>
              <label className="block text-sm font-medium mb-1.5 sm:mb-2 text-white">
                Dataset Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                required
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gray-700/50 border 
                  ${nameError ? "border-red-500" : "border-gray-600"}
                  text-white placeholder-gray-400 min-h-[44px]
                  focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/40 outline-none transition`}
                placeholder="Enter dataset name"
              />
              {/* ...existing name error and checking states... */}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1.5 sm:mb-2 text-white">
                Dataset Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gray-700/50 border border-gray-600 
                  text-white placeholder-gray-400
                  focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/40 outline-none transition h-24 sm:h-32"
                placeholder="Enter dataset description"
              />
            </div>

            {/* Domain and License in a responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Domain Selection */}
              <div>
                <label className="block text-sm font-medium mb-1.5 sm:mb-2 text-white">
                  Domain
                </label>
                <select
                  name="domain"
                  value={formData.domain}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gray-700/50 border border-gray-600 
                    text-white placeholder-gray-400 min-h-[44px]
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

              {/* License Selection */}
              <div>
                <label className="block text-sm font-medium mb-1.5 sm:mb-2 text-white">
                  License
                </label>
                <select
                  name="license"
                  value={formData.license}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gray-700/50 border border-gray-600 
                    text-white placeholder-gray-400 min-h-[44px]
                    focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/40 outline-none transition"
                >
                  <option value="">Select a License</option>
                  {licenses.map((license) => (
                    <option key={license} value={license}>
                      {license}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dataset Type */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                Dataset Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {["Raw", "Vectorized", "Both"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDatasetType(type as typeof datasetType)}
                    className={`flex items-center justify-center px-4 py-2.5 rounded-xl border-2 transition-all duration-200 min-h-[44px]
                      ${
                        datasetType === type
                          ? "bg-cyan-600/80 border-cyan-400 shadow-lg shadow-cyan-500/20"
                          : "bg-gray-700/50 border-gray-600 hover:bg-gray-600/50 hover:border-gray-500"
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* File Type Selection */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">
                File Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { type: "Image", icon: Image },
                  { type: "Audio", icon: Mic },
                  { type: "Text", icon: FileType },
                  { type: "Video", icon: Video },
                ].map(({ type, icon: Icon }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFileType(type as typeof fileType)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 min-h-[44px]
                      ${
                        fileType === type
                          ? "bg-cyan-600/80 border-cyan-400 shadow-lg shadow-cyan-500/20"
                          : "bg-gray-700/50 border-gray-600 hover:bg-gray-600/50 hover:border-gray-500"
                      }`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 mb-2" />
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Vectorized Settings Panel */}
            {(datasetType === "Vectorized" || datasetType === "Both") && (
              <div className="space-y-4 p-4 sm:p-6 bg-gray-750 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium text-white mb-4">
                  Vectorized Settings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 sm:mb-2 text-white">
                      Model Name
                    </label>
                    <input
                      type="text"
                      name="modelName"
                      value={formData.modelName || ""}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gray-700/50 border border-gray-600 
                        text-white placeholder-gray-400 min-h-[44px]
                        focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/40 outline-none transition"
                      placeholder="Enter model name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 sm:mb-2 text-white">
                      Dataset Dimensions
                    </label>
                    <input
                      type="number"
                      name="dimensions"
                      value={formData.dimensions || ""}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gray-700/50 border border-gray-600 
                        text-white placeholder-gray-400 min-h-[44px]
                        focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/40 outline-none transition"
                      placeholder="Enter dimensions"
                      min="100"
                      max="5000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 sm:mb-2 text-white">
                      Vector Database
                    </label>
                    <input
                      type="text"
                      name="vectorDatabase"
                      value={formData.vectorDatabase || ""}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gray-700/50 border border-gray-600 
                        text-white placeholder-gray-400 min-h-[44px]
                        focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/40 outline-none transition"
                      placeholder="Enter database name"
                      pattern="[A-Za-z]+"
                      title="Only letters are allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* File Upload Section with improved mobile layout */}
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
                        Raw Data{" "}
                        {selectedUploadTypes.raw === "folders"
                          ? "Folders"
                          : "Files"}
                      </label>
                      <div className="flex items-center gap-3 mb-2">
                        <button
                          type="button"
                          onClick={() => {
                            // Clear any existing selection
                            setFolderContents((prev) => ({ ...prev, raw: [] }));
                            setSelectedUploadTypes((prev) => ({
                              ...prev,
                              raw: "files",
                            }));
                            if (rawFolderInputRef.current)
                              rawFolderInputRef.current.value = "";
                            if (rawInputRef.current)
                              rawInputRef.current.value = "";
                          }}
                          className={`text-xs px-3 py-1 rounded-full 
                            ${
                              selectedUploadTypes.raw !== "folders"
                                ? "bg-cyan-600/80 text-white"
                                : "bg-gray-700 text-gray-300"
                            }`}
                        >
                          Files
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Clear any existing selection
                            setFolderContents((prev) => ({ ...prev, raw: [] }));
                            setSelectedUploadTypes((prev) => ({
                              ...prev,
                              raw: "folders",
                            }));
                            if (rawFolderInputRef.current)
                              rawFolderInputRef.current.value = "";
                            if (rawInputRef.current)
                              rawInputRef.current.value = "";
                          }}
                          className={`text-xs px-3 py-1 rounded-full 
                            ${
                              selectedUploadTypes.raw === "folders"
                                ? "bg-cyan-600/80 text-white"
                                : "bg-gray-700 text-gray-300"
                            }`}
                        >
                          Folders
                        </button>
                      </div>

                      {selectedUploadTypes.raw === "folders" ? (
                        <label className="block">
                          <span className="sr-only">Choose Folders</span>
                          <FolderInput
                            ref={rawFolderInputRef}
                            onChange={(e) => handleFolderSelect(e, "raw")}
                            onClick={(e) => {
                              const element = e.target as HTMLInputElement;
                              element.value = "";
                            }}
                            className={folderInputProps.className + " hidden"}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (rawFolderInputRef.current)
                                rawFolderInputRef.current.click();
                            }}
                            className="w-full px-4 py-2 rounded-xl bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition-colors"
                          >
                            Choose Folders
                          </button>
                        </label>
                      ) : (
                        <label className="block">
                          <span className="sr-only">Choose Files</span>
                          <input
                            {...fileInputProps}
                            type="file"
                            ref={rawInputRef}
                            onChange={(e) => handleFileInputChange(e, "raw")}
                            onClick={(e) => {
                              const element = e.target as HTMLInputElement;
                              element.value = "";
                            }}
                            accept={fileTypeMap[fileType].extensions.join(",")}
                            className={fileInputProps.className + " hidden"}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (rawInputRef.current) rawInputRef.current.click();
                            }}
                            className="w-full px-4 py-2 rounded-xl bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition-colors"
                          >
                            Choose Files
                          </button>
                        </label>
                      )}
                    </div>

                    {/* Vectorized Data Upload */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">
                        Vectorized Data{" "}
                        {selectedUploadTypes.vectorized === "folders"
                          ? "Folders"
                          : "Files"}
                      </label>
                      <div className="flex items-center gap-3 mb-2">
                        <button
                          type="button"
                          onClick={() => {
                            // Clear any existing selection
                            setFolderContents((prev) => ({
                              ...prev,
                              vectorized: [],
                            }));
                            setSelectedUploadTypes((prev) => ({
                              ...prev,
                              vectorized: "files",
                            }));
                            if (vectorizedFolderInputRef.current)
                              vectorizedFolderInputRef.current.value = "";
                            if (vectorizedInputRef.current)
                              vectorizedInputRef.current.value = "";
                          }}
                          className={`text-xs px-3 py-1 rounded-full 
                            ${
                              selectedUploadTypes.vectorized !== "folders"
                                ? "bg-cyan-600/80 text-white"
                                : "bg-gray-700 text-gray-300"
                            }`}
                        >
                          Files
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Clear any existing selection
                            setFolderContents((prev) => ({
                              ...prev,
                              vectorized: [],
                            }));
                            setSelectedUploadTypes((prev) => ({
                              ...prev,
                              vectorized: "folders",
                            }));
                            if (vectorizedFolderInputRef.current)
                              vectorizedFolderInputRef.current.value = "";
                            if (vectorizedInputRef.current)
                              vectorizedInputRef.current.value = "";
                          }}
                          className={`text-xs px-3 py-1 rounded-full 
                            ${
                              selectedUploadTypes.vectorized === "folders"
                                ? "bg-cyan-600/80 text-white"
                                : "bg-gray-700 text-gray-300"
                            }`}
                        >
                          Folders
                        </button>
                      </div>

                      {selectedUploadTypes.vectorized === "folders" ? (
                        <label className="block">
                          <span className="sr-only">Choose Folders</span>
                          <FolderInput
                            ref={vectorizedFolderInputRef}
                            onChange={(e) => handleFolderSelect(e, "vectorized")}
                            onClick={(e) => {
                              const element = e.target as HTMLInputElement;
                              element.value = "";
                            }}
                            className={folderInputProps.className + " hidden"}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (vectorizedFolderInputRef.current)
                                vectorizedFolderInputRef.current.click();
                            }}
                            className="w-full px-4 py-2 rounded-xl bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition-colors"
                          >
                            Choose Folders
                          </button>
                        </label>
                      ) : (
                        <label className="block">
                          <span className="sr-only">Choose Files</span>
                          <input
                            {...fileInputProps}
                            type="file"
                            ref={vectorizedInputRef}
                            onChange={(e) =>
                              handleFileInputChange(e, "vectorized")
                            }
                            onClick={(e) => {
                              const element = e.target as HTMLInputElement;
                              element.value = "";
                            }}
                            accept={fileTypeMap[fileType].extensions.join(",")}
                            className={fileInputProps.className + " hidden"}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (vectorizedInputRef.current)
                                vectorizedInputRef.current.click();
                            }}
                            className="w-full px-4 py-2 rounded-xl bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition-colors"
                          >
                            Choose Files
                          </button>
                        </label>
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        type="button"
                        onClick={() => {
                          // Clear any existing selection
                          const type = datasetType.toLowerCase() as
                            | "raw"
                            | "vectorized";
                          setFolderContents((prev) => ({
                            ...prev,
                            [type]: [],
                          }));
                          setSelectedUploadTypes((prev) => ({
                            ...prev,
                            [type]: "files",
                          }));
                          if (folderInputRef.current)
                            folderInputRef.current.value = "";
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        className={`text-xs px-3 py-1 rounded-full 
                          ${
                            selectedUploadTypes[
                              datasetType.toLowerCase() as "raw" | "vectorized"
                            ] !== "folders"
                              ? "bg-cyan-600/80 text-white"
                              : "bg-gray-700 text-gray-300"
                          }`}
                      >
                        Files
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          // Clear any existing selection
                          const type = datasetType.toLowerCase() as
                            | "raw"
                            | "vectorized";
                          setFolderContents((prev) => ({
                            ...prev,
                            [type]: [],
                          }));
                          setSelectedUploadTypes((prev) => ({
                            ...prev,
                            [type]: "folders",
                          }));
                          if (folderInputRef.current)
                            folderInputRef.current.value = "";
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        className={`text-xs px-3 py-1 rounded-full 
                          ${
                            selectedUploadTypes[
                              datasetType.toLowerCase() as "raw" | "vectorized"
                            ] === "folders"
                              ? "bg-cyan-600/80 text-white"
                              : "bg-gray-700 text-gray-300"
                          }`}
                      >
                        Folders
                      </button>
                    </div>

                    {selectedUploadTypes[
                      datasetType.toLowerCase() as "raw" | "vectorized"
                    ] === "folders" ? (
                      <label className="block">
                        <span className="sr-only">Choose Folders</span>
                        <FolderInput
                          ref={folderInputRef}
                          onChange={(e) =>
                            handleFolderSelect(
                              e,
                              datasetType.toLowerCase() as "raw" | "vectorized"
                            )
                          }
                          onClick={(e) => {
                            const element = e.target as HTMLInputElement;
                            element.value = "";
                          }}
                          className={folderInputProps.className + " hidden"}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (folderInputRef.current)
                              folderInputRef.current.click();
                          }}
                          className="w-full px-4 py-2 rounded-xl bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition-colors"
                        >
                          Choose Folders
                        </button>
                      </label>
                    ) : (
                      <label className="block">
                        <span className="sr-only">Choose Files</span>
                        <input
                          {...fileInputProps}
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) =>
                            handleFileInputChange(
                              e,
                              datasetType.toLowerCase() as "raw" | "vectorized"
                            )
                          }
                          onClick={(e) => {
                            const element = e.target as HTMLInputElement;
                            element.value = "";
                          }}
                          accept={
                            datasetType.toLowerCase() === "raw"
                              ? fileTypeMap[fileType].extensions.join(",")
                              : undefined
                          }
                          className={fileInputProps.className + " hidden"}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (fileInputRef.current) fileInputRef.current.click();
                          }}
                          className="w-full px-4 py-2 rounded-xl bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition-colors"
                        >
                          Choose Files
                        </button>
                      </label>
                    )}
                  </div>
                )}
              </div>

              {/* Error message */}
              {error && <p className="text-sm text-red-400 mt-2">{error}</p>}

              {/* Help text */}
              <p className="mt-2 text-sm text-gray-400">
                {folderContents.raw.length > 0 ||
                folderContents.vectorized.length > 0
                  ? `Selected folders will be used for ${
                      datasetType.toLowerCase() === "vectorized"
                        ? "vectorized data"
                        : fileType.toLowerCase() + " files"
                    }.`
                  : datasetType === "Vectorized"
                  ? "Select files containing vectorized data"
                  : `Select ${fileType.toLowerCase()} files to upload`}
              </p>

              {(folderContents.raw.length > 0 ||
                folderContents.vectorized.length > 0) && (
                <div className="mt-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-cyan-400">
                      Selected Folders
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        // Clear selected folders for the current type
                        const type =
                          datasetType.toLowerCase() === "vectorized"
                            ? "vectorized"
                            : "raw";
                        setFolderContents((prev) => ({
                          ...prev,
                          [type]: [],
                        }));

                        // Reset associated input
                        if (type === "raw" && rawFolderInputRef.current) {
                          rawFolderInputRef.current.value = "";
                        } else if (
                          type === "vectorized" &&
                          vectorizedFolderInputRef.current
                        ) {
                          vectorizedFolderInputRef.current.value = "";
                        } else if (folderInputRef.current) {
                          folderInputRef.current.value = "";
                        }
                      }}
                      className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-gray-300 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    {(() => {
                      // Calculate folder stats
                      const files =
                        folderContents[
                          datasetType.toLowerCase() === "vectorized"
                            ? "vectorized"
                            : "raw"
                        ];
                      const folders: { [key: string]: number } = {};

                      files.forEach((file) => {
                        const folderPath =
                          file.webkitRelativePath.split("/")[0];
                        folders[folderPath] = (folders[folderPath] || 0) + 1;
                      });

                      return Object.entries(folders).map(([folder, count]) => (
                        <div
                          key={folder}
                          className="flex items-center justify-between py-1 border-b border-gray-600 last:border-0"
                        >
                          <span className="text-sm text-gray-300">
                            {folder}
                          </span>
                          <span className="text-xs bg-gray-600 px-2 py-0.5 rounded-full text-gray-300">
                            {count} files
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-cyan-400 
                text-white font-medium rounded-xl shadow-lg shadow-cyan-500/20 
                hover:from-cyan-600 hover:to-cyan-500 transition-colors min-h-[44px]
                focus:outline-none focus:ring-2 focus:ring-cyan-500/40
                disabled:from-gray-500 disabled:to-gray-400 disabled:cursor-not-allowed"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadFile;
