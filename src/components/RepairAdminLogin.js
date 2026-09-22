import React, { useState } from 'react';
import { motion } from 'framer-motion';
import RepairAdminPanel from './RepairAdminPanel';
import './AdminLogin.css';

const API_BASE = 'http://localhost:5000/api';

const RepairAdminLogin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('rsanju_repair_admin_auth') === 'true'
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Authenticate through MongoDB Atlas API
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim() || 'master',
          password
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const authUser = {
          username: data.username,
          role: data.role,
          token: data.token
        };
        localStorage.setItem('rsanju_repair_admin_auth', 'true');
        localStorage.setItem('rsanju_auth_user', JSON.stringify(authUser));
        setIsAuthenticated(true);
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch (err) {
      // Fallback if backend is momentarily offline
      if (password === 'masterpassword' || (username === 'master' && password === 'Sanju1984')) {
        const masterUser = { username: 'master', role: 'master', token: 'offline-master-token' };
        localStorage.setItem('rsanju_repair_admin_auth', 'true');
        localStorage.setItem('rsanju_auth_user', JSON.stringify(masterUser));
        setIsAuthenticated(true);
      } else {
        setError('Login failed. Please verify credentials or backend status.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('rsanju_repair_admin_auth');
    localStorage.removeItem('rsanju_auth_user');
    setIsAuthenticated(false);
  };

  if (isAuthenticated) {
    return <RepairAdminPanel onLogout={handleLogout} />;
  }

  return (
    <div className="admin-login">
      <motion.div
        className="login-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="login-icon">
          🔧
        </div>

        <h1 className="login-title">Repair Admin Portal</h1>
        <p className="login-subtitle">Master Admin • Sub-Admin • Accountant</p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group" style={{ marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Username (e.g. master, subadmin1)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
              autoComplete="username"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginBottom: 14, color: '#ef4444', fontSize: '13px', textAlign: 'center' }}
            >
              ⚠️ {error}
            </motion.div>
          )}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 16, padding: '10px 14px', background: '#111', borderRadius: '8px', border: '1px solid #222', fontSize: '11px', color: '#777', textAlign: 'center' }}>
          <div><strong>Roles:</strong> Master Admin (Full Control) • Sub-Admin • Accountant</div>
          <div style={{ marginTop: 4 }}>Default Master: <code>master</code> / <code>masterpassword</code> (or admin key)</div>
        </div>

        <div className="login-footer" style={{ marginTop: 20 }}>
          <a href="/">← Back to Home</a>
        </div>
      </motion.div>
    </div>
  );
};

export default RepairAdminLogin;
