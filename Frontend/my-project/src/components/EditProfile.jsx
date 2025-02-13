import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link for routing

// List avatars in the public/avatars directory
const avatars = [
  "avatar1.png",
  "avatar2.png",
  "avatar3.png",
  "avatar4.png",
];

const EditProfile = () => {
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [email, setEmail] = useState("richard@fusionauth.io");
  const [firstName, setFirstName] = useState("Richard");
  const [lastName, setLastName] = useState("Hendricks");
  const [username, setUsername] = useState("richard_h"); // Add a username state

  // Handle avatar selection
  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
  };

  // Handle username change
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  return (
    <div style={{ padding: "40px", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <div className="container rounded shadow-lg bg-white p-4" style={{ maxWidth: "1000px", margin: "auto" }}>
        <div className="d-flex align-items-center justify-content-between">
          {/* Profile Section - Avatar and User Info */}
          <div className="text-center p-3" style={{ flex: 1 }}>
            <img
              className="rounded-circle"
              width="120px"
              src={`/avatars/${selectedAvatar}`} // Dynamically load avatar from the public/avatars directory
              alt="Profile"
              style={{
                borderRadius: "50%", // Make the avatar rounded
                border: "3px solid #6f42c1", // Set the border style and color
                cursor: "pointer", // Make avatar clickable
                transition: "transform 0.2s ease-in-out", // Add smooth transition on hover
              }}
              onClick={() => handleAvatarSelect(selectedAvatar)} // Click to change avatar
            />
            <h4 className="mt-2">{firstName}</h4>
            <h5>@{username}</h5> {/* Display current username */}
          </div>

          {/* Edit Form Section */}
          <div style={{ flex: 2 }}>
            <div className="mt-3">
              <label className="form-label">Username: </label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)} // Update username state
              />
            </div>    

            {/* Avatar Selection Section */}
            <div className="mt-4">
              <label className="form-label">Choose Avatar</label>
              <div className="d-flex justify-content-start" style={{ overflowX: "auto" }}>
                {avatars.map((avatar, index) => (
                  <div
                    key={index}
                    onClick={() => handleAvatarSelect(avatar)}
                    style={{
                      cursor: "pointer",
                      margin: "10px",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    <img
                      src={`/avatars/${avatar}`} // Reference avatar images in the public/avatars folder
                      alt={`avatar-${index}`}
                      width="100px"
                      height="100px"
                      style={{
                        borderRadius: "50%", // Make avatar rounded
                        border: selectedAvatar === avatar ? "4px solid #6f42c1" : "2px solid transparent",
                        transition: "all 0.3s ease-in-out",
                      }}
                      onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
                      onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link to="/profile">
                <button
                  className="px-6 py-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ padding: "10px 20px", borderRadius: "20px" }}
                >
                  Submit
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
