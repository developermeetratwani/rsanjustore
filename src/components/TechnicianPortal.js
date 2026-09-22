import React, { useState, useEffect, useMemo } from 'react';

const API_BASE = process.env.NODE_ENV === 'production' ? 'https://rsanjustore-36en.onrender.com/api' : 'http://localhost:5000/api';

const fmt = n => `₹${(+n || 0).toFixed(2)}`;
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const IS = {
  width: '100%', padding: '12px 14px', borderRadius: 10,
  border: '1px solid #2a2a2a', background: '#111', color: '#fff',
  fontSize: 15, outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box',
  fontFamily: 'inherit'
};

const StatusBadge = ({ status }) => {
  const map = {
    'in-progress': { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', label: 'In Progress' },
    'completed':   { bg: 'rgba(16,185,129,0.15)',  color: '#10b981', label: 'Completed' },
    'refunded':    { bg: 'rgba(239,68,68,0.15)',    color: '#f87171', label: 'Refunded' },
    'deleted':     { bg: 'rgba(156,163,175,0.15)',  color: '#9ca3af', label: 'Deleted' },
  };
  const s = map[status] || map['in-progress'];
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>
      {s.label}
    </span>
  );
};

const StatCard = ({ icon, label, value, sub, color = '#fff', accent = '#1a1a1a' }) => (
  <div style={{ background: accent, border: '1px solid #222', borderRadius: 14, padding: '18px 20px', flex: 1, minWidth: 140 }}>
    <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
    <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1.1 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>{sub}</div>}
  </div>
);

const BillCard = ({ bill }) => (
  <div style={{
    background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 14, padding: 20,
    transition: 'border-color 0.2s', cursor: 'default'
  }}
    onMouseEnter={e => e.currentTarget.style.borderColor = '#333'}
    onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}
  >
    {/* Header */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{bill.deviceModel}</div>
        <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>#{bill.billId || bill.id}</div>
      </div>
      <StatusBadge status={bill.status} />
    </div>

    {/* Details grid */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: 14 }}>
      <Detail label="Customer" value={bill.customerName} />
      <Detail label="Phone" value={bill.customerPhone} />
      <Detail label="Service" value={bill.serviceType || '—'} />
      <Detail label="Date" value={fmtDate(bill.createdAt)} />
    </div>

    {/* Financial row */}
    <div style={{ background: '#111', border: '1px solid #222', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 0, justifyContent: 'space-between' }}>
      <FinStat label="Bill Charged" value={fmt(bill.finalCharge)} color="#e5e7eb" />
      <Divider />
      <FinStat label="My Commission" value={fmt(bill.commission)} color="#10b981" />
      <Divider />
      <FinStat label="Store Profit" value={fmt(bill.storeProfit)} color="#6b7280" />
    </div>

    {bill.status === 'refunded' && (
      <div style={{ marginTop: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#f87171' }}>
        ⚠️ This bill was refunded — commission may be reversed
      </div>
    )}
    {bill.status === 'deleted' && (
      <div style={{ marginTop: 10, background: 'rgba(156,163,175,0.08)', border: '1px solid rgba(156,163,175,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#9ca3af' }}>
        🗑️ This bill was deleted by the admin
      </div>
    )}
  </div>
);

const Detail = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 13, color: '#ccc', fontWeight: 500 }}>{value || '—'}</div>
  </div>
);

const FinStat = ({ label, value, color }) => (
  <div style={{ textAlign: 'center', flex: 1 }}>
    <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 }}>{label}</div>
    <div style={{ fontSize: 15, fontWeight: 700, color }}>{value}</div>
  </div>
);

const Divider = () => <div style={{ width: 1, background: '#222', margin: '0 4px' }} />;

const TABS = [
  { id: 'tally',       label: '📊 Tally' },
  { id: 'active',      label: '🔧 Active' },
  { id: 'completed',   label: '✅ Completed' },
  { id: 'refunded',    label: '💸 Refunded' },
  { id: 'deleted',     label: '🗑️ Deleted' },
];

const TechnicianPortal = () => {
  const [techList, setTechList]         = useState([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [pin, setPin]                   = useState('');
  const [token, setToken]               = useState(localStorage.getItem('rsanju_tech_token'));
  const [currentUser, setCurrentUser]   = useState(JSON.parse(localStorage.getItem('rsanju_tech_user')) || null);
  const [bills, setBills]               = useState([]);
  const [loading, setLoading]           = useState(false);
  const [activeTab, setActiveTab]       = useState('tally');

  // Fetch technician list for login dropdown
  useEffect(() => {
    fetch(`${API_BASE}/technicians/list`)
      .then(r => r.json())
      .then(data => setTechList(data))
      .catch(e => console.error(e));
  }, []);

  // Auto-fetch on login
  useEffect(() => {
    if (token && currentUser) fetchDashboardData();
  }, [token]); // eslint-disable-line

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
    } catch {
      alert('Network error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('rsanju_tech_token');
    localStorage.removeItem('rsanju_tech_user');
    setToken(null);
    setCurrentUser(null);
    setBills([]);
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
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const updateCustody = async (billId, status) => {
    const bill = bills.find(b => (b.billId || b.id) === billId || b.id === billId);
    if (!bill) return;
    const nowISO = new Date().toISOString();
    const updatedHistory = [...(bill.custodyHistory || []), {
      timestamp: nowISO,
      holder: status === 'Store Front Desk' ? 'Store Front Desk' : currentUser.name,
      updatedBy: currentUser.name,
      notes: status === 'Store Front Desk' ? 'Returned to store after repair' : 'Updated by technician'
    }];
    const updatedBill = { ...bill, custodyHistory: updatedHistory };
    setBills(bills.map(b => b.id === bill.id ? updatedBill : b));
    try {
      await fetch(`${API_BASE}/bills/${bill.billId || bill.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updatedBill)
      });
    } catch {
      alert('Network error');
    }
  };

  // ── Derived stats ──
  const stats = useMemo(() => {
    const completed = bills.filter(b => b.status === 'completed');
    const active    = bills.filter(b => b.status === 'in-progress');
    const refunded  = bills.filter(b => b.status === 'refunded');
    const deleted   = bills.filter(b => b.status === 'deleted');

    const totalCommission  = completed.reduce((s, b) => s + (+b.commission || 0), 0);
    const totalBillCharged = completed.reduce((s, b) => s + (+b.finalCharge || 0), 0);
    const refundedComm     = refunded.reduce((s, b) => s + (+b.commission || 0), 0);
    const netEarned        = totalCommission - refundedComm;

    return { completed, active, refunded, deleted, totalCommission, totalBillCharged, refundedComm, netEarned };
  }, [bills]);

  // ─── LOGIN SCREEN ───
  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 420, background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: 20, padding: '36px 30px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔧</div>
            <h1 style={{ margin: 0, color: '#fff', fontSize: 24, fontWeight: 800 }}>Technician Portal</h1>
            <p style={{ margin: '8px 0 0', color: '#555', fontSize: 14 }}>View your jobs, earnings & commission</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, color: '#666', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Your Name</label>
              <select style={IS} value={selectedTech} onChange={e => setSelectedTech(e.target.value)} required>
                <option value="">— Select Technician —</option>
                {techList.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, color: '#666', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>4-Digit PIN</label>
              <input style={IS} type="password" maxLength={4} pattern="\d{4}" value={pin} onChange={e => setPin(e.target.value)} required placeholder="••••" />
            </div>
            <button type="submit" style={{ marginTop: 8, padding: '14px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 16, cursor: 'pointer', transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.target.style.opacity = 0.85}
              onMouseLeave={e => e.target.style.opacity = 1}
            >
              Log In →
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD ───
  const tabBills = {
    tally:     [],
    active:    stats.active,
    completed: stats.completed,
    refunded:  stats.refunded,
    deleted:   stats.deleted,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Header */}
      <div style={{ background: '#0a0a0a', borderBottom: '1px solid #1a1a1a', padding: '0 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', height: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🔧</span>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{currentUser.name}</span>
            <span style={{ fontSize: 12, color: '#444', background: '#111', border: '1px solid #222', borderRadius: 6, padding: '2px 8px' }}>Technician</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={fetchDashboardData} style={{ background: '#111', border: '1px solid #222', color: '#aaa', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
              ↻ Refresh
            </button>
            <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #222', color: '#666', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 60px' }}>

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <StatCard icon="💰" label="Net Earned" value={fmt(stats.netEarned)} sub="Commission (after refunds)" color="#10b981" accent="#0a1a0f" />
          <StatCard icon="✅" label="Jobs Done" value={stats.completed.length} sub={`₹${stats.totalBillCharged.toFixed(0)} billed total`} color="#60a5fa" accent="#0a0f1a" />
          <StatCard icon="🔧" label="Active Jobs" value={stats.active.length} sub="Phones with you now" color="#fbbf24" accent="#1a1500" />
          <StatCard icon="💸" label="Refunded" value={stats.refunded.length} sub={`-${fmt(stats.refundedComm)} comm. lost`} color="#f87171" accent="#1a0a0a" />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#0d0d0d', padding: 4, borderRadius: 12, border: '1px solid #1a1a1a', overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: '9px 8px', background: activeTab === tab.id ? '#fff' : 'transparent',
              color: activeTab === tab.id ? '#000' : '#555', border: 'none', borderRadius: 8,
              fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
              minWidth: 'max-content'
            }}>
              {tab.label}
              {tab.id !== 'tally' && tabBills[tab.id].length > 0 && (
                <span style={{ marginLeft: 5, background: activeTab === tab.id ? '#000' : '#222', color: activeTab === tab.id ? '#fff' : '#aaa', borderRadius: 10, fontSize: 10, padding: '1px 5px' }}>
                  {tabBills[tab.id].length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#444' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <div>Loading your jobs...</div>
          </div>
        ) : (
          <>
            {/* ── TALLY TAB ── */}
            {activeTab === 'tally' && (
              <div>
                <h2 style={{ fontSize: 18, marginBottom: 20, color: '#fff' }}>📊 Your Earnings Tally</h2>

                {/* Tally Table */}
                <div style={{ background: '#0a0a0a', border: '1px solid #1e1e1e', borderRadius: 14, overflow: 'hidden', marginBottom: 24 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 0, background: '#111', padding: '10px 16px', borderBottom: '1px solid #1e1e1e' }}>
                    {['Device / Customer', 'Bill Charged', 'My Commission', 'Status'].map(h => (
                      <div key={h} style={{ fontSize: 10, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</div>
                    ))}
                  </div>

                  {bills.filter(b => b.status !== 'deleted').length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#444' }}>No bills yet</div>
                  ) : (
                    bills
                      .filter(b => b.status !== 'deleted')
                      .map((bill, i) => (
                        <div key={bill.id} style={{
                          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
                          gap: 0, padding: '12px 16px',
                          borderBottom: '1px solid #111',
                          background: i % 2 === 0 ? 'transparent' : '#080808'
                        }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb' }}>{bill.deviceModel}</div>
                            <div style={{ fontSize: 11, color: '#444', marginTop: 1 }}>{bill.customerName} • {fmtDate(bill.createdAt)}</div>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb', alignSelf: 'center' }}>{fmt(bill.finalCharge)}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: bill.status === 'refunded' ? '#f87171' : '#10b981', alignSelf: 'center' }}>
                            {bill.status === 'refunded' ? `-${fmt(bill.commission)}` : fmt(bill.commission)}
                          </div>
                          <div style={{ alignSelf: 'center' }}>
                            <StatusBadge status={bill.status} />
                          </div>
                        </div>
                      ))
                  )}

                  {/* Totals footer */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '14px 16px', background: '#111', borderTop: '2px solid #222' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>TOTAL ({bills.filter(b => b.status !== 'deleted').length} bills)</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa' }}>{fmt(bills.filter(b => b.status !== 'deleted').reduce((s, b) => s + (+b.finalCharge || 0), 0))}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#10b981' }}>{fmt(stats.netEarned)}</div>
                    <div style={{ fontSize: 11, color: '#555' }}>net after refunds</div>
                  </div>
                </div>

                {/* Breakdown cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ background: '#0a1a0f', border: '1px solid #14532d', borderRadius: 12, padding: 18 }}>
                    <div style={{ fontSize: 11, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>💚 Earned (Completed)</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>{fmt(stats.totalCommission)}</div>
                    <div style={{ fontSize: 12, color: '#166534', marginTop: 4 }}>From {stats.completed.length} completed jobs</div>
                  </div>
                  <div style={{ background: '#1a0a0a', border: '1px solid #7f1d1d', borderRadius: 12, padding: 18 }}>
                    <div style={{ fontSize: 11, color: '#dc2626', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>❌ Lost (Refunded)</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#f87171' }}>-{fmt(stats.refundedComm)}</div>
                    <div style={{ fontSize: 12, color: '#7f1d1d', marginTop: 4 }}>From {stats.refunded.length} refunded bill(s)</div>
                  </div>
                </div>
              </div>
            )}

            {/* ── ACTIVE TAB ── */}
            {activeTab === 'active' && (
              <div>
                <h2 style={{ fontSize: 18, marginBottom: 20, color: '#fff' }}>🔧 Active Jobs — Phones With You ({stats.active.length})</h2>
                {stats.active.length === 0 ? (
                  <EmptyState icon="🎉" msg="No active jobs — you're all clear!" />
                ) : (
                  <div style={{ display: 'grid', gap: 14 }}>
                    {stats.active.map(bill => (
                      <div key={bill.id}>
                        <BillCard bill={bill} />
                        <button
                          onClick={() => updateCustody(bill.billId || bill.id, 'Store Front Desk')}
                          style={{ marginTop: 8, width: '100%', padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                        >
                          ✅ Done — Return to Front Desk
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── COMPLETED TAB ── */}
            {activeTab === 'completed' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ fontSize: 18, margin: 0, color: '#fff' }}>✅ Completed Jobs ({stats.completed.length})</h2>
                  <span style={{ fontSize: 14, color: '#10b981', fontWeight: 700 }}>Total commission: {fmt(stats.totalCommission)}</span>
                </div>
                {stats.completed.length === 0 ? (
                  <EmptyState icon="📋" msg="No completed jobs yet" />
                ) : (
                  <div style={{ display: 'grid', gap: 14 }}>
                    {stats.completed.map(bill => <BillCard key={bill.id} bill={bill} />)}
                  </div>
                )}
              </div>
            )}

            {/* ── REFUNDED TAB ── */}
            {activeTab === 'refunded' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ fontSize: 18, margin: 0, color: '#fff' }}>💸 Refunded Bills ({stats.refunded.length})</h2>
                  <span style={{ fontSize: 14, color: '#f87171', fontWeight: 700 }}>Commission lost: -{fmt(stats.refundedComm)}</span>
                </div>
                {stats.refunded.length === 0 ? (
                  <EmptyState icon="👍" msg="No refunded bills!" />
                ) : (
                  <div style={{ display: 'grid', gap: 14 }}>
                    {stats.refunded.map(bill => <BillCard key={bill.id} bill={bill} />)}
                  </div>
                )}
              </div>
            )}

            {/* ── DELETED TAB ── */}
            {activeTab === 'deleted' && (
              <div>
                <h2 style={{ fontSize: 18, marginBottom: 20, color: '#fff' }}>🗑️ Deleted Bills ({stats.deleted.length})</h2>
                {stats.deleted.length === 0 ? (
                  <EmptyState icon="✨" msg="No deleted bills" />
                ) : (
                  <div style={{ display: 'grid', gap: 14 }}>
                    {stats.deleted.map(bill => <BillCard key={bill.id} bill={bill} />)}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ icon, msg }) => (
  <div style={{ padding: 60, textAlign: 'center', background: '#0a0a0a', border: '1px dashed #1e1e1e', borderRadius: 14, color: '#444' }}>
    <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
    <div style={{ fontSize: 15 }}>{msg}</div>
  </div>
);

export default TechnicianPortal;
