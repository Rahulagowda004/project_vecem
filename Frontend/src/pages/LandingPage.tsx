import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();

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