import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AvatarSelectionPage = () => {
  const [selectedAvatar, setSelectedAvatar] = useState(localStorage.getItem("userAvatar"));

  const avatars = [
    '/avatars/avatar1.png', 
    '/avatars/avatar2.png', 
    '/avatars/avatar3.png', 
    '/avatars/avatar4.png'
  ]; // List of avatars stored locally

  const handleAvatarSelect = (avatar) => {
    localStorage.setItem("userAvatar", avatar); // Store selected avatar in localStorage
    setSelectedAvatar(avatar); // Update selected avatar in state
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-center text-2xl font-semibold mb-6">Select Your Avatar</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-center">
        {avatars.map((avatar, index) => (
          <div
            key={index}
            className={`relative avatar-item cursor-pointer ${
              selectedAvatar === avatar ? 'border-4 border-blue-500' : 'border-2 border-gray-300'
            } rounded-full p-1 transition-all hover:scale-105 hover:border-blue-400`}
            onClick={() => handleAvatarSelect(avatar)}
          >
            <img 
              src={avatar} 
              alt={`Avatar ${index + 1}`} 
              className="w-full h-full rounded-full object-cover"
            />
            {selectedAvatar === avatar && (
              <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center rounded-full bg-blue-500 opacity-50">
                <span className="text-white font-semibold text-xs">Selected</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link to="/profile" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          Go to Profile
        </Link>
      </div>
    </div>
  );
};

export default AvatarSelectionPage;
