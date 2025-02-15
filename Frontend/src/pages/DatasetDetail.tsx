import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Download,
  Share2,
  Box,
  Database,
  FileType,
  Copy,
  Check,
  Code,
} from "lucide-react";

type ExampleType = "basic" | "vectorized" | "advanced";

interface PythonExample {
  label: string;
  code: string;
}

type PythonExamples = Record<ExampleType, PythonExample>;

const DatasetDetail = () => {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);
  const [selectedExample, setSelectedExample] = useState<ExampleType>("basic");
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

  const pythonExamples: PythonExamples = {
    basic: {
      label: "Basic Usage",
      code: `import vecem as vc

# Load the dataset
dataset = vc.load_dataset("${id}")

# Access the data
data = dataset.get_files()  # For raw files`,
    },
    vectorized: {
      label: "Vectorized Data",
      code: `import vecem as vc

# Load and access vectorized data
dataset = vc.load_dataset("${id}")
vectors = dataset.get_vectors()
embeddings = vectors.to_numpy()`,
    },
    advanced: {
      label: "Advanced Usage",
      code: `import vecem as vc

# Initialize with custom settings
dataset = vc.load_dataset(
    id="${id}",
    batch_size=32,
    cache_dir="./cache"
)

# Process data with transformation
processed_data = dataset.transform(
    num_workers=4,
    preprocessing_fn=your_preprocessing_function
)`,
    },
  } as const;

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonExamples[selectedExample].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Block with Key Information */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-blue-400">
                {dataset.name}
              </h1>
              <p className="text-gray-300 mt-2">{dataset.description}</p>
              <div className="flex gap-2 mt-3">
                <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">
                  {dataset.domain}
                </span>
                <span className="px-3 py-1 bg-purple-600 rounded-full text-sm">
                  {dataset.fileType}
                </span>
              </div>
            </div>
            {/* Download Buttons */}
            <div className="flex gap-2">
              <button className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Raw ({dataset.size.raw})
              </button>
              {dataset.datasetType !== "Raw" && (
                <button className="bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Vectors ({dataset.size.vectorized})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Description Section */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">About This Dataset</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Overview</h3>
                  <p className="text-gray-300">
                    {dataset.detailedDescription.overview}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Data Structure</h3>
                  <p className="text-gray-300">
                    {dataset.detailedDescription.dataStructure}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Contents</h3>
                  <ul className="list-disc list-inside text-gray-300">
                    {dataset.detailedDescription.contents.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Use Cases</h3>
                  <ul className="list-disc list-inside text-gray-300">
                    {dataset.detailedDescription.useCases.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Python Usage Dropdown Section */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <button
                onClick={() => setIsCodeOpen(!isCodeOpen)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-blue-400" />
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
              </button>

              {isCodeOpen && (
                <div className="p-6 pt-0">
                  <div className="flex items-center justify-end gap-4 mb-4">
                    <select
                      value={selectedExample}
                      onChange={(e) =>
                        setSelectedExample(e.target.value as ExampleType)
                      }
                      className="bg-gray-700 text-gray-200 rounded-lg px-3 py-1 text-sm border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      {Object.entries(pythonExamples).map(
                        ([key, { label }]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        )
                      )}
                    </select>
                    <button
                      onClick={handleCopy}
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
                    <code className="text-sm">
                      {pythonExamples[selectedExample].code}
                    </code>
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* About Section */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">About</h2>
              <div className="space-y-3 text-gray-300">
                <p>Uploaded by: {dataset.owner}</p>
                <p>
                  Upload Date:{" "}
                  {new Date(dataset.uploadDate).toLocaleDateString()}
                </p>
                <p>
                  Status:{" "}
                  <span className="text-green-400">
                    {dataset.status.processingComplete ? "Ready" : "Processing"}
                  </span>
                </p>
              </div>
            </div>

            {/* Vectorized Settings */}
            {(dataset.datasetType === "Vectorized" ||
              dataset.datasetType === "Both") && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Vectorized Settings
                </h2>
                <div className="space-y-3">
                  <div>
                    <div className="text-gray-400 mb-1">Dimensions</div>
                    <div className="bg-gray-700 p-2 rounded">
                      {dataset.vectorizedSettings.dimensions}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Vector Database</div>
                    <div className="bg-gray-700 p-2 rounded">
                      {dataset.vectorizedSettings.vectorDatabase}
                    </div>
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

export default DatasetDetail;
