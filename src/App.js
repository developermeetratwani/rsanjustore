import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import AdminRoute from './components/AdminRoute';
import RepairAdminLogin from './components/RepairAdminLogin';
import TechnicianPortal from './components/TechnicianPortal';
import Home from './site/Home';
import ProductPage from './site/ProductPage';
import { Header, Footer } from './site/Chrome';

const NoIndex = ({ title, children }) => (
  <>
    <title>{title}</title>
    <meta name="robots" content="noindex, nofollow" />
    {children}
  </>
);

function NotFound() {
  return (
    <div className="site">
      <title>Page not found – R Sanju Store</title>
      <meta name="robots" content="noindex" />
      <Header />
      <main className="wrap section empty-page">
        <h1>Page not found</h1>
        <p className="muted">The page you are looking for does not exist or has moved.</p>
        <a className="btn btn-accent" href="/">Back to home</a>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/admin" element={<NoIndex title="Admin – R Sanju Store"><AdminRoute /></NoIndex>} />
        <Route path="/repair-admin" element={<NoIndex title="Repair Admin – R Sanju Store"><RepairAdminLogin /></NoIndex>} />
        <Route path="/technician" element={<NoIndex title="Technician Portal – R Sanju Store"><TechnicianPortal /></NoIndex>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
