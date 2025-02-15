import React, { useState } from "react";
import { Camera } from "lucide-react";

const avatars = [
  "/avatars/avatar1.png",
  "/avatars/avatar2.png",
  "/avatars/avatar3.png",
  "/avatars/avatar4.png",
  "/avatars/avatar5.png",
  "/avatars/avatar6.png",
  // Add more avatar paths as needed
];

interface AvatarSelectorProps {
  user: any;
  selectedAvatar: string;
  setSelectedAvatar: (avatar: string) => void;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  user,
  selectedAvatar,
  setSelectedAvatar,
}) => {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const handleAvatarClick = () => {
    setIsAvatarModalOpen(true);
  };

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
    setIsAvatarModalOpen(false);
  };

  return (
    <div className="relative mb-6">
      <div className="w-32 h-32 mx-auto relative">
        <img
          src={selectedAvatar}
          alt={user.name}
          className="w-full h-full rounded-full object-cover border-4 border-gray-800"
        />
        <button
          onClick={handleAvatarClick}
          className="absolute bottom-0 right-0 bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors"
        >
          <Camera size={18} className="text-gray-100" />
        </button>
      </div>

      {/* Avatar Selection Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">
              Choose an Avatar
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {avatars.map((avatar) => (
                <img
                  key={avatar}
                  src={avatar}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full cursor-pointer hover:opacity-75"
                  onClick={() => handleAvatarSelect(avatar)}
                />
              ))}
            </div>
            <button
              onClick={() => setIsAvatarModalOpen(false)}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarSelector;
