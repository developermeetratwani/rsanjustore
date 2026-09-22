import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminPanel from './AdminPanel';
import MasterAdminDashboard from './MasterAdminDashboard';
import AccountantDashboard from './AccountantDashboard';
import RepairAdminPanel from './RepairAdminPanel';

const AdminRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    // Check if admin is already logged in
    const auth = localStorage.getItem('rsanju_admin_auth');
    const savedRole = localStorage.getItem('rsanju_admin_role');
    
    if (auth === 'true') {
      setIsAuthenticated(true);
      setRole(savedRole || 'master'); // fallback to master for testing
    }
  }, []);

  const handleLogin = () => {
    // For now, simulate Master Admin login. 
    // Once backend is connected, we will set the role from the JWT payload.
    setIsAuthenticated(true);
    const simulatedRole = 'master'; 
    setRole(simulatedRole);
    localStorage.setItem('rsanju_admin_role', simulatedRole);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  // Render appropriate dashboard based on role
  if (role === 'master') {
    return <MasterAdminDashboard />;
  } else if (role === 'accountant') {
    return <AccountantDashboard />;
  } else if (role === 'sub_admin' || role === 'repair') {
    return <RepairAdminPanel />;
  }

  // Fallback
  return <AdminPanel />;
};

export default AdminRoute;
