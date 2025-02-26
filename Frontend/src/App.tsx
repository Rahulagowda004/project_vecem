import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import Profile from "./pages/Profile";
import UploadFile from "./pages/UploadFile";
import Community from "./pages/Community";
import UserProfile from "./pages/UserProfile";
import DatasetDetail from "./pages/DatasetDetail";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { useAuth } from "./contexts/AuthContext";
import DatasetEdit from "./pages/DatasetEdit";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="min-h-screen bg-gray-900">{children}</div>;
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
        <Route
          path="/login"
          element={user ? <Navigate to="/home" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/home" replace /> : <Signup />}
        />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={user ? <HomePage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/upload"
          element={user ? <UploadFile /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/community"
          element={user ? <Community /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/profile/:userId"
          element={user ? <UserProfile /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/datasets/:id"
          element={user ? <DatasetDetail /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/datasets/:id/edit"
          element={user ? <DatasetEdit /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/settings"
          element={user ? <Settings /> : <Navigate to="/login" replace />}
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
