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

interface DatasetGridProps {
  searchQuery: string;
  category: string;
}

const DatasetGrid = ({ searchQuery, category }: DatasetGridProps) => {
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
      description: 'High-quality speech samples are essential for machine learning applications, enabling accurate speech recognition, text-to-speech synthesis, and language modeling. Clean, noise-free audio with diverse accents, tones, and speaking styles enhances model performance. Properly labeled datasets improve training efficiency and accuracy. Applications include voice assistants, transcription services, and AI-driven customer support. Sampling rates of at least 16 kHz and lossless formats ensure clarity. Ethical considerations, including user consent and data privacy, are crucial when collecting speech samples. Open-source datasets help researchers and developers build innovative solutions. High-quality speech data ultimately leads to more natural and responsive AI-driven voice applications.High-quality speech samples are essential for machine learning applications, enabling accurate speech recognition, text-to-speech synthesis, and language modeling. Clean, noise-free audio with diverse accents, tones, and speaking styles enhances model performance. Properly labeled datasets improve training efficiency and accuracy. Applications include voice assistants, transcription services, and AI-driven customer support. Sampling rates of at least 16 kHz and lossless formats ensure clarity. Ethical considerations, including user consent and data privacy, are crucial when collecting speech samples. Open-source datasets help researchers and developers build innovative solutions. High-quality speech data ultimately leads to more natural and responsive AI-driven voice applications.',
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

  const filteredDatasets = datasets.filter(dataset => {
    const searchTerm = searchQuery.toLowerCase();
    const matchesSearch = 
      dataset.name.toLowerCase().includes(searchTerm) ||
      dataset.domain.toLowerCase().includes(searchTerm);
    const matchesCategory = category === 'all' || dataset.type === category;
    return matchesSearch && matchesCategory;
  });

  const handleDatasetClick = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDatasets.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-lg">
              No datasets found matching "{searchQuery}"
            </div>
          </div>
        ) : (
          filteredDatasets.map((dataset) => {
            const Icon = dataset.icon;
            return (
              <div
                key={dataset.id}
                onClick={() => handleDatasetClick(dataset)}
                className="group relative bg-gray-800/50 backdrop-blur-sm rounded-xl hover:bg-gray-700/50 transition-all duration-300 p-6 cursor-pointer border border-gray-700/50 hover:border-cyan-500/30 shadow-lg hover:shadow-cyan-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative flex items-start space-x-4">
                  <div className="p-3 bg-gray-900/50 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white group-hover:text-cyan-400 transition-colors">
                      {dataset.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-1 text-xs rounded-full bg-cyan-500/10 text-cyan-400 font-medium">
                        {dataset.datasetType}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-700/50 text-gray-400">
                        {dataset.domain}
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-gray-400 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-cyan-400" />
                        {dataset.type}
                      </span>
                      <span className="text-gray-500">{dataset.size}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dataset Details Modal */}
      {isModalOpen && selectedDataset && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div 
            className="bg-gray-900/90 rounded-2xl max-w-2xl w-full p-8 relative border border-gray-800 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
            >
              <ChevronDown className="h-5 w-5 transform rotate-180" />
            </button>
            
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-4 bg-gray-800/50 rounded-xl">
                {React.createElement(selectedDataset.icon, {
                  className: "h-8 w-8 text-cyan-400"
                })}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedDataset.name}</h2>
                <div className="flex gap-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-cyan-500/10 text-cyan-400 font-medium">
                    {selectedDataset.datasetType}
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-800/50 text-gray-400">
                    {selectedDataset.domain}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-gray-800/30 rounded-xl">
                <h3 className="text-lg font-medium text-white mb-2">Description</h3>
                <div className="max-h-48 overflow-y-auto custom-scrollbar">
                  <p className="text-gray-400 leading-relaxed text-justify pr-4">
                    {selectedDataset.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800/30 rounded-xl">
                  <h3 className="text-lg font-medium text-white mb-3">Details</h3>
                  <ul className="space-y-3">
                    {[
                      { label: "Type", value: selectedDataset.type },
                      { label: "Dataset Type", value: selectedDataset.datasetType },
                      { label: "Domain", value: selectedDataset.domain },
                      { label: "Size", value: selectedDataset.size },
                      ...(selectedDataset.dimensions ? [{ label: "Dimensions", value: selectedDataset.dimensions }] : [])
                    ].map(({ label, value }) => (
                      <li key={label} className="flex justify-between items-center">
                        <span className="text-gray-400">{label}</span>
                        <span className="text-cyan-400 font-medium">{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-gray-800/30 rounded-xl">
                  <h3 className="text-lg font-medium text-white mb-3">Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-colors">
                      Download Dataset
                    </button>
                    <button className="w-full px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
                      View Documentation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(31, 41, 55, 0.5);
    border-radius: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(6, 182, 212, 0.3);
    border-radius: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(6, 182, 212, 0.5);
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default DatasetGrid;