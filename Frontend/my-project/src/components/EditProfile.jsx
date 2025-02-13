import React, { useState } from 'react';
import { Link } from "react-router-dom"; 

// Sample public avatars
const avatars = [
  'avatar1.png',
  'avatar2.png',
  'avatar3.png',
  'avatar4.png',
];

const EditProfile = () => {
  const [username, setUsername] = useState('CurrentUsername'); // Replace with actual user data
  const [aboutMe, setAboutMe] = useState('This is about me.'); // Replace with actual user data
  const [avatar, setAvatar] = useState('avatar1.png'); // Replace with actual user data

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleAboutMeChange = (e) => {
    setAboutMe(e.target.value);
  };

  const handleAvatarChange = (newAvatar) => {
    setAvatar(newAvatar);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Updated Profile:', { username, aboutMe, avatar });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-6 w-full h-full max-w-md max-h-full overflow-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col items-center mb-4">
            <img
              src={`/avatars/${avatar}`} // Adjusted path for the selected avatar
              alt="User  Avatar"
              className="w-24 h-24 rounded-full mb-2 border-2 border-gray-300"
            />
            <h3 className="text-lg font-semibold">{username}</h3>
          </div>

          <div className="form-group mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>

          <div className="form-group mb-4">
            <label htmlFor="aboutMe" className="block text-sm font-medium text-gray-700">About Me:</label>
            <textarea
              id="aboutMe"
              value={aboutMe}
              onChange={handleAboutMeChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>

          <div className="form-group mb-4">
            <label className="block text-sm font-medium text-gray-700">Choose Avatar:</label>
            <div className="flex space-x-2 mt-2">
              {avatars.map((avatarUrl, index) => (
                <img
                  key={index}
                  src={`/avatars/${avatarUrl}`} // Corrected avatar path
                  alt={`Avatar ${index + 1}`}
                  className={`w-16 h-16 rounded-full cursor-pointer border-2 ${avatar === avatarUrl ? 'border-blue-500' : 'border-transparent'}`}
                  onClick={() => handleAvatarChange(avatarUrl)}
                />
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600 transition duration-200">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;