import React, { useState } from "react";
import { Mail, Github, Edit2, Trash2 } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";
import AvatarSelector from "../components/AvatarSelector";

const Settings = () => {
  const { user, isAuthenticated, logout } = useAuth0();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(localStorage.getItem("userName") || user?.name || "Guest");
  const [about, setAbout] = useState(
    localStorage.getItem("userAbout") || 
    "Creative professional with over 8 years of experience in digital design and art direction."
  );
  const [selectedAvatar, setSelectedAvatar] = useState(
    localStorage.getItem("userAvatar") ||
    user?.picture ||
    "/avatars/avatar1.png"
  );
  const [githubUrl, setGithubUrl] = useState(
    localStorage.getItem("githubUrl") || 
    `https://github.com/${user?.nickname || 'username'}`
  );

  const displayUsername = user?.nickname || 'username';

  const handleSave = () => {
    setIsEditing(false);
    localStorage.setItem("userName", name);
    localStorage.setItem("userAbout", about);
    localStorage.setItem("githubUrl", githubUrl);
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        // Add API call to delete account here
        await logout({ 
          logoutParams: {
            returnTo: window.location.origin
          }
        });
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-start space-x-8">
            <AvatarSelector
              user={user}
              selectedAvatar={selectedAvatar}
              setSelectedAvatar={setSelectedAvatar}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex flex-col flex-1">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="text-2xl bg-gray-700 text-gray-100 rounded px-2 py-1 mb-1"
                      />
                      <span className="text-gray-400 text-sm ml-2">@{displayUsername}</span>
                    </>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold text-gray-100">{name}</h1>
                      <span className="text-gray-400 text-sm mt-1">@{displayUsername}</span>
                    </>
                  )}
                </div>
                <div className="flex space-x-2">
                  {isEditing ? (
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                    >
                      <Edit2 size={16} className="text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="w-full mt-4 bg-gray-700 text-gray-100 rounded p-2"
                  rows={3}
                />
              ) : (
                <p className="text-gray-400 mt-4">{about}</p>
              )}

              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Mail size={16} />
                  <span>{isAuthenticated ? user?.email : "guest@example.com"}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Github size={16} />
                  {isEditing ? (
                    <input
                      type="text"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="Enter GitHub URL"
                      className="bg-gray-700 text-gray-100 rounded px-2 py-1 text-sm w-64"
                    />
                  ) : (
                    <a 
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-400"
                    >
                      @{user?.nickname || 'username'}
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-700">
                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Trash2 size={16} />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
