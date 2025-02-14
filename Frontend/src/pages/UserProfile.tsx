import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Calendar,
  Link as LinkIcon,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  location: string;
  email: string;
  joinDate: string;
  website: string;
  stats: {
    messages: number;
    followers: number;
    following: number;
  };
}

function UserProfile() {
  const { userId } = useParams();

  // Mock data - replace with real data from your backend
  const userProfile: UserProfile = {
    id: userId || "",
    name: "Alice Johnson",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    bio: "Full-stack developer passionate about creating beautiful and functional web applications. Love working with React and TypeScript.",
    location: "San Francisco, CA",
    email: "alice@example.com",
    joinDate: "Joined January 2024",
    website: "https://alice-johnson.dev",
    stats: {
      messages: 1234,
      followers: 567,
      following: 432,
    },
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            to="/community"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Chat
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600"></div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="absolute -top-16">
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-32 h-32 rounded-full border-4 border-gray-800 object-cover"
              />
            </div>

            {/* User Info */}
            <div className="pt-20">
              <h1 className="text-2xl font-bold">{userProfile.name}</h1>
              <p className="text-gray-400 mt-1">{userProfile.bio}</p>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-400">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {userProfile.location}
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {userProfile.email}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {userProfile.joinDate}
                </div>
                <div className="flex items-center">
                  <LinkIcon className="w-4 h-4 mr-1" />
                  <a
                    href={userProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {userProfile.website.replace("https://", "")}
                  </a>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {userProfile.stats.messages}
                  </div>
                  <div className="text-sm text-gray-400">Messages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {userProfile.stats.followers}
                  </div>
                  <div className="text-sm text-gray-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {userProfile.stats.following}
                  </div>
                  <div className="text-sm text-gray-400">Following</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
