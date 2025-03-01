import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import { PrivateRoute } from "./components/PrivateRoute";
import HomePage from "./pages/HomePage";
import UserProfile from "./pages/UserProfile"; // Changed from Profile
import UploadFile from "./pages/UploadFile";
import Community from "./pages/Community";
import DatasetDetail from "./pages/DatasetDetail";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Documentation from "./pages/Documentation";
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
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <PrivateRoute>
              <UploadFile />
            </PrivateRoute>
          }
        />
        <Route
          path="/community"
          element={
            <PrivateRoute>
              <Community />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
          path="/documentation"
          element={
            <PrivateRoute>
              <Documentation />
            </PrivateRoute>
          }
        />

        {/* Updated Dataset Routes */}
        <Route
          path="/:username/:datasetname"
          element={
            <PrivateRoute>
              <DatasetDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/:username/:datasetname/edit"
          element={
            <PrivateRoute>
              <DatasetEdit />
            </PrivateRoute>
          }
        />
        
        {/* Profile Route */}
        <Route
          path="/:username"
          element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
