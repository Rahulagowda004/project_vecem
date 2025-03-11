import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Database, Upload, UserCircle2, Settings, Menu, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import NavbarPro from '../components/NavbarPro';

const faqItems = [
  {
    question: "What types of datasets can I upload to Vecem?",
    answer: "You can upload raw datasets, vectorized datasets, or both. Vecem supports various data formats, including images, audio, text, and video."
  },
  {
    question: "What file formats are supported?",
    answer: (
      <>
        <p>Vecem supports the following file types:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Images: jpg, jpeg, png, gif, webp, heic</li>
          <li>Audio: mp3, wav, ogg</li>
          <li>Text: txt, csv, json, pdf, docx, xlsx</li>
          <li>Video: mp4, webm, ogg</li>
        </ul>
      </>
    )
  },
  {
    question: "What is the maximum dataset size I can upload?",
    answer: "Datasets can be up to 5GB in size. If you need to upload larger datasets, please contact our support team for assistance."
  },
  {
    question: "Can I update my dataset after uploading?",
    answer: "Yes, you can edit dataset details such as name, description, and domain category. Additionally, you can add or update vectorized data for raw datasets."
  },
  {
    question: "How can I download and use datasets from Vecem?",
    answer: "You can browse the Community Datasets section, search for a dataset, view its details, and download it in your preferred format (raw or vectorized)."
  },
  {
    question: "What are vectorized datasets, and why are they useful?",
    answer: "Vectorized datasets contain precomputed feature embeddings, making them ready for use in AI and machine learning applications. They speed up tasks like similarity search, clustering, and model training."
  },
  {
    question: "Can I delete a dataset I uploaded?",
    answer: "Yes, you can delete your dataset from the My Datasets section. However, if your dataset has been widely used or referenced, it's recommended to update it instead of deleting it."
  },
  {
    question: "How can I track the usage of my datasets?",
    answer: "Vecem provides insights into the number of downloads, views, and user engagement for each dataset. You can check these analytics in the My Datasets section."
  },
  {
    question: "Can I collaborate with others on datasets?",
    answer: "Currently, Vecem supports dataset sharing, and users can provide feedback on datasets. Future updates may include collaboration features like team access and version control."
  },
  {
    question: "Is there an API available for accessing datasets programmatically?",
    answer: "Vecem is working on an API that will allow users to access datasets directly from their applications. Stay tuned for updates!"
  }
];

const Documentation = () => {
  const [activeSection, setActiveSection] = useState("getting-started");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFaqQuestion, setActiveFaqQuestion] = useState<number | null>(null);

  const sections = [
    { id: "getting-started", title: "Getting Started", icon: BookOpen },
    { id: "uploading-datasets", title: "Uploading Datasets", icon: Upload },
    { id: "managing-datasets", title: "Managing Datasets", icon: Settings },
    { id: "using-datasets", title: "Using Datasets", icon: Database },
    { id: "faq", title: "FAQ", icon: UserCircle2 },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
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
                <li>If you're a new user, register by providing your email, username, and password</li>
                <li>If you already have an account, simply sign in using your existing credentials</li>
                <li>Optionally, you may enable two-factor authentication (2FA) for added security</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">2. Set Up Your Profile</h3>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Choose a unique username to represent you on the platform</li>
                <li>Add relevant details, such as a short bio, profile picture, and areas of expertise</li>
                <li>Configure privacy settings to control how your datasets are shared with others</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">3. Start Uploading or Browsing Datasets</h3>
              <div className="ml-4 space-y-4">
                <div>
                  <h4 className="font-medium text-cyan-300 mb-2">Uploading Datasets:</h4>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Navigate to the upload section and select the files you want to share</li>
                    <li>Provide metadata, including a title, description, tags, and licensing information</li>
                    <li>Choose whether to make your dataset public or keep it private</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-cyan-300 mb-2">Browsing Datasets:</h4>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Explore available datasets using search filters like category, file type, or popularity</li>
                    <li>View dataset details, including the uploader's information and dataset version history</li>
                    <li>Download or contribute by providing improvements or additional insights</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">4. Collaborate and Engage</h3>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Interact with the community by commenting on datasets and providing feedback</li>
                <li>Follow users whose work interests you and receive updates on their latest contributions</li>
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
              <p className="mt-4 text-gray-400">
                Once uploaded, the dataset will be processed and made available according to the selected visibility settings. You can track its status in the "My Datasets" section.
              </p>
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
                    <li>Dataset status (Public, Private, Processing)</li>
                    <li>Number of downloads and views</li>
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
              <p className="mt-2 text-gray-400 italic">Note: Changes to public datasets may require admin approval to maintain dataset integrity.</p>
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
                <li>Confirm deletion (this action is irreversible for public datasets)</li>
              </ul>
              <p className="mt-2 text-gray-400 italic">Note: If a dataset has been widely used or referenced, consider updating it instead of deleting it.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">5. Tracking Dataset Usage & Downloads</h3>
              <p className="mb-2">Vecem provides insights into dataset engagement through analytics, including:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Number of Downloads – Track how many times your dataset has been accessed</li>
                <li>Views and Engagement – See how often your dataset has been browsed</li>
                <li>User Feedback – View comments or ratings from the community</li>
                <li>Contribution Logs – Track any modifications made by collaborators (for open datasets)</li>
              </ul>
              <p className="mt-2 text-gray-400">
                This data helps you understand the impact of your datasets and optimize them based on user needs.
              </p>
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
                <li>Go to the Community Datasets section from the navigation bar</li>
                <li>Use the search bar to find datasets based on:
                  <ul className="list-disc list-inside ml-8 mt-2 space-y-1 text-gray-400">
                    <li>Keywords (e.g., "speech recognition," "image classification")</li>
                    <li>Dataset type (Raw, Vectorized, Both)</li>
                    <li>File type (Image, Audio, Text, Video)</li>
                    <li>Domain category (NLP, Computer Vision, Finance, Healthcare, etc.)</li>
                    <li>Contributor name (if looking for datasets from a specific user)</li>
                  </ul>
                </li>
                <li>Apply filters to refine results based on dataset size, date uploaded, or popularity</li>
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
                    <li>Licensing Information – Terms of use (e.g., Open-source, Attribution required)</li>
                    <li>Version History – If applicable, previous updates or changes</li>
                    <li>User Reviews & Ratings – Feedback from the community</li>
                    <li>Metadata & Tags – Additional information such as the source of the dataset</li>
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
                <li>Pre-built integration options may be available, such as API access or downloadable script templates</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">5. Community Contributions and Feedback</h3>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>If you use a dataset in your project, consider crediting the contributor</li>
                <li>Share feedback or report any issues in the comments section</li>
                <li>If you enhance the dataset (e.g., improve vectorization), you can upload an updated version for others to use</li>
              </ul>
            </div>
          </div>
        );

      case "faq":
        return (
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800/50"
                initial={false}
              >
                <motion.button
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-700/50 transition-colors"
                  onClick={() => setActiveFaqQuestion(activeFaqQuestion === index ? null : index)}
                >
                  <span className="font-medium text-cyan-400">{item.question}</span>
                  <motion.div
                    animate={{ rotate: activeFaqQuestion === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-cyan-400" />
                  </motion.div>
                </motion.button>
                <AnimatePresence initial={false}>
                  {activeFaqQuestion === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-4 py-3 text-gray-300 border-t border-gray-700">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        );

      default:
        return null;
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
            initial={{ x: -300 }}
            animate={{ x: isMobileMenuOpen ? 0 : (window.innerWidth >= 1024 ? 0 : -300) }}
            className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 z-40 
              lg:translate-x-0 transition-transform duration-300 w-64`}
          >
            <nav className="p-4 space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${activeSection === section.id 
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.title}</span>
                  </button>
                );
              })}
            </nav>
          </motion.aside>

          {/* Main Content */}
          <main className="flex-1 lg:pl-64">
            <div className="documentation-container w-full px-6 py-6 lg:px-8">
              <section className="space-y-6 w-full max-w-6xl">
                <h2 className="text-2xl font-semibold text-cyan-400 mb-4">
                  {sections.find(s => s.id === activeSection)?.title}
                </h2>
                <div className="prose prose-invert prose-lg max-w-none">
                  {renderContent()}
                </div>
              </section>
            </div>
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