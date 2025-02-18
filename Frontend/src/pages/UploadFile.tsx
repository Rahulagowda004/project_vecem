import React, { useState, useRef, FormEvent } from "react";
import {
  FileType,
  Image,
  Mic,
  Video,
  Upload as UploadIcon,
} from "lucide-react";
import { uploadDataset, DatasetForm } from "../services/uploadService";

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
    Image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    Audio: ["audio/mpeg", "audio/wav", "audio/ogg"],
    Video: ["video/mp4", "video/webm", "video/ogg"],
    Text: ["text/plain", "text/csv", "application/json"],
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "raw" | "vectorized"
  ) => {
    setError("");
    const files = event.target.files;

    if (!files || files.length === 0) return;

    const allowedTypes = fileTypeMap[fileType];
    const filesArray = Array.from(files);
    const invalidFiles = filesArray.filter(
      (file) => !allowedTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      setError(
        `Invalid file types detected. All files must be ${fileType.toLowerCase()} files.`
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Initialize progress tracking for the folder
    setUploadProgress({ progress: 0, status: "uploading" });

    // Simulate upload progress for demo
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Please provide a dataset name");
      return;
    }

    try {
      if (datasetType === "Both") {
        const rawFiles = rawInputRef.current?.files;
        const vectorizedFiles = vectorizedInputRef.current?.files;

        if (!rawFiles?.length && !vectorizedFiles?.length) {
          setError(`Please select ${fileType.toLowerCase()} files to upload`);
          return;
        }

        const datasetId = `${formData.name}_${Date.now()}`;
        const result = await uploadDataset(rawFiles, vectorizedFiles, "both", {
          ...formData,
          datasetId,
          file_type: fileType.toLowerCase(),
        });

        if (!result?.success) {
          setError(result?.message || "Upload failed");
        }
      } else {
        const inputRef = fileInputRef.current;
        if (!inputRef?.files?.length) {
          setError(`Please select ${fileType.toLowerCase()} files to upload`);
          return;
        }
        await uploadDataset(
          datasetType.toLowerCase() === "raw" ? inputRef.files : null,
          datasetType.toLowerCase() === "vectorized" ? inputRef.files : null,
          datasetType.toLowerCase() as "raw" | "vectorized",
          { ...formData, file_type: fileType.toLowerCase() }
        );
      }
    } catch (error) {
      console.error("Submission error:", error);
      setError("Failed to upload dataset");
    }
  };

  return (
    <div className="min-h-screen h-full bg-gray-900 text-gray-100">
      <div className="min-h-screen h-full w-full max-w-7xl mx-auto px-8 py-6 md:py-8">
        <div className="min-h-[calc(100vh-4rem)] bg-gray-800 rounded-lg shadow-xl p-6 md:p-8 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-6 text-center text-indigo-400">
            Dataset Information
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Dataset Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                placeholder="Enter dataset name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Dataset Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition h-32"
                placeholder="Enter dataset description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Dataset Type
              </label>
              <div className="flex gap-4">
                {["Raw", "Vectorized", "Both"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDatasetType(type as typeof datasetType)}
                    className={`flex-1 px-4 py-2 rounded-md border transition ${
                      datasetType === type
                        ? "bg-indigo-600 border-indigo-500"
                        : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {(datasetType === "Vectorized" || datasetType === "Both") && (
              <div className="space-y-4 p-6 bg-gray-750 rounded-lg border border-gray-700">
                <h3 className="text-lg font-medium text-gray-100 mb-4">
                  Vectorized Settings
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-100">
                      Dataset Dimensions
                    </label>
                    <input
                      type="number"
                      name="dimensions"
                      value={formData.dimensions || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                      placeholder="Enter dimensions"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-100">
                      Vector Database
                    </label>
                    <input
                      type="text"
                      name="vectorDatabase"
                      value={formData.vectorDatabase || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                      placeholder="Enter vector database name"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Domain</label>
              <select
                name="domain"
                value={formData.domain}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
              >
                <option value="">Select a domain</option>
                {domains.map((domain) => (
                  <option key={domain} value={domain.toLowerCase()}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                File Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  type="button"
                  onClick={() => setFileType("Image")}
                  className={`flex flex-col items-center justify-center p-4 rounded-md border transition ${
                    fileType === "Image"
                      ? "bg-indigo-600 border-indigo-500"
                      : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                  }`}
                >
                  <Image className="w-6 h-6 mb-2" />
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => setFileType("Audio")}
                  className={`flex flex-col items-center justify-center p-4 rounded-md border transition ${
                    fileType === "Audio"
                      ? "bg-indigo-600 border-indigo-500"
                      : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                  }`}
                >
                  <Mic className="w-6 h-6 mb-2" />
                  Audio
                </button>
                <button
                  type="button"
                  onClick={() => setFileType("Text")}
                  className={`flex flex-col items-center justify-center p-4 rounded-md border transition ${
                    fileType === "Text"
                      ? "bg-indigo-600 border-indigo-500"
                      : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                  }`}
                >
                  <FileType className="w-6 h-6 mb-2" />
                  Text
                </button>
                <button
                  type="button"
                  onClick={() => setFileType("Video")}
                  className={`flex flex-col items-center justify-center p-4 rounded-md border transition ${
                    fileType === "Video"
                      ? "bg-indigo-600 border-indigo-500"
                      : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                  }`}
                >
                  <Video className="w-6 h-6 mb-2" />
                  Video
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Upload Dataset
              </label>
              <div className="space-y-4">
                {datasetType === "Both" ? (
                  <>
                    {/* Raw Data Upload */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-100">
                        Raw Data
                      </label>
                      <input
                        ref={rawInputRef}
                        type="file"
                        onChange={(e) => handleFileChange(e, "raw")}
                        className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                        accept={fileTypeMap[fileType].join(",")}
                        multiple
                        directory=""
                        webkitdirectory=""
                      />
                    </div>

                    {/* Vectorized Data Upload */}
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-100">
                        Vectorized Data
                      </label>
                      <input
                        ref={vectorizedInputRef}
                        type="file"
                        onChange={(e) => handleFileChange(e, "vectorized")}
                        className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                        accept={fileTypeMap[fileType].join(",")}
                        multiple
                        directory=""
                        webkitdirectory=""
                      />
                    </div>
                  </>
                ) : (
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) =>
                      handleFileChange(
                        e,
                        datasetType.toLowerCase() as "raw" | "vectorized"
                      )
                    }
                    className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                    accept={fileTypeMap[fileType].join(",")}
                    multiple
                    directory=""
                    webkitdirectory=""
                  />
                )}

                {/* Upload Progress Bars */}
                {uploadProgress.progress > 0 && (
                  <div className="space-y-4">
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
                              : "bg-indigo-500"
                          }`}
                          style={{ width: `${uploadProgress.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
              <p className="mt-2 text-sm text-gray-400">
                Select a folder containing only {fileType.toLowerCase()} files
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-md font-medium transition"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadFile;
