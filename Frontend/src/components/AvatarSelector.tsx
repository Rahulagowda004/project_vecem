import React, { useEffect, useState, Dispatch, SetStateAction } from "react";
import { Camera } from "lucide-react";

interface User {
  displayName?: string;
}

interface AvatarSelectorProps {
  user: User;
  selectedAvatar: string;
  setSelectedAvatar: Dispatch<SetStateAction<string>>;
  isEditing?: boolean;
  onAvatarClick?: () => void;
  className?: string;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  user,
  selectedAvatar,
  setSelectedAvatar,
  isEditing = false,
  onAvatarClick
}) => {
  const [showAvatars, setShowAvatars] = useState(false);
  const [avatars, setAvatars] = useState<string[]>([]);

  const handleAvatarClick = () => {
    if (isEditing) {
      setShowAvatars(true);
    }
  };

  useEffect(() => {
    // Load all avatars from public/avatars directory
    const importAvatars = async () => {
      const avatarPaths = [];
      for (let i = 1; i <= 24; i++) {
        avatarPaths.push(`/avatars/avatar${i}.png`);
      }
      setAvatars(avatarPaths);
    };

    importAvatars();
  }, []);

  return (
    <div className="relative z-0">
      <div 
        className="relative cursor-pointer" 
        onClick={handleAvatarClick}
      >
        <img
          src={selectedAvatar || "/avatars/default.png"}
          alt={user?.displayName || "Profile"}
          className="w-32 h-32 rounded-full object-cover border-2 border-gray-700/50 shadow-xl"
        />
        {isEditing && (
          <button className="absolute bottom-2 right-2 bg-gray-800/90 p-2 rounded-full hover:bg-gray-700 transition-all border border-gray-600/50">
            <Camera size={16} className="text-cyan-400" />
          </button>
        )}
      </div>

      {showAvatars && (
        <div 
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setShowAvatars(false)}
        >
          <div 
            className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 
              shadow-xl max-w-lg w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-6">
              Choose Your Avatar
            </h3>
            <div className="grid grid-cols-4 gap-4 mb-6 max-h-[60vh] overflow-y-auto pr-2">
              {avatars.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => {
                    setSelectedAvatar(avatar);
                    setShowAvatars(false);
                  }}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all
                    group hover:scale-105 ${
                      selectedAvatar === avatar 
                        ? 'border-cyan-400 shadow-lg shadow-cyan-400/20' 
                        : 'border-gray-600/50 hover:border-gray-500'
                    }`}
                >
                  <img
                    src={avatar}
                    alt="Avatar option"
                    className="w-full h-full object-cover"
                  />
                  {selectedAvatar === avatar && (
                    <div className="absolute inset-0 bg-cyan-400/20 flex items-center justify-center">
                      <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowAvatars(false)}
                className="px-4 py-2 bg-gray-700/50 text-gray-300 
                  hover:bg-gray-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarSelector;
