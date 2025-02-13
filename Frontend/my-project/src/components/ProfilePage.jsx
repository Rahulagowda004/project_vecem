import React from 'react';

// Sample data for demonstration
const userProfile = {
  username: 'CurrentUsername',
  aboutMe: 'This is about me. I love data science and machine learning!',
  datasets: [
    { id: 1, title: 'Dataset 1', description: 'Description of dataset 1' },
    { id: 2, title: 'Dataset 2', description: 'Description of dataset 2' },
    { id: 3, title: 'Dataset 3', description: 'Description of dataset 3' },
  ],
};

const ProfilePage = () => {
  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-xl font-bold">Dashboard</h2>
        </div>
        <nav className="mt-4">
          <ul>
            <li className="p-2 hover:bg-gray-200 cursor-pointer">Profile</li>
            <li className="p-2 hover:bg-gray-200 cursor-pointer">Datasets</li>
            <li className="p-2 hover:bg-gray-200 cursor-pointer">Kernels</li>
            <li className="p-2 hover:bg-gray-200 cursor-pointer">Competitions</li>
            <li className="p-2 hover:bg-gray-200 cursor-pointer">Settings</li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <div className="bg-white shadow-md rounded-lg p-6 mb-4">
          <h2 className="text-xl font-semibold">{userProfile.username}</h2>
          <p className="mt-2 text-gray-600">{userProfile.aboutMe}</p>
        </div>

        <h2 className="text-xl font-bold mb-2">Uploaded Datasets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userProfile.datasets.map((dataset) => (
            <div key={dataset.id} className="bg-white shadow-md rounded-lg p-4">
              <h3 className="text-lg font-semibold">{dataset.title}</h3>
              <p className="text-gray-600">{dataset.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;