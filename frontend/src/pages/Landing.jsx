import React from 'react';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import Footer from '../components/landing/Footer';

export default function Landing() {
  return (
    <main className="w-full min-h-screen">
      <Navbar />
      <HeroSection />
      <Footer />
    </main>
  );
}