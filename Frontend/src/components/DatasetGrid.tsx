import React, { useState } from 'react';
import { FileText, Image, Music, Video, ChevronDown } from 'lucide-react';

interface Dataset {
  id: number;
  name: string;
  type: 'audio' | 'image' | 'text' | 'video';
  size: string;
  lastModified: string;
  icon: React.ElementType;
  description: string;
  datasetType: 'Raw' | 'Vectorized';
  dimensions?: string;
  domain: string;
}

const DatasetGrid = () => {
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const domains = [
    'Health', 'Education', 'Automobile', 'Finance', 'Business', 
    'Banking', 'Retail', 'Government', 'Sports', 'Social Media', 
    'Entertainment', 'Telecommunication', 'Energy', 'E-Commerce'
  ];

  const datasets: Dataset[] = [
    {
      id: 1,
      name: 'Speech Recognition Dataset',
      type: 'audio',
      size: '2.3 GB',
      lastModified: '2024-03-10',
      icon: Music,
      description: 'High-quality speech samples for machine learning applications',
      datasetType: 'Vectorized',
      dimensions: '512 x 1',
      domain: 'Education'
    },
    {
      id: 2,
      name: 'Object Detection Images',
      type: 'image',
      size: '4.1 GB',
      lastModified: '2024-03-09',
      icon: Image,
      description: 'Comprehensive image dataset for object detection training',
      datasetType: 'Raw',
      domain: 'Automobile'
    },
    {
      id: 3,
      name: 'Action Recognition Videos',
      type: 'video',
      size: '8.7 GB',
      lastModified: '2024-03-08',
      icon: Video,
      description: 'Video clips for action recognition models',
      datasetType: 'Vectorized',
      dimensions: '1024 x 768',
      domain: 'Sports'
    },
    {
      id: 4,
      name: 'NLP Training Corpus',
      type: 'text',
      size: '1.2 GB',
      lastModified: '2024-03-07',
      icon: FileText,
      description: 'Large-scale text corpus for natural language processing',
      datasetType: 'Vectorized',
      dimensions: '768 x 1',
      domain: 'Business'
    }
  ];

  const handleDatasetClick = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {datasets.map((dataset) => {
          const Icon = dataset.icon;
          return (
            <div
              key={dataset.id}
              className="bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-200 p-6 cursor-pointer"
              onClick={() => handleDatasetClick(dataset)}
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gray-700 rounded-lg">
                  <Icon className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white hover:text-indigo-400 transition-colors">
                    {dataset.name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1 capitalize">
                    {dataset.type} • {dataset.domain}
                  </p>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Size: {dataset.size}</p>
                    <p>Last Modified: {dataset.lastModified}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dataset Details Modal */}
      {isModalOpen && selectedDataset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <ChevronDown className="h-6 w-6 transform rotate-180" />
            </button>
            
            <div className="flex items-center space-x-4 mb-6">
              {React.createElement(selectedDataset.icon, {
                className: "h-8 w-8 text-indigo-400"
              })}
              <h2 className="text-2xl font-bold text-white">{selectedDataset.name}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">Description</h3>
                <p className="text-gray-400">{selectedDataset.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-300 mb-2">Details</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li>Type: {selectedDataset.type}</li>
                    <li>Dataset Type: {selectedDataset.datasetType}</li>
                    <li>Domain: {selectedDataset.domain}</li>
                    <li>Size: {selectedDataset.size}</li>
                    {selectedDataset.datasetType === 'Vectorized' && (
                      <li>Dimensions: {selectedDataset.dimensions}</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-300 mb-2">Metadata</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li>Last Modified: {selectedDataset.lastModified}</li>
                    <li>ID: {selectedDataset.id}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasetGrid;