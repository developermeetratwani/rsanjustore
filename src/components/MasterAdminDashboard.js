import React, { useState } from 'react';
import './RepairAdminPanel.css';

const MasterAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('staff');

  // All staff: sub-admins, accountants, and technicians
  const [staff, setStaff] = useState([]);

  const [newMember, setNewMember] = useState({
    username: '',
    password: '',
    role: 'sub_admin',
    compensationType: 'percentage',
    compensationValue: ''
  });

  const [message, setMessage] = useState({ text: '', type: '' });

  const handleLogout = () => {
    localStorage.removeItem('rsanju_admin_auth');
    localStorage.removeItem('rsanju_admin_role');
    window.location.href = '/';
  };

  const isTechnician = newMember.role === 'technician';

  const handleCreate = (e) => {
    e.preventDefault();
    const { username, password, role, compensationType, compensationValue } = newMember;

    if (!username || !password) {
      setMessage({ text: 'Username and password are required.', type: 'error' });
      return;
    }

    if (isTechnician && !compensationValue) {
      setMessage({ text: 'Please enter a compensation value for the technician.', type: 'error' });
      return;
    }

    const entry = {
      id: Date.now().toString(),
      username,
      role,
      ...(isTechnician && {
        compensationType,
        compensationValue: parseFloat(compensationValue)
      })
    };

    setStaff([...staff, entry]);
    setNewMember({ username: '', password: '', role: 'sub_admin', compensationType: 'percentage', compensationValue: '' });
    setMessage({ text: `${role.replace('_', ' ')} "${username}" added successfully!`, type: 'success' });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleDelete = (id) => {
    setStaff(staff.filter(s => s.id !== id));
  };

  const getRoleLabel = (role) => {
    const labels = {
      sub_admin: 'Sub-Admin',
      accountant: 'Accountant',
      technician: 'Technician'
    };
    return labels[role] || role;
  };

  const getRoleBadgeStyle = (role) => {
    const styles = {
      sub_admin: { background: '#fff', color: '#000', border: '1px solid #000' },
      accountant: { background: '#222', color: '#fff', border: '1px solid #222' },
      technician: { background: '#555', color: '#fff', border: '1px solid #555' }
    };
    return styles[role] || {};
  };

  return (
    <div className="repair-admin-panel">
      <header className="repair-admin-header">
        <div className="repair-header-content">
          <div className="repair-logo">
            <span className="repair-icon">👑</span>
            <h1>Master Admin Portal</h1>
          </div>
          <div className="repair-actions">
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <div className="repair-admin-container">
        <div className="repair-tabs">
          <button
            className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            Manage Staff
          </button>
        </div>

        {activeTab === 'staff' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>

            {/* LEFT: Create Form */}
            <div className="bill-card">
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '15px' }}>Add New Member</h2>

              {message.text && (
                <div style={{
                  padding: '10px 14px',
                  marginBottom: '15px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  background: message.type === 'success' ? '#000' : '#ff3333',
                  color: '#fff'
                }}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={newMember.role}
                    onChange={e => setNewMember({ ...newMember, role: e.target.value })}
                  >
                    <option value="sub_admin">Sub-Admin</option>
                    <option value="accountant">Accountant</option>
                    <option value="technician">Technician</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{isTechnician ? 'Technician Name' : 'Username'}</label>
                  <input
                    type="text"
                    value={newMember.username}
                    onChange={e => setNewMember({ ...newMember, username: e.target.value })}
                    placeholder={isTechnician ? 'Enter technician name' : 'Enter username'}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={newMember.password}
                    onChange={e => setNewMember({ ...newMember, password: e.target.value })}
                    placeholder="Enter password"
                    required
                  />
                </div>

                {/* Compensation fields — only for Technician */}
                {isTechnician && (
                  <>
                    <div className="form-group">
                      <label>Compensation Type</label>
                      <select
                        value={newMember.compensationType}
                        onChange={e => setNewMember({ ...newMember, compensationType: e.target.value })}
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="salary">Fixed Salary (₹)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        {newMember.compensationType === 'percentage'
                          ? 'Commission Percentage (%)'
                          : 'Monthly Salary (₹)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={newMember.compensationType === 'percentage' ? '100' : undefined}
                        value={newMember.compensationValue}
                        onChange={e => setNewMember({ ...newMember, compensationValue: e.target.value })}
                        placeholder={newMember.compensationType === 'percentage' ? 'e.g. 40' : 'e.g. 15000'}
                        required
                      />
                    </div>
                  </>
                )}

                <button type="submit" className="btn-create-bill">Add Member</button>
              </form>
            </div>

            {/* RIGHT: Current Staff List */}
            <div className="bill-card">
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '15px' }}>
                Current Staff ({staff.length})
              </h2>

              {staff.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#aaa', padding: '40px 0', fontSize: '14px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>👥</div>
                  No staff added yet. Use the form to add members.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {staff.map(member => (
                    <div key={member.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      background: '#111'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          ...getRoleBadgeStyle(member.role)
                        }}>
                          {getRoleLabel(member.role)}
                        </span>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px' }}>{member.username}</div>
                          {member.role === 'technician' && (
                            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>
                              {member.compensationType === 'percentage'
                                ? `${member.compensationValue}% Commission`
                                : `₹${member.compensationValue}/month Salary`}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(member.id)}
                        style={{
                          background: 'none',
                          border: '1px solid #ff4444',
                          color: '#ff4444',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterAdminDashboard;
