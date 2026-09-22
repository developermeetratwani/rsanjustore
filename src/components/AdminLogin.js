import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './AdminLogin.css';

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Admin password
  const ADMIN_PASSWORD = 'Sanju1984';

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('rsanju_admin_auth', 'true');
      onLogin();
    } else {
      setError('Invalid password!');
      setPassword('');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="admin-login-page">
      <motion.div
        className="admin-login-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="admin-lock-icon">
          🔐
        </div>

        <h1 className="admin-login-title">Admin Access</h1>
        <p className="admin-login-subtitle">Enter password to continue</p>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="admin-input"
              autoFocus
            />
          </div>

          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.div>
          )}

          <button type="submit" className="admin-login-btn">
            Login
          </button>
        </form>

        <a href="/" className="back-to-home">
          ← Back to Home
        </a>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
