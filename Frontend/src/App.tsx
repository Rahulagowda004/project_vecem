import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import UploadFile from "./pages/UploadFile";
import Community from "./pages/Community";
import UserProfile from "./pages/UserProfile";
import DatasetDetail from "./pages/DatasetDetail";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { useAuth } from './contexts/AuthContext';
import DatasetEdit from './pages/DatasetEdit';
import Documentation from './pages/Documentation';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-900">
      {children}
    </div>
  );
};

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <AppLayout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={
          user ? <Navigate to="/home" replace /> : <Login />
        } />
        <Route path="/signup" element={
          user ? <Navigate to="/home" replace /> : <Signup />
        } />
        <Route path="/home" element={<HomePage />} />

        <Route path="/upload" element={<UploadFile />} />
        <Route path="/community" element={<Community />} />
        <Route path="/profile/:userId" element={<UserProfile />} />
        <Route path="/datasets/:datasetId" element={<DatasetDetail />} /> {/* Changed from :Id to :datasetId */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/datasets/:datasetId/edit" element={<DatasetEdit />} />
        <Route path="/documentation" element={<Documentation />} />

        {/* Update the profile route to handle username */}
        <Route path="/profile" element={<UserProfile />} /> {/* Default profile route */}
        <Route path="/profile/:username" element={<UserProfile />} /> {/* Profile with username parameter */}

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
