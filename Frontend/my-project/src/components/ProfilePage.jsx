import React from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import { Button } from "@material-tailwind/react";
import { useAuth0 } from "@auth0/auth0-react"; // Importing useAuth0 to manage logout

export default function ProfilePage() {
  const { logout } = useAuth0(); // Using logout from Auth0

  const handleLogout = () => {
    // Make sure to log out and redirect to your home page (localhost:5173)
    logout({
      returnTo: window.location.origin // Dynamically grabs the base URL where the app is running
    });
  };

  return (
    <section className="min-h-screen bg-white py-16 px-4 md:px-0">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start">
        
        {/* Profile Image */}
        <div className="w-full md:w-1/3 flex justify-center md:justify-start">
          <img
            src="/avatars/default.png" // Local path from the public directory
            alt="Avatar"
            className="w-48 h-48 rounded-full shadow-md"
          />
        </div>

        {/* Profile Details */}
        <div className="w-full md:w-2/3 mt-6 md:mt-0 md:pl-10">
          <h2 className="text-3xl font-bold text-gray-800">About Me</h2>
          <h4 className="text-xl font-semibold text-red-500 mt-1">
            A Lead UX & UI designer based in Canada
          </h4>
          <p className="text-gray-600 mt-4">
            I <span className="font-semibold">design and develop</span> services for customers of all sizes,
            specializing in creating stylish, modern websites, web services, and online stores.
            My passion is to design digital user experiences through bold interfaces and meaningful interactions.
          </p>

          {/* User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <p>
                <span className="font-semibold text-gray-700">Username:</span> Benhur
              </p>
              <p>
                <span className="font-semibold text-gray-700">Email:</span> vector@gmail.com
              </p>
            </div>
          </div>

          {/* Buttons Row */}
          <div className="flex justify-between mt-6 space-x-4">
            {/* Edit Profile Button */}
            <Link to="/edit-profile">
              <button className="px-6 py-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Edit Profile
              </button>
            </Link>

            {/* Upload File Button */}
            <Link to="/upload-file">
              <button className="px-6 py-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Upload File
              </button>
            </Link>

            {/* Log Out Button */}
            <button
              className="px-6 py-2 text-white bg-red-600 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              onClick={handleLogout} // Call handleLogout function on click
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
