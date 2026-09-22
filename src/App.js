import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Hero from './components/Hero';
import MegaOffers from './components/MegaOffers';
import ProductShowcase from './components/ProductShowcase';
import SpecialBanner from './components/SpecialBanner';
import RepairServices from './components/RepairServices';
import CustomerReviews from './components/CustomerReviews';
import Contact from './components/Contact';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import PopupOffer from './components/PopupOffer';
import FloatingButtons from './components/FloatingButtons';
import ParticleBackground from './components/ParticleBackground';
import MusicToggle from './components/MusicToggle';
import AdminRoute from './components/AdminRoute';
import RepairAdminLogin from './components/RepairAdminLogin';
import ProductDetails from './components/ProductDetails';
import TechnicianPortal from './components/TechnicianPortal';

function MainWebsite() {
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Loading screen
    setTimeout(() => {
      setLoading(false);
      setTimeout(() => setShowPopup(true), 1000);
    }, 3000);
  }, []);

  return (
    <div className="App">
      {loading && <LoadingScreen />}
      <ParticleBackground />
      <MusicToggle />
      <FloatingButtons />
      {showPopup && <PopupOffer onClose={() => setShowPopup(false)} />}
      
      <Hero />
      <SpecialBanner />
      <MegaOffers />
      <ProductShowcase />
      <RepairServices />
      <CustomerReviews />
      <Contact />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainWebsite />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="/repair-admin" element={<RepairAdminLogin />} />
        <Route path="/technician" element={<TechnicianPortal />} />
      </Routes>
    </Router>
  );
}

export default App;
