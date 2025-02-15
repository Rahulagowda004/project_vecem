import React from "react";
import { useParams } from "react-router-dom";

const UserProfile = () => {
  const { userId } = useParams();

  // Mock user data
  const user = {
    id: userId,
    name: "John Doe",
    email: "john.doe@example.com",
    bio: "Researcher in medical imaging and AI.",
    profilePicture: "/path/to/profile-picture.jpg",
    datasets: [
      {
        id: "1",
        name: "Medical Imaging Dataset",
        description: "Collection of medical imaging data for AI training",
      },
      // ...other datasets
    ],
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <img
              src={user.profilePicture}
              alt="Profile"
              className="w-16 h-16 rounded-full mr-4"
            />
            <div>
              <h1 className="text-2xl font-bold text-blue-400">{user.name}</h1>
              <p className="text-gray-300">{user.email}</p>
            </div>
          </div>
          <p className="text-gray-300">{user.bio}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Datasets</h2>
          <ul className="space-y-4">
            {user.datasets.map((dataset) => (
              <li key={dataset.id} className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-400">
                  {dataset.name}
                </h3>
                <p className="text-gray-300">{dataset.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
