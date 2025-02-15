import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import Profile from "./pages/Profile";
import UploadFile from "./pages/UploadFile";
import Community from "./pages/Community";
import UserProfile from "./pages/UserProfile";
import DatasetDetail from "./pages/DatasetDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/upload" element={<UploadFile />} />
        <Route path="/community" element={<Community />} />
        <Route path="/profile/:userId" element={<UserProfile />} />
        <Route path="/datasets/:id" element={<DatasetDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
