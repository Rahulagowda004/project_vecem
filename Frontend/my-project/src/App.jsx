import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'; // Import Router and routing components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Footer from './components/Footer';
import ProfilePage from './components/ProfilePage';
import AvatarSelectionPage from './components/AvatarSelectionPage'; // Import the Avatar Selection Page component

const AppContent = () => {
  const location = useLocation(); // Get the current route

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Conditionally render Navbar and Footer based on the route */}
      {location.pathname === '/' && <Navbar />} {/* Navbar only on home route */}
      
      <div style={{ flex: 1 }}>
        {/* Define routes here */}
        <Routes>
          <Route path="/" element={<><Hero /><About /></>} /> {/* Home route */}
          <Route path="/profile" element={<ProfilePage />} /> {/* Profile route */}
          <Route path="/select-avatar" element={<AvatarSelectionPage />} /> {/* Avatar Selection route */}
        </Routes>
      </div>

      {location.pathname === '/' && <Footer />} {/* Footer only on home route */}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
