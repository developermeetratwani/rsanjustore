import React from 'react';
import './RepairAdminPanel.css'; 

const AccountantDashboard = () => {

  const handleLogout = () => {
    localStorage.removeItem('rsanju_admin_auth');
    localStorage.removeItem('rsanju_admin_role');
    window.location.href = '/';
  };

  return (
    <div className="repair-admin-panel">
      <header className="repair-admin-header">
        <div className="repair-header-content">
          <div className="repair-logo">
            <span className="repair-icon">📊</span>
            <h1>Accountant Portal</h1>
          </div>
          <div className="repair-actions">
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <div className="repair-admin-container">
        <h2 className="section-title">Financial Overview (Preview)</h2>
        <div className="repair-stats">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>$50,000</h3>
              <p>Total Revenue</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💸</div>
            <div className="stat-info">
              <h3>$12,500</h3>
              <p>Commissions Paid</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <h3 style={{color: '#00ff00'}}>$37,500</h3>
              <p>Net Profit</p>
            </div>
          </div>
        </div>

        <div className="bill-card" style={{marginTop: '30px'}}>
          <h2 className="section-title" style={{textAlign: 'left', marginBottom: '15px'}}>Recent Transactions</h2>
          <p style={{color: '#aaa', fontStyle: 'italic'}}>Waiting for backend connection to load actual transaction data...</p>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;
