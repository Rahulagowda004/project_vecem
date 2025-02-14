import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Footer from '../components/Footer';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // This would typically handle authentication
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar onLogin={handleLogin} />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
};

export default LandingPage;