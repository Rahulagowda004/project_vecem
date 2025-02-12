import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AvatarSelection = () => {
  const navigate = useNavigate();

  // Array of avatar paths
  const avatars = [
    "/avatars/avatar1.png",
    "/avatars/avatar2.png",
    "/avatars/avatar3.png",
    "/avatars/avatar4.png",
  ];

  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
  };

  const saveAvatar = () => {
    if (selectedAvatar) {
      localStorage.setItem("userAvatar", selectedAvatar);
      alert("Avatar selected successfully!");
      navigate("/"); // Redirect to home or another page
    } else {
      alert("Please select an avatar!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Choose Your Avatar</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {avatars.map((avatar, index) => (
          <img
            key={index}
            src={avatar}
            alt={`Avatar ${index + 1}`}
            className={`w-20 h-20 rounded-full cursor-pointer border-4 ${
              selectedAvatar === avatar ? "border-blue-500" : "border-gray-300"
            }`}
            onClick={() => handleAvatarSelect(avatar)}
          />
        ))}
      </div>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md shadow-md"
        onClick={saveAvatar}
      >
        Save Avatar
      </button>
    </div>
  );
};

export default AvatarSelection;
