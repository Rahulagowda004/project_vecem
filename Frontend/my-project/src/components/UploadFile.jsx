import React, { useState } from 'react';

const UploadFile = () => {
  const [vectorDimensions, setVectorDimensions] = useState(100);
  const [fileType, setFileType] = useState('');
  const [databaseDescription, setDatabaseDescription] = useState('');
  const [vectorFile, setVectorFile] = useState(null);
  const [rawFile, setRawFile] = useState(null);

  const handleVectorFileChange = (e) => {
    setVectorFile(e.target.files[0]);
  };

  const handleRawFileChange = (e) => {
    setRawFile(e.target.files[0]);
  };

  const handleSubmit = () => {
    if (!vectorFile || !rawFile) {
      alert('Both vector and raw files must be uploaded!');
      return;
    }

    // Handle file upload logic here (e.g., send to server)
    console.log({
      vectorDimensions,
      fileType,
      databaseDescription,
      vectorFile,
      rawFile,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload File</h2>
       {/* Name */}
      <div className="mb-4">
        <label htmlFor="databaseDescription" className="block text-sm font-medium text-gray-700">Database Name:</label>
        <textarea
          id="databaseName"
          value={databaseDescription}
          onChange={(e) => setDatabaseDescription(e.target.value)}
          className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="1"
        />
      </div>
      
      {/* Vector Dimensions */}
      <div className="mb-4">
        <label htmlFor="vectorDimensions" className="block text-sm font-medium text-gray-700">Vector Dimensions:</label>
        <input
          type="number"
          id="vectorDimensions"
          min="100"
          max="5000"
          value={vectorDimensions}
          onChange={(e) => setVectorDimensions(e.target.value)}
          className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* File Type Selection */}
      <div className="mb-4">
        <label htmlFor="fileType" className="block text-sm font-medium text-gray-700">File Type:</label>
        <select
          id="fileType"
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select File Type</option>
          <option value="raw">Raw</option>
          <option value="vector">Vector</option>
          <option value="audio">Audio</option>
          <option value="image">Image</option>
          <option value="database">Database</option>
        </select>
      </div>

      {/* Database Description */}
      <div className="mb-4">
        <label htmlFor="databaseDescription" className="block text-sm font-medium text-gray-700">Database Description:</label>
        <textarea
          id="databaseDescription"
          value={databaseDescription}
          onChange={(e) => setDatabaseDescription(e.target.value)}
          className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
        />
      </div>

      {/* File Upload for Vector and Raw */}
      <div className="mb-4">
        <label htmlFor="vectorFile" className="block text-sm font-medium text-gray-700">Upload Vector File:</label>
        <input
          type="file"
          id="vectorFile"
          accept=".txt, .json, .csv"
          onChange={handleVectorFileChange}
          className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="rawFile" className="block text-sm font-medium text-gray-700">Upload Raw File:</label>
        <input
          type="file"
          id="rawFile"
          accept=".txt, .json, .csv"
          onChange={handleRawFileChange}
          className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Upload Button */}
      <div className="mb-4">
        <button 
          onClick={handleSubmit}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Upload
        </button>
      </div>
    </div>
  );
};

export default UploadFile;