import React, { useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { scrollToElement } from '../utils/scroll';

const LandingPage = () => {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollToHero) {
      scrollToElement('hero');
      // Clean up the state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="container mx-auto pt-16">
        <Hero />
        <Features />
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;