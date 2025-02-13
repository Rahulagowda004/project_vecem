// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Footer from './components/Footer';
import ProfilePage from './components/ProfilePage';
import AvatarSelectionPage from './components/AvatarSelectionPage';
import EditProfile from './components/EditProfile';
import UploadFile from './components/UploadFile'; // Importing UploadFile component

const AppContent = () => {
  const location = useLocation(); // Get the current location

  // Define routes where Navbar and Footer should be visible
  const showNavbarAndFooter = location.pathname === '/' || location.pathname === '/profile';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Conditionally render Navbar */}
      {showNavbarAndFooter && <Navbar />}

      {/* Main content area */}
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<><Hero /><About /></>} /> {/* Home route */}
          <Route path="/profile" element={<ProfilePage />} /> {/* Profile page route */}
          <Route path="/editprofile" element={<EditProfile />} /> {/* Edit Profile */}
          <Route path="/uploadfiles" element={<UploadFile />} /> {/* Upload File */}
          <Route path="/select-avatar" element={<AvatarSelectionPage />} /> {/* Avatar selection page */}
        </Routes>
      </div>

      {/* Conditionally render Footer */}
      {showNavbarAndFooter && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
