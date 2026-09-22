import React, { useState, useEffect } from 'react';

const API_BASE = process.env.NODE_ENV === 'production' ? 'https://rsanjustore-36en.onrender.com/api' : 'http://localhost:5000/api';

const IS = {
  width: '100%', padding: '12px 14px', borderRadius: 8,
  border: '1px solid #333', background: '#111', color: '#fff',
  fontSize: 15, outline: 'none', transition: 'border 0.2s',
  boxSizing: 'border-box'
};

const BS = (bg, color, border = 'none', width = '100%') => ({
  width, padding: '14px', background: bg, color: color,
  border, borderRadius: 8, fontWeight: 700, fontSize: 16,
  cursor: 'pointer', transition: 'opacity 0.2s'
});

const TechnicianPortal = () => {
  const [techList, setTechList] = useState([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [pin, setPin] = useState('');
  const [token, setToken] = useState(localStorage.getItem('rsanju_tech_token'));
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('rsanju_tech_user')) || null);
  
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/technicians/list`)
      .then(r => r.json())
      .then(data => setTechList(data))
      .catch(e => console.error(e));
  }, []);

  useEffect(() => {
    if (token && currentUser) {
      fetchDashboardData();
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/technicians/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: selectedTech, pin })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('rsanju_tech_token', data.token);
        localStorage.setItem('rsanju_tech_user', JSON.stringify(data.user));
        setToken(data.token);
        setCurrentUser(data.user);
      } else {
        alert(data.message || 'Login failed');
      }
    } catch(e) {
      alert('Network error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('rsanju_tech_token');
    localStorage.removeItem('rsanju_tech_user');
    setToken(null);
    setCurrentUser(null);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/bills`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const allBills = await res.json();
        const myBills = allBills.filter(b => b.repairerName === currentUser.name);
        setBills(myBills);
      }
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  const updateCustody = async (billId, status) => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;
    
    const nowISO = new Date().toISOString();
    const updatedHistory = [...(bill.custodyHistory || []), {
      timestamp: nowISO,
      holder: status === 'Store Front Desk' ? 'Store Front Desk' : currentUser.name,
      updatedBy: currentUser.name,
      notes: status === 'Store Front Desk' ? 'Returned to store after repair' : 'Update by technician'
    }];
    
    const updatedBill = { ...bill, custodyHistory: updatedHistory };
    
    // Optimistic UI
    setBills(bills.map(b => b.id === billId ? updatedBill : b));
    
    try {
      await fetch(`${API_BASE}/bills/${billId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedBill)
      });
    } catch(e) {
      alert('Network error');
    }
  };

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 400, background: '#0a0a0a', border: '1px solid #222', borderRadius: 16, padding: 30 }}>
          <h1 style={{ textAlign: 'center', color: '#fff', marginBottom: 8, fontSize: 24 }}>👨‍🔧 Technician Portal</h1>
          <p style={{ textAlign: 'center', color: '#888', marginBottom: 30 }}>Log in to view your jobs and earnings</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, color: '#aaa', fontSize: 13, fontWeight: 700 }}>YOUR NAME</label>
              <select style={IS} value={selectedTech} onChange={e => setSelectedTech(e.target.value)} required>
                <option value="">-- Select --</option>
                {techList.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, color: '#aaa', fontSize: 13, fontWeight: 700 }}>4-DIGIT PIN</label>
              <input style={IS} type="password" maxLength={4} pattern="\d{4}" value={pin} onChange={e => setPin(e.target.value)} required placeholder="e.g. 0000" />
            </div>
            <button type="submit" style={{ ...BS('#2563eb', '#fff'), marginTop: 10 }}>Log In</button>
          </form>
        </div>
      </div>
    );
  }

  // Calculate earnings
  const completedMyBills = bills.filter(b => b.status === 'completed');
  const totalEarned = completedMyBills.reduce((s, b) => s + (b.commission || 0), 0);
  
  // Assigned phones currently in possession (all active jobs assigned to this tech)
  const activeJobs = bills.filter(b => b.status === 'in-progress');
  const phonesInPossession = activeJobs;

  const deletedMyBills = bills.filter(b => b.status === 'deleted');

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <h1 style={{ margin: 0, fontSize: 20 }}>👨‍🔧 Hello, {currentUser.name}!</h1>
          <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #333', color: '#aaa', padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}>Logout</button>
        </div>

        <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: 12, padding: 20, marginBottom: 30 }}>
          <div style={{ fontSize: 13, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1 }}>Your Total Earnings</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: '#10b981', marginTop: 4 }}>₹{totalEarned}</div>
          <div style={{ fontSize: 13, color: '#555', marginTop: 8 }}>From {completedMyBills.length} completed jobs</div>
        </div>

        <h2 style={{ fontSize: 18, marginBottom: 16 }}>📱 Phones Currently With You ({phonesInPossession.length})</h2>
        {loading ? (
          <div style={{ color: '#888' }}>Loading jobs...</div>
        ) : phonesInPossession.length === 0 ? (
          <div style={{ padding: 40, background: '#0a0a0a', border: '1px dashed #333', borderRadius: 12, textAlign: 'center', color: '#888' }}>
            No devices are currently tracked to you.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {phonesInPossession.map(bill => (
              <div key={bill.id} style={{ background: '#111', border: '1px solid #333', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16 }}>{bill.deviceModel}</h3>
                    <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Job ID: {bill.id}</div>
                  </div>
                  <span style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>In Your Custody</span>
                </div>
                <div style={{ fontSize: 14, color: '#ccc', marginBottom: 16 }}>
                  🔧 {bill.serviceType}
                </div>
                <button onClick={() => updateCustody(bill.id, 'Store Front Desk')} style={BS('#2563eb', '#fff')}>
                  ✅ Done: Return to Front Desk
                </button>
              </div>
            ))}
          </div>
        )}

        {deletedMyBills.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 18, marginBottom: 16, color: '#f87171' }}>🗑️ Deleted Jobs ({deletedMyBills.length})</h2>
            <div style={{ display: 'grid', gap: 16 }}>
              {deletedMyBills.map(bill => (
                <div key={bill.id} style={{ background: '#111', border: '1px solid #450a0a', borderRadius: 12, padding: 16, opacity: 0.8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, textDecoration: 'line-through', color: '#888' }}>{bill.deviceModel}</h3>
                      <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>Job ID: {bill.id}</div>
                    </div>
                    <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>Deleted by Admin</span>
                  </div>
                  <div style={{ fontSize: 14, color: '#666' }}>
                    🔧 {bill.serviceType}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianPortal;
