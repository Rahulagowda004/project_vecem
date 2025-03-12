import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Database, Upload, UserCircle2, Settings, Menu, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import NavbarPro from '../components/NavbarPro';

const Documentation = () => {
  const [activeSection, setActiveSection] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sections = [
    { id: "getting-started", title: "Getting Started", icon: BookOpen },
    { id: "uploading-datasets", title: "Uploading Datasets", icon: Upload },
    { id: "managing-datasets", title: "Managing Datasets", icon: Settings },
    { id: "using-datasets", title: "Using Datasets", icon: Database },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const Welcome = () => (
    <div className="space-y-6 flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative p-8 rounded-2xl bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-900/90 border border-gray-700/50 backdrop-blur-xl overflow-hidden w-full max-w-4xl mx-auto"
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full filter blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="relative text-center space-y-8">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Welcome to Vecem Documentation
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 gap-4 max-w-2xl mx-auto"
          >
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <motion.button
                  key={section.id}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollToSection(section.id)}
                  className="flex flex-col items-center p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-cyan-500/20 hover:bg-gray-800/80 transition-all group w-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                >
                  <Icon className="w-8 h-8 text-cyan-400 mb-2 group-hover:text-cyan-300 transition-colors" />
                  <span className="text-gray-300 group-hover:text-cyan-400 transition-colors text-sm">
                    {section.title}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto mt-8"
          >
            Explore our comprehensive guides to make the most of Vecem's features. Select a topic above or from the sidebar to begin your journey.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );

  const renderContent = () => {
    if (!activeSection) {
      return <Welcome />;
    }

    switch (activeSection) {
      case "getting-started":
        return (
          <div className="space-y-6 text-gray-300">
            <p className="text-lg">
              Vecem is a platform designed for managing and sharing vectorized datasets, making it easier for users to store, access, and contribute to a growing open-source community.
            </p>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">1. Create an Account or Sign In</h3>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>If you're a new user, register by entering your email, username, and password</li>
                <li>If you already have an account, simply sign in using your existing credentials</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">2. Set Up Your Profile</h3>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Choose a unique username to represent you on the platform</li>
                <li>Add relevant details, such as a short bio, profile picture, and area of expertise</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">3. Start Uploading or Browsing Datasets</h3>
              <div className="ml-4 space-y-4">
                <div>
                  <h4 className="font-medium text-cyan-300 mb-2">Uploading Datasets:</h4>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Navigate to the profile section and click on upload datasets button</li>
                    <li>Provide metadata, including a title, description, tags, and licensing information</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-cyan-300 mb-2">Browsing Datasets:</h4>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Explore available datasets using search filters, file type.</li>
                    <li>View dataset details, including the uploader's information.</li>
                    <li>Download or contribute by uploading ur datsets.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">4. Collaborate and Engage</h3>
              <ul className="list-disc list-inside ml-4 space-y-2">

                <li>Participate in discussions, contribute to open-source datasets, and suggest improvements</li>
              </ul>
            </div>
          </div>
        );
      case "uploading-datasets":
        return (
          <div className="space-y-6 text-gray-300">
            <p className="text-lg">
              Uploading a dataset to Vecem is a straightforward process that allows users to contribute valuable data to the platform.
            </p>            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">1. Navigate to the Upload Section</h3>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Log in to your Vecem account</li>
                <li>Click the "Upload" button located in the navigation bar</li>
                <li>You will be directed to the dataset upload page, where you can begin the process</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">2. Choose the Dataset Type</h3>
              <p className="mb-2">Before proceeding, select the type of dataset you are uploading:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Raw Data – Uploads original, unprocessed datasets</li>
                <li>Vectorized Data – Uploads preprocessed data with vector representations</li>
                <li>Both – Allows you to upload both raw and vectorized versions of the dataset</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">3. Fill in the Required Information</h3>
              <p className="mb-2">Provide essential details to help others understand and use your dataset effectively.</p>
              
              <div className="ml-4 space-y-4">
                <div>
                  <h4 className="font-medium text-cyan-300 mb-2">Basic Information:</h4>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Dataset Name – A unique identifier for your dataset</li>
                    <li>Description – A brief overview of the dataset, including its purpose and potential applications</li>
                    <li>Domain Category – Choose the relevant field (e.g., Healthcare, Finance, NLP, Computer Vision)</li>
                    <li>File Type – Select the type of data you are uploading:
                      <ul className="list-disc list-inside ml-8 mt-2 space-y-1 text-gray-400">
                        <li>Image (JPG, PNG, etc.)</li>
                        <li>Audio (MP3, WAV, etc.)</li>
                        <li>Text (CSV, TXT, JSON, etc.)</li>
                        <li>Video (MP4, AVI, etc.)</li>
                      </ul>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-cyan-300 mb-2">For Vectorized Data:</h4>
                  <p className="mb-2 ml-4">If you are uploading a vectorized dataset, provide the following additional details:</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Model Name – Specify the model used for vectorization (e.g., OpenAI's CLIP, BERT, ResNet)</li>
                    <li>Vector Dimensions – Define the dimensionality of the vector representation (e.g., 512, 1024)</li>
                    <li>Vector Database Name – Mention the database where the vectors are stored (e.g., FAISS, Pinecone, Weaviate)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">4. Upload Files and Submit</h3>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Click the "Select Files" button and choose the dataset files from your local system</li>
                <li>If necessary, compress large datasets into ZIP format before uploading</li>
                <li>Review all provided details to ensure accuracy</li>
                <li>Click "Submit" to complete the upload process</li>
              </ul>
          
            </div>
          </div>
        );
      case "managing-datasets":
        return (
          <div className="space-y-6 text-gray-300">
            <p className="text-lg">
              Once you have uploaded datasets to Vecem, you can manage them efficiently from your Profile or Settings page.
            </p>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">1. Viewing Your Uploaded Datasets</h3>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Navigate to your Profile or the "My Datasets" section under Settings</li>
                <li>You will see a list of all datasets you have uploaded, along with essential details such as:
                  <ul className="list-disc list-inside ml-8 mt-2 space-y-1 text-gray-400">
                    <li>Dataset name</li>
                    <li>Description</li>
                    <li>File type (Image, Audio, Text, Video)</li>
                  </ul>
                </li>
                <li>Use filters or search functionality to quickly find specific datasets</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">2. Editing Dataset Details</h3>
              <p className="mb-2">If you need to update dataset information:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Click on the dataset you want to modify</li>
                <li>Select the "Edit" option</li>
                <li>Update the following details as needed:
                  <ul className="list-disc list-inside ml-8 mt-2 space-y-1 text-gray-400">
                    <li>Dataset Name (if not already used by another dataset)</li>
                    <li>Description (expand details or refine explanations)</li>
                    <li>Domain Category (reclassify if necessary)</li>
                  </ul>
                </li>
                <li>Save changes to update the dataset's metadata</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">3. Adding or Updating Vectorized Data</h3>
              <p className="mb-2">For raw datasets that require vectorization, you can:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Open the dataset and select "Add Vectorized Data"</li>
                <li>Provide the necessary details, such as:
                  <ul className="list-disc list-inside ml-8 mt-2 space-y-1 text-gray-400">
                    <li>Model Name (e.g., ResNet, BERT, CLIP)</li>
                    <li>Vector Dimensions (e.g., 512, 1024)</li>
                    <li>Vector Database Name (e.g., FAISS, Pinecone)</li>
                  </ul>
                </li>
                <li>Upload the vectorized file or allow Vecem to process it automatically</li>
                <li>Click "Update" to save changes</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">4. Deleting Unwanted Datasets</h3>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Open the dataset from "My Datasets"</li>
                <li>Click the "Delete" button</li>
              </ul>
            </div>

            
          </div>
        );

      case "using-datasets":
        return (
          <div className="space-y-6 text-gray-300">
            <p className="text-lg">
              Vecem allows users to access, download, and integrate datasets seamlessly into their projects. Whether you need raw data for preprocessing or ready-to-use vectorized data for AI applications, Vecem provides a structured way to retrieve and utilize datasets.
            </p>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">1. Browsing and Searching for Datasets</h3>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Go to the Home Page section from the navigation bar</li>
                <li>Use the search bar to find datasets based on:
                  <ul className="list-disc list-inside ml-8 mt-2 space-y-1 text-gray-400">
                  </ul>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">2. Viewing Dataset Details</h3>
              <p className="mb-2">Once you find a dataset that interests you:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Click on the dataset to open its detailed view</li>
                <li>Here, you can see:
                  <ul className="list-disc list-inside ml-8 mt-2 space-y-1 text-gray-400">
                    <li>Dataset Name & Description – Overview of the dataset and its applications</li>
                    <li>File Type & Size – Information on supported formats and dataset volume</li>
                  </ul>
                </li>
                <li>For vectorized datasets, additional details include:
                  <ul className="list-disc list-inside ml-8 mt-2 space-y-1 text-gray-400">
                    <li>Vector Model Used (e.g., ResNet, BERT, CLIP)</li>
                    <li>Vector Dimensions (e.g., 512, 1024)</li>
                    <li>Vector Database Compatibility (e.g., FAISS, Pinecone)</li>
                  </ul>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">3. Downloading the Dataset</h3>
              <p className="mb-2">Once you've reviewed the dataset details:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Click the "Download" button</li>
                <li>Choose your preferred format:
                  <ul className="list-disc list-inside ml-8 mt-2 space-y-1 text-gray-400">
                    <li>Raw Data – Original dataset files in their primary format (CSV, JSON, PNG, MP3, etc.)</li>
                    <li>Vectorized Data – Preprocessed feature embeddings stored in a format suitable for AI models</li>
                    <li>Both – If you need both raw and vectorized versions</li>
                  </ul>
                </li>
                <li>If the dataset is large, it may be available as a ZIP file for easier download</li>
                <li>After the download is complete, extract and verify the files before using them in your project</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">4. Integrating the Dataset into Your Project</h3>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Each dataset comes with structured metadata, making it easier to incorporate into various projects</li>
                <li>Users can follow the dataset documentation to understand the format, preprocessing steps, and intended use cases</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">5. Community Contributions and Feedback</h3>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>If you use a dataset in your project, consider crediting the contributor</li>
                <li>Share feedback or report any issues in the issue section</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const sidebarVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4
      }
    }
  };

  const mainContentVariants = {
    hidden: { x: 20, opacity: 0 },
    visible: { 
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4
      }
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0f1829] to-gray-900">
      <NavbarPro />
      
      {/* Adjust top padding to account for NavbarPro only */}
      <div className="pt-16">
        {/* Mobile Menu Button */}
        <div className="lg:hidden fixed top-4 right-4 z-50">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-gray-800/80 rounded-lg text-cyan-400 hover:bg-gray-700/80"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Documentation Layout */}
        <div className="flex">
          {/* Sidebar - Adjust top padding */}
          <motion.aside
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            className="fixed top-16 left-0 h-[calc(100vh-4rem)] bg-gray-900/90 backdrop-blur-lg border-r border-gray-800 z-40 
              lg:translate-x-0 transition-transform duration-300 w-64"
          >
            <nav className="flex-1 px-2 py-4 space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-xl hover:bg-gray-800/50 transition-all duration-200 group backdrop-blur-sm border border-transparent hover:border-cyan-500/10 ${
                      activeSection === section.id ? "bg-cyan-500/10" : ""
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3 text-cyan-400 group-hover:animate-pulse" />
                    <span className="group-hover:text-cyan-400 transition-colors">
                      {section.title}
                    </span>
                  </button>
                );
              })}
            </nav>
          </motion.aside>

          {/* Main Content */}
          <main className="flex-1 lg:pl-64">
            <motion.div
              variants={mainContentVariants}
              initial="hidden"
              animate="visible"
              className="documentation-container w-full px-6 py-6 lg:px-8"
            >
              <section className="space-y-6 w-full max-w-6xl">
                {activeSection && (
                  <h2 className="text-2xl font-semibold text-cyan-400 mb-4">
                    {sections.find(s => s.id === activeSection)?.title}
                  </h2>
                )}
                <div className="prose prose-invert prose-lg max-w-none">
                  {renderContent()}
                </div>
              </section>
            </motion.div>
          </main>

          {/* Overlay for mobile */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Documentation;