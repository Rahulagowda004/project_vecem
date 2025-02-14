import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import Profile from "./pages/Profile";
import UploadFile from "./pages/UploadFile";
import Community from "./pages/Community"; // Import the Community component
import UserProfile from "./pages/UserProfile"; // Import the UserProfile component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/upload" element={<UploadFile />} />
        <Route path="/community" element={<Community />} />{" "}
        {/* Add the route for Community */}
        <Route path="/profile/:userId" element={<UserProfile />} />{" "}
        {/* Add the route for UserProfile */}
      </Routes>
    </Router>
  );
}

export default App;
