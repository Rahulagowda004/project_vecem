import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import Profile from "./pages/Profile";
import UploadFile from "./pages/UploadFile"; // Import the UploadFile component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/upload" element={<UploadFile />} />{" "}
        {/* Add the route for UploadFile */}
      </Routes>
    </Router>
  );
}

export default App;
