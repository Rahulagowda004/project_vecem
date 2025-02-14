import React, { useState, useRef } from "react";
import { FileType, Image, Mic, Video } from "lucide-react";

type HTMLInputElementWithDirectory = HTMLInputElement & {
  webkitdirectory: boolean;
  directory: string;
};

function UploadFile() {
  const [datasetType, setDatasetType] = useState<"Raw" | "Vectorized">("Raw");
  const [fileType, setFileType] = useState<
    "Image" | "Audio" | "Text" | "Video"
  >("Text");
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElementWithDirectory>(null);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const files = event.target.files;

    if (!files || files.length === 0) return;

    const allowedTypes = fileTypeMap[fileType];
    const invalidFiles = Array.from(files).filter(
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

    // If we reach here, all files are valid
    console.log(
      `Selected ${files.length} valid ${fileType.toLowerCase()} files`
    );
  };

  return (
    <div className="min-h-screen h-full bg-gray-900 text-gray-100">
      <div className="min-h-screen h-full w-full max-w-7xl mx-auto px-8 py-6 md:py-8">
        <div className="min-h-[calc(100vh-4rem)] bg-gray-800 rounded-lg shadow-xl p-6 md:p-8 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">
            Dataset Information
          </h1>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Dataset Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                placeholder="Enter dataset name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Dataset Description
              </label>
              <textarea
                className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition h-32"
                placeholder="Enter dataset description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Dataset Type
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setDatasetType("Raw")}
                  className={`flex-1 px-4 py-2 rounded-md border transition ${
                    datasetType === "Raw"
                      ? "bg-blue-600 border-blue-500"
                      : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                  }`}
                >
                  Raw
                </button>
                <button
                  type="button"
                  onClick={() => setDatasetType("Vectorized")}
                  className={`flex-1 px-4 py-2 rounded-md border transition ${
                    datasetType === "Vectorized"
                      ? "bg-blue-600 border-blue-500"
                      : "bg-gray-700 border-gray-600 hover:bg-gray-600"
                  }`}
                >
                  Vectorized
                </button>
              </div>
            </div>

            {datasetType === "Vectorized" && (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Dataset Dimensions
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                    placeholder="Enter dimensions"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Vector Database
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                    placeholder="Enter vector database name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Domain</label>
              <select className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition">
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
                      ? "bg-blue-600 border-blue-500"
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
                      ? "bg-blue-600 border-blue-500"
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
                      ? "bg-blue-600 border-blue-500"
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
                      ? "bg-blue-600 border-blue-500"
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
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  accept={fileTypeMap[fileType].join(",")}
                  multiple
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
              <p className="mt-2 text-sm text-gray-400">
                Select a folder containing only {fileType.toLowerCase()} files
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UploadFile;
