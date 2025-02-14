import React, { useState } from "react";
import {
  Camera,
  Folder,
  Mail,
  MapPin,
  Phone,
  Search,
  Upload,
  Edit2,
} from "lucide-react";

const Profile = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState(
    "Creative professional with over 8 years of experience in digital design and art direction. Passionate about creating beautiful, functional designs that enhance user experience. Specialized in UI/UX design and brand identity."
  );

  const folders = [
    { id: 1, name: "Documents", files: 23 },
    { id: 2, name: "Photos", files: 145 },
    { id: 3, name: "Projects", files: 12 },
    { id: 4, name: "Downloads", files: 48 },
    { id: 5, name: "Music", files: 67 },
  ];

  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAboutSave = () => {
    setIsEditingAbout(false);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-gray-900 rounded-xl shadow-2xl">
        <div className="flex flex-col md:flex-row">
          {/* Left Section */}
          <div className="md:w-1/3 p-8 border-r border-gray-800">
            <div className="relative mb-6">
              <div className="w-32 h-32 mx-auto relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-gray-800"
                />
                <button className="absolute bottom-0 right-0 bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors">
                  <Camera size={18} className="text-gray-100" />
                </button>
              </div>
            </div>

            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <h1 className="text-2xl font-bold">Sarah Anderson</h1>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                  <Edit2 size={16} className="text-gray-400" />
                </button>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-400">
                <Mail size={16} />
                <span>sarah.anderson@example.com</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-400">
                <MapPin size={16} />
                <span>San Francisco, CA</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-400">
                <Phone size={16} />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 space-y-4 bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold text-center">Edit Profile</h3>
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="Sarah Anderson"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="sarah.anderson@example.com"
                />
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="San Francisco, CA"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="+1 (555) 123-4567"
                />
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="md:w-2/3 p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">About</h2>
                <button
                  onClick={() => setIsEditingAbout(!isEditingAbout)}
                  className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                  <Edit2 size={16} className="text-gray-400" />
                </button>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                {isEditingAbout ? (
                  <div className="space-y-4">
                    <textarea
                      value={aboutText}
                      onChange={(e) => setAboutText(e.target.value)}
                      className="w-full h-32 px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100 resize-none"
                      placeholder="Write something about yourself..."
                    />
                    <button
                      onClick={handleAboutSave}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-300 leading-relaxed">{aboutText}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="relative flex-1 mr-4">
                <input
                  type="text"
                  placeholder="Search folders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={18}
                />
              </div>
              <button className="flex items-center space-x-2 bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Upload size={18} />
                <span>Upload</span>
              </button>
            </div>

            <div className="flex-1 min-h-0">
              <h2 className="text-xl font-semibold mb-4">Uploaded Folders</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFolders.map((folder) => (
                  <div
                    key={folder.id}
                    className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <Folder
                        className="text-blue-400 group-hover:text-blue-300 transition-colors"
                        size={24}
                      />
                      <div>
                        <h3 className="font-medium">{folder.name}</h3>
                        <p className="text-sm text-gray-400">
                          {folder.files} files
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
