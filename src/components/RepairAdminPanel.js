import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RepairAdminPanel.css';

const API_BASE = process.env.NODE_ENV === 'production' ? 'https://rsanjustore-36en.onrender.com/api' : 'http://localhost:5000/api';

// ---------- helpers ----------
const LS = {
  get: (k, d = []) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};
const genId = () => 'RS-' + Date.now().toString().slice(-6);
const nowISO = () => new Date().toISOString();
const fmtDate = iso => new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
const fmtMoney = n => `₹${(+n || 0).toFixed(2)}`;

const printBill = (bill, repairers) => {
  const issuer = bill.billedBy || bill.recipientName || 'master';
  const dateStr = fmtDate(bill.createdAt).split(',')[0];

  const page = (copyLabel) => `
  <div class="page">
    <!-- TOP HEADER: Logo left, Store info right -->
    <div class="header">
      <div class="header-logo">
        <img src="/logo.png" alt="R Sanju Store" onerror="this.style.display='none'" />
      </div>
      <div class="header-info">
        <div class="store-tagline">MOBILE REPAIR &amp; ACCESSORIES</div>
        <div class="store-addr">206-207, B Block, Gita Mandir Rd, Dharmyug Colony,</div>
        <div class="store-addr">Gita Mandir, Ahmedabad, Gujarat 380022</div>
        <div class="store-phone">&#9742; 9274282930</div>
      </div>
    </div>

    <!-- INVOICE TITLE BAR -->
    <div class="title-bar">
      <span>TAX INVOICE / CHALLAN</span>
      <span class="copy-label">${copyLabel}</span>
    </div>

    <!-- BILL META: Customer left | Invoice details right -->
    <div class="meta-grid">
      <div class="meta-left">
        <div class="meta-label">BILL TO</div>
        <div class="meta-name">${bill.customerName}</div>
        <div class="meta-line"><span>Phone</span><span>${bill.customerPhone}</span></div>
        <div class="meta-line"><span>Device</span><span>${bill.deviceModel}${bill.phoneColor ? ' · ' + bill.phoneColor : ''}</span></div>
        ${bill.phonePassword ? `<div class="meta-line"><span>Password</span><span>${bill.phonePassword}</span></div>` : ''}
      </div>
      <div class="meta-right">
        <div class="meta-label">INVOICE DETAILS</div>
        <div class="meta-line"><span>Invoice No.</span><span class="bold">${bill.id}</span></div>
        <div class="meta-line"><span>Date</span><span>${dateStr}</span></div>
        <div class="meta-line"><span>Billed By</span><span>${issuer}</span></div>
      </div>
    </div>

    <!-- ITEMS TABLE -->
    <table class="items">
      <thead>
        <tr>
          <th class="c" style="width:7%">SR</th>
          <th class="l" style="width:55%">DESCRIPTION OF SERVICE</th>
          <th class="c" style="width:8%">QTY</th>
          <th class="r" style="width:15%">RATE</th>
          <th class="r" style="width:15%">AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="c">1</td>
          <td class="l"><span class="service-label">Repair Service</span><br/><span class="service-desc">${bill.serviceType}</span></td>
          <td class="c">1</td>
          <td class="r">—</td>
          <td class="r bold">Rs. ${fmtMoney(bill.finalCharge).replace('₹','')}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="3" class="l" style="border-right: none;"></td>
          <td class="r bold grand-label" style="border-left:1px solid #111">GRAND TOTAL</td>
          <td class="r bold grand-amt">Rs. ${fmtMoney(bill.finalCharge).replace('₹','')}</td>
        </tr>
      </tfoot>
    </table>

    <!-- ITEMS TABLE ends here without footer -->
  </div>`;

  const tcPage = `
  <div class="page tc-page">
    <div class="tc-header">TERMS &amp; CONDITIONS</div>
    <div class="tc-content">
      <ol>
        <li>It is mandatory to bring the Job Sheet when collecting the repaired mobile phone. The mobile phone will not be handed over without the Job Sheet.</li>
        <li>If the Job Sheet is not available, the customer must provide proper identification/proof of ownership before the mobile is handed over.</li>
        <li>The customer will be responsible for any damage or loss caused to the mobile phone due to pre-existing conditions or issues during the repair process.</li>
        <li>Customers must check their mobile phone and accessories at the time of receiving the device. The store will not be responsible for any missing accessories afterward.</li>
        <li>The store will not be responsible for any data loss that occurs during the repair process.</li>
        <li>The store will not be responsible for the password, PIN, pattern, or other lock information of the mobile phone.</li>
        <li>An estimated repair time will be provided, but the actual completion time may vary depending on the repair/service required.</li>
        <li>After repair, if the mobile phone does not function properly or returns to its previous condition, the customer will be responsible for the device.</li>
        <li>Parts replaced during repair will not be returned.</li>
        <li>Once a repair is cancelled or completed, the replaced parts cannot be requested back.</li>
        <li>If the mobile phone gets damaged, switches off, or develops any issue while the repair is being carried out, the responsibility will remain with the customer as per the repair condition.</li>
        <li>If one part is faulty and another part gets damaged during the repair process, the customer will be responsible for the affected part.</li>
        <li>If the display, IC, or any other component gets damaged or develops a fault during/after the repair, the customer will be responsible for the complete repair/replacement cost.</li>
      </ol>
      <div class="tc-ack">
        <div class="tc-ack-title">Customer Acknowledgement</div>
        <div class="tc-ack-text">By submitting the device for repair, the customer agrees to the above Terms &amp; Conditions.</div>
      </div>
    </div>
  </div>`;

  const html = `<!DOCTYPE html><html><head>
    <meta charset="utf-8"/>
    <title>Invoice ${bill.id}</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
    <style>
      @page { size: A5 portrait; margin: 8mm; }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Poppins', 'Segoe UI', Helvetica, Arial, sans-serif;
        background: #fff; color: #111;
        -webkit-print-color-adjust: exact; print-color-adjust: exact;
        font-size: 9.5pt;
      }

      /* Page wrapper */
      .page {
        width: 100%; min-height: 180mm;
        border: 1.5px solid #111;
        display: flex; flex-direction: column;
      }

      /* ---- HEADER ---- */
      .header {
        display: flex; align-items: center;
        padding: 10px 12px; gap: 12px;
        border-bottom: 1.5px solid #111;
      }
      .header-logo img { max-height: 60px; max-width: 110px; display: block; }
      .header-info { flex: 1; text-align: right; }
      .store-tagline {
        font-size: 8.5pt; font-weight: 700;
        letter-spacing: 1.5px; text-transform: uppercase;
        border-bottom: 1px solid #555; padding-bottom: 3px; margin-bottom: 4px;
      }
      .store-addr { font-size: 7.5pt; color: #333; line-height: 1.5; }
      .store-phone { font-size: 9pt; font-weight: 700; margin-top: 3px; }

      /* ---- TITLE BAR ---- */
      .title-bar {
        background: #111; color: #fff;
        display: flex; justify-content: space-between; align-items: center;
        padding: 5px 12px;
        font-size: 9pt; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
      }
      .copy-label {
        font-size: 7.5pt; font-weight: 500; letter-spacing: 0.5px;
        background: rgba(255,255,255,0.15); padding: 2px 8px; border-radius: 2px;
      }

      /* ---- META GRID ---- */
      .meta-grid {
        display: flex; border-bottom: 1px solid #111;
      }
      .meta-left { flex: 6; padding: 10px 12px; border-right: 1px solid #111; }
      .meta-right { flex: 4; padding: 10px 12px; }
      .meta-label {
        font-size: 7pt; font-weight: 700; letter-spacing: 1px;
        text-transform: uppercase; color: #555;
        border-bottom: 1px solid #ddd; padding-bottom: 3px; margin-bottom: 5px;
      }
      .meta-name { font-size: 11pt; font-weight: 700; margin-bottom: 4px; }
      .meta-line {
        display: flex; justify-content: space-between;
        font-size: 8.5pt; padding: 1.5px 0; color: #222;
      }
      .meta-line span:first-child { color: #666; min-width: 60px; }

      /* ---- ITEMS TABLE ---- */
      .items {
        width: 100%; border-collapse: collapse;
        font-size: 8.5pt; flex: 1;
      }
      .items thead tr { background: #f2f2f2; }
      .items th {
        padding: 6px 8px; font-weight: 700;
        border-bottom: 1.5px solid #111; border-right: 1px solid #bbb;
        text-transform: uppercase; font-size: 7.5pt; letter-spacing: 0.5px;
      }
      .items th:last-child { border-right: none; }
      .items td {
        padding: 8px; border-right: 1px solid #bbb;
        vertical-align: middle;
      }
      .items td:last-child { border-right: none; }
      .items tbody tr { border-bottom: 1px solid #e0e0e0; }
      .service-label { font-weight: 600; font-size: 9pt; }
      .service-desc { font-size: 8pt; color: #555; margin-top: 2px; }
      .items tfoot .total-row td {
        border-top: 1.5px solid #111; padding: 7px 8px;
        background: #f9f9f9;
      }
      .grand-label { font-size: 8.5pt; letter-spacing: 0.5px; }
      .grand-amt { font-size: 11pt; letter-spacing: 0.3px; }


      /* ---- UTILITIES ---- */
      .bold { font-weight: 700; }
      .c { text-align: center; }
      .l { text-align: left; }
      .r { text-align: right; }

      /* ---- PAGE BREAK ---- */
      .page-break { page-break-after: always; height: 8mm; }

      /* ---- T&C PAGE ---- */
      .tc-page { padding: 15px 20px; justify-content: flex-start; }
      .tc-header { font-size: 10pt; font-weight: 700; text-align: center; margin-bottom: 10px; text-transform: uppercase; border-bottom: 1.5px solid #111; padding-bottom: 5px; }
      .tc-content { font-size: 8pt; line-height: 1.35; }
      .tc-content ol { padding-left: 18px; margin-bottom: 15px; }
      .tc-content li { margin-bottom: 4px; text-align: justify; }
      .tc-ack { margin-top: 15px; padding-top: 10px; border-top: 1px dashed #777; }
      .tc-ack-title { font-size: 9pt; font-weight: 700; margin-bottom: 4px; }
      .tc-ack-text { font-size: 8pt; font-style: italic; margin-bottom: 10px; }
    </style>
  </head><body>
    ${page('Customer Copy')}
    <div class="page-break"></div>
    ${tcPage}
    <div class="page-break"></div>
    ${page('Store Copy')}
  </body></html>`;

  const w = window.open('', '_blank', 'width=700,height=950');
  w.document.write(html);
  w.document.close();
  setTimeout(() => { w.print(); }, 600);
};

// ===================== MAIN COMPONENT =====================
const RepairAdminPanel = ({ onLogout }) => {
  const [currentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rsanju_auth_user')) || { username: 'master', role: 'master' };
    } catch {
      return { username: 'master', role: 'master' };
    }
  });

  const [activeTab, setActiveTab] = useState('bills');
  const [bills, setBillsState] = useState(() => LS.get('rsanju_bills', []));
  const [repairers, setRepairers] = useState(() => LS.get('rsanju_repairers', []));
  const [appointments, setAppointments] = useState(() => LS.get('rsanju_appointments', []));
  const [earningsFilter, setEarningsFilter] = useState('today');
  const [customRange, setCustomRange] = useState({ startDate: '', endDate: '' });
  const [searchPhone, setSearchPhone] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [showAllBills, setShowAllBills] = useState(false);

  // Staff and MongoDB connection state
  const [staffUsers, setStaffUsers] = useState([]);
  const [mongoConnected, setMongoConnected] = useState(null); // null = checking
  const [syncBanner, setSyncBanner] = useState(null); // { type: 'error'|'warning'|'success', msg }
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({ username: '', password: '', role: 'sub_admin' });

  // Repairer form
  const [showRepairerForm, setShowRepairerForm] = useState(false);
  const [editingRepairer, setEditingRepairer] = useState(null);
  const [repairerForm, setRepairerForm] = useState({ name: '', type: 'commission', commission: 0, pin: '0000' });
  const [selectedTechFolder, setSelectedTechFolder] = useState(null);

  // Bill form / modal
  const [showBillForm, setShowBillForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [phoneError, setPhoneError] = useState('');

  const emptyBill = {
    customerName: '', recipientName: currentUser.username, billedBy: currentUser.username, billedByRole: currentUser.role, customerPhone: '',
    deviceModel: '', phoneColor: '', phonePassword: '',
    serviceType: '', repairerName: '',
    finalCharge: '', notes: '', expenses: [], custodyHistory: []
  };
  const [billForm, setBillForm] = useState(emptyBill);
  const [newExpense, setNewExpense] = useState({ name: '', cost: '' });

  // In-progress bill editor modal
  const [editingBill, setEditingBill] = useState(null);
  const [editExpense, setEditExpense] = useState({ name: '', cost: '' });
  const [editPhoneError, setEditPhoneError] = useState('');

  // Bill view modal
  const [viewBill, setViewBill] = useState(null);
  const [mobileActionBill, setMobileActionBill] = useState(null);

  // Tracking page state
  const [trackingSearch, setTrackingSearch] = useState('');
  const [trackingBill, setTrackingBill] = useState(null);
  const [newCustodyHolder, setNewCustodyHolder] = useState('');

  const searchTrackingBill = () => {
    if (trackingSearch.length < 3) return;
    const match = bills.find(b => 
      (b.id && b.id.toLowerCase() === trackingSearch.toLowerCase()) || 
      (b.customerPhone && b.customerPhone.includes(trackingSearch))
    );
    setTrackingBill(match || 'NOT_FOUND');
    setNewCustodyHolder('');
  };

  // Keep tracking bill synced with live MongoDB updates from polling
  useEffect(() => {
    if (trackingBill && trackingBill !== 'NOT_FOUND') {
      const updated = bills.find(b => b.id === trackingBill.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(trackingBill)) {
        setTrackingBill(updated);
      }
    }
  }, [bills, trackingBill]);

  const handleCustodyTransfer = async () => {
    if (!trackingBill || trackingBill === 'NOT_FOUND' || !newCustodyHolder) return;
    const nowISO = () => new Date().toISOString();
    const updatedHistory = [...(trackingBill.custodyHistory || []), {
      timestamp: nowISO(),
      holder: newCustodyHolder,
      updatedBy: currentUser.username,
      notes: 'Admin overridden'
    }];
    const updatedBill = { ...trackingBill, custodyHistory: updatedHistory, pendingCustody: null };
    
    saveBills(bills.map(b => b.id === trackingBill.id ? updatedBill : b));
    setTrackingBill(updatedBill);
    
    try {
      await fetch(`${API_BASE}/bills/${trackingBill.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBill)
      });
    } catch (e) {
      alert('Network error while transferring custody');
    }
  };

  // Persist helpers
  const saveBills = arr => { setBillsState(arr); LS.set('rsanju_bills', arr); };
  const saveRepairers = arr => { setRepairers(arr); LS.set('rsanju_repairers', arr); };
  const saveAppointments = arr => { setAppointments(arr); LS.set('rsanju_appointments', arr); };

  // Pending sync queue helpers — bills saved locally but not yet confirmed to MongoDB
  const getPendingQueue = () => LS.get('rsanju_pending_sync', []);
  const addToPendingQueue = (bill) => {
    const q = getPendingQueue();
    if (!q.find(b => b.id === bill.id)) LS.set('rsanju_pending_sync', [...q, bill]);
  };
  const removeFromPendingQueue = (billId) => {
    LS.set('rsanju_pending_sync', getPendingQueue().filter(b => b.id !== billId));
  };

  // ---------- Full sync from MongoDB (reusable) ----------
  const syncFromMongoDB = async ({ silent = false } = {}) => {
    if (!silent) setIsSyncing(true);

    // Skip health check gate — directly try to fetch bills.
    // Render free tier can take 30-60s to wake up, so a 5s health
    // check would always fail and block everything. We let the bills
    // fetch itself tell us whether the server is reachable.
    try {
      // Give Render up to 60 seconds to wake up on first request
      const res = await fetch(`${API_BASE}/bills`, { signal: AbortSignal.timeout(60000) });
      if (res.ok) {
        setMongoConnected(true);
        const cloudBills = await res.json();
        // Merge: cloud is source of truth, but preserve any pending local bills not yet in cloud
        const pending = getPendingQueue();
        const cloudIds = new Set(cloudBills.map(b => b.billId || b.id));
        const pendingNotInCloud = pending.filter(b => !cloudIds.has(b.id));
        const merged = [
          ...cloudBills.map(b => ({ ...b, id: b.billId || b.id || b._id })),
          ...pendingNotInCloud
        ];
        setBillsState(merged);
        LS.set('rsanju_bills', merged);

        // Retry any pending bills that weren't in the cloud
        if (pendingNotInCloud.length > 0) {
          setSyncBanner({ type: 'warning', msg: `⏳ Retrying sync for ${pendingNotInCloud.length} offline bill(s)...` });
          for (const pendingBill of pendingNotInCloud) {
            try {
              const r = await fetch(`${API_BASE}/bills`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pendingBill),
                signal: AbortSignal.timeout(30000)
              });
              if (r.ok || r.status === 200) removeFromPendingQueue(pendingBill.id);
            } catch (_) { /* will retry next time */ }
          }
          const stillPending = getPendingQueue();
          if (stillPending.length === 0) {
            setSyncBanner({ type: 'success', msg: '✅ All offline bills synced to MongoDB!' });
            setTimeout(() => setSyncBanner(null), 4000);
          } else {
            setSyncBanner({ type: 'warning', msg: `⚠️ ${stillPending.length} bill(s) still pending sync. Will retry on next refresh.` });
          }
        } else {
          if (!silent) { setSyncBanner({ type: 'success', msg: '✅ Synced with MongoDB.' }); setTimeout(() => setSyncBanner(null), 3000); }
        }
      } else {
        setMongoConnected(false);
        setSyncBanner({ type: 'error', msg: '❌ Failed to fetch bills from MongoDB. Showing local data.' });
      }
    } catch (err) {
      setMongoConnected(false);
      console.warn('MongoDB bills fetch warning:', err);
      if (!silent) setSyncBanner({ type: 'error', msg: '❌ Network error fetching bills. Showing local data.' });
    }

    if (!silent) setIsSyncing(false);
  };

  // ---------- Sync with MongoDB on Mount ----------
  useEffect(() => {
    // 1. Fetch Staff Users (for Master Admin and recipient dropdown)
    const fetchStaff = async () => {
      try {
        const token = currentUser.token || 'master-token';
        const res = await fetch(`${API_BASE}/auth/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStaffUsers(data);
        }
      } catch (err) {
        console.warn('MongoDB staff fetch warning:', err);
      }
    };

    const fetchTechnicians = async () => {
      try {
        const res = await fetch(`${API_BASE}/technicians`, {
          headers: { Authorization: `Bearer ${currentUser.token || ''}` }
        });
        if (res.ok) {
          const techs = await res.json();
          const mapped = techs.map(t => ({
            id: t._id,
            name: t.name,
            type: t.compensationType === 'percentage' ? 'commission' : 'salaried',
            commission: t.compensationValue,
            pin: t.pin || '0000'
          }));
          saveRepairers(mapped);
        }
      } catch (e) {
        console.warn('MongoDB technicians fetch warning:', e);
      }
    };

    fetchStaff();
    syncFromMongoDB({ silent: true });
    fetchTechnicians();

    // Auto-sync every 10 seconds
    const syncInterval = setInterval(() => {
      syncFromMongoDB({ silent: true });
      fetchTechnicians();
    }, 10000);

    return () => clearInterval(syncInterval);
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- Staff Management Actions (Master Admin) ----------
  const convertUserRole = async (userId, targetRole) => {
    try {
      const res = await fetch(`${API_BASE}/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token || ''}`
        },
        body: JSON.stringify({ role: targetRole })
      });
      if (res.ok) {
        setStaffUsers(prev => prev.map(u => u._id === userId ? { ...u, role: targetRole } : u));
        alert(`Role successfully converted to ${targetRole === 'sub_admin' ? 'Sub-Admin' : 'Accountant'}!`);
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to update role');
      }
    } catch (e) {
      alert('Error updating role: ' + e.message);
    }
  };

  const handleAddStaff = async () => {
    if (!newStaffForm.username.trim() || !newStaffForm.password.trim()) {
      return alert('Please enter both username and password.');
    }
    try {
      const res = await fetch(`${API_BASE}/auth/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token || ''}`
        },
        body: JSON.stringify(newStaffForm)
      });
      const data = await res.json();
      if (res.ok) {
        alert(`${newStaffForm.role === 'sub_admin' ? 'Sub-Admin' : 'Accountant'} created successfully!`);
        setShowAddStaffModal(false);
        setNewStaffForm({ username: '', password: '', role: 'sub_admin' });
        const refreshed = await fetch(`${API_BASE}/auth/users`, {
          headers: { Authorization: `Bearer ${currentUser.token || ''}` }
        });
        if (refreshed.ok) setStaffUsers(await refreshed.json());
      } else {
        alert(data.message || 'Failed to create staff');
      }
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleDeleteStaff = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete staff account "${username}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/auth/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${currentUser.token || ''}` }
      });
      if (res.ok) {
        setStaffUsers(prev => prev.filter(u => u._id !== userId));
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to delete user');
      }
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  // ---------- Technicians (Repairers) ----------
  const startEditRepairer = (r) => {
    setEditingRepairer(r.id);
    setRepairerForm({ name: r.name, type: r.type, commission: r.commission || r.salary || 0, pin: r.pin || '0000' });
    setShowRepairerForm(true);
  };

  const saveRepairer = async () => {
    if (!repairerForm.name.trim()) return alert('Name required');
    
    const body = {
      name: repairerForm.name,
      compensationType: repairerForm.type === 'commission' ? 'percentage' : 'salary',
      compensationValue: repairerForm.type === 'salaried' ? 0 : +repairerForm.commission,
      pin: repairerForm.pin || '0000'
    };

    try {
      if (editingRepairer) {
        const res = await fetch(`${API_BASE}/technicians/${editingRepairer}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token || ''}` },
          body: JSON.stringify(body)
        });
        if (res.ok) {
          saveRepairers(repairers.map(r => r.id === editingRepairer ? { ...r, ...repairerForm, id: r.id, commission: body.compensationValue, pin: body.pin } : r));
        } else {
          const errData = await res.json().catch(() => ({}));
          alert(`Failed to update technician: ${errData.error || errData.message || 'Unknown error'}`);
        }
      } else {
        const res = await fetch(`${API_BASE}/technicians`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token || ''}` },
          body: JSON.stringify(body)
        });
        if (res.ok) {
          const t = await res.json();
          saveRepairers([...repairers, { ...repairerForm, id: t._id, commission: body.compensationValue, pin: body.pin }]);
        } else alert('Failed to add technician');
      }
    } catch (e) {
      console.error('Error syncing technician:', e);
      alert('Network error syncing technician');
    }

    setShowRepairerForm(false); 
    setEditingRepairer(null);
    setRepairerForm({ name: '', type: 'commission', commission: 0, pin: '0000' });
  };
  
  const deleteRepairer = async (id) => { 
    if (window.confirm('Delete this technician?')) {
      try {
        const res = await fetch(`${API_BASE}/technicians/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${currentUser.token || ''}` }
        });
        if (res.ok) {
          saveRepairers(repairers.filter(r => r.id !== id));
        } else alert('Failed to delete technician');
      } catch(e) {
        alert('Network error deleting technician');
      }
    } 
  };

  // ---------- Bill form ----------
  const openBillForm = (apt = null) => {
    setPhoneError('');
    setBillForm({
      ...emptyBill,
      customerName: apt?.customerName || '',
      customerPhone: (apt?.customerPhone || '').replace(/\D/g, '').slice(0, 10),
      deviceModel: apt?.deviceModel || '',
      serviceType: apt?.service || '',
      repairerName: apt?.assignedRepairer || '',
      recipientName: currentUser.username,
      billedBy: currentUser.username,
      billedByRole: currentUser.role,
      notes: apt?.issueDescription || '',
    });
    setSelectedAppointment(apt);
    setShowBillForm(true);
  };

  const addExpense = () => {
    if (!newExpense.name || !newExpense.cost) return;
    setBillForm(f => ({ ...f, expenses: [...f.expenses, { name: newExpense.name, cost: parseFloat(newExpense.cost) }] }));
    setNewExpense({ name: '', cost: '' });
  };
  const removeExpense = i => setBillForm(f => ({ ...f, expenses: f.expenses.filter((_, idx) => idx !== i) }));

  const getRepairerForBill = (repairerName) => repairers.find(r => r.name === repairerName);
  const calcCommission = (finalCharge, expenseTotal, repairerName) => {
    const r = getRepairerForBill(repairerName);
    if (!r || r.type !== 'commission') return 0;
    const profit = finalCharge - expenseTotal;
    return +(profit * (r.commission || 0) / 100).toFixed(2);
  };

  const saveBillDraft = async () => {
    if (!billForm.customerName || !billForm.customerPhone || !billForm.deviceModel || !billForm.repairerName) {
      return alert('Please fill: Customer Name, Phone, Device, and Technician');
    }

    const cleanPhone = (billForm.customerPhone || '').replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setPhoneError('Incorrect. Please enter 10 digits');
      return alert('Incorrect phone number. Exactly 10 digits are required.');
    }

    const billId = genId();
    const bill = {
      id: billId,
      billId: billId,
      ...billForm,
      customerPhone: cleanPhone,
      recipientName: billForm.recipientName || currentUser.username,
      billedBy: billForm.billedBy || billForm.recipientName || currentUser.username,
      billedByRole: billForm.billedByRole || currentUser.role,
      finalCharge: parseFloat(billForm.finalCharge) || 0,
      status: 'in-progress',
      createdAt: nowISO(),
      appointmentId: selectedAppointment?.id || null,
      custodyHistory: billForm.repairerName ? [
        { timestamp: nowISO(), holder: 'Store Front Desk', updatedBy: currentUser.username, notes: 'Device received from customer' },
        { timestamp: new Date(Date.now() + 1000).toISOString(), holder: billForm.repairerName, updatedBy: currentUser.username, notes: 'Auto-assigned to technician' }
      ] : [{
        timestamp: nowISO(),
        holder: 'Store Front Desk',
        updatedBy: currentUser.username,
        notes: 'Device received from customer'
      }]
    };

    saveBills([bill, ...bills]);
    if (selectedAppointment) {
      saveAppointments(appointments.map(a => a.id === selectedAppointment.id ? { ...a, status: 'in-progress' } : a));
    }
    setShowBillForm(false);

    // Sync to MongoDB Atlas — 60s timeout so Render has time to wake up from sleep
    try {
      const r = await fetch(`${API_BASE}/bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bill),
        signal: AbortSignal.timeout(60000)
      });
      if (r.ok || r.status === 200) {
        // Confirmed saved to MongoDB
        removeFromPendingQueue(bill.id);
        setSyncBanner({ type: 'success', msg: '✅ Bill saved to MongoDB.' });
        setTimeout(() => setSyncBanner(null), 3000);
      } else {
        const errData = await r.json().catch(() => ({}));
        // Add to pending queue so next sync retries it
        addToPendingQueue(bill);
        setSyncBanner({ type: 'warning', msg: `⚠️ Bill saved locally only. MongoDB error: ${errData.message || r.status}. Will retry on next refresh.` });
      }
    } catch (e) {
      // Network error — add to pending queue
      addToPendingQueue(bill);
      setSyncBanner({ type: 'error', msg: '🔴 No connection to backend. Bill saved locally and will sync when server is available.' });
    }
  };

  // In-progress bill editing
  const openEditBill = (bill) => {
    setEditPhoneError('');
    setEditingBill({ ...bill });
    setEditExpense({ name: '', cost: '' });
  };
  const addExpenseToEditBill = () => {
    if (!editExpense.name || !editExpense.cost) return;
    setEditingBill(b => ({ ...b, expenses: [...(b.expenses || []), { name: editExpense.name, cost: parseFloat(editExpense.cost) }] }));
    setEditExpense({ name: '', cost: '' });
  };
  const removeExpenseFromEditBill = i => setEditingBill(b => ({ ...b, expenses: b.expenses.filter((_, idx) => idx !== i) }));

  const saveEditBill = async () => {
    if (editingBill.customerPhone) {
      const clean = editingBill.customerPhone.replace(/\D/g, '');
      if (clean.length !== 10) {
        setEditPhoneError('Incorrect. Please enter 10 digits');
        return alert('Incorrect phone number. Exactly 10 digits required.');
      }
      editingBill.customerPhone = clean;
    }
    saveBills(bills.map(b => b.id === editingBill.id ? editingBill : b));
    const target = editingBill;
    setEditingBill(null);

    // Sync to MongoDB
    try {
      await fetch(`${API_BASE}/bills/${target.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target)
      });
    } catch (e) {
      console.warn('MongoDB bill update sync error:', e);
    }
  };

  const completeBill = async (billId) => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;
    if (!bill.finalCharge || +bill.finalCharge <= 0) return alert('Please set the final charge first before completing.');
    const finalCharge = +bill.finalCharge;
    const expenseTotal = (bill.expenses || []).reduce((s, e) => s + +e.cost, 0);
    const commission = calcCommission(finalCharge, expenseTotal, bill.repairerName);
    const updatedBill = {
      ...bill, status: 'completed', completedAt: nowISO(),
      commission, storeProfit: +(finalCharge - expenseTotal - commission).toFixed(2), expenseTotal
    };
    saveBills(bills.map(b => b.id === billId ? updatedBill : b));
    if (bill.appointmentId) {
      saveAppointments(appointments.map(a => a.id === bill.appointmentId ? { ...a, status: 'completed', billId } : a));
    }

    // Sync to MongoDB
    try {
      await fetch(`${API_BASE}/bills/${billId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBill)
      });
    } catch (e) {
      console.warn('MongoDB complete bill sync error:', e);
    }
  };

  const deleteBill = async (billId) => {
    if (currentUser.role !== 'master') return alert('Only Master Admin can delete bills.');
    if (!window.confirm('Are you sure you want to permanently delete this bill? This action cannot be undone.')) return;
    try {
      const res = await fetch(`${API_BASE}/bills/${billId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'deleted' })
      });
      if (res.ok) {
        saveBills(bills.map(b => b.id === billId ? { ...b, status: 'deleted' } : b));
        if (viewBill?.id === billId) setViewBill(null);
        alert('Bill deleted successfully');
      } else {
        alert('Failed to delete bill on server');
      }
    } catch (e) {
      alert('Network error while deleting bill');
    }
  };

  const refundBill = async (billId) => {
    if (!window.confirm('Are you sure you want to refund this bill? It will reverse revenue and commissions.')) return;
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;
    
    try {
      const res = await fetch(`${API_BASE}/bills/${billId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'refunded' })
      });
      if (res.ok) {
        saveBills(bills.map(b => b.id === billId ? { ...b, status: 'refunded' } : b));
        if (viewBill?.id === billId) setViewBill({ ...bill, status: 'refunded' });
        alert('Bill refunded successfully');
      } else {
        alert('Failed to process refund on server');
      }
    } catch(e) {
      alert('Network error while processing refund');
    }
  };


  const sendWhatsApp = (bill) => {
    if (!bill.customerPhone) return;
    const msg = encodeURIComponent(`Hello ${bill.customerName}! Thank you for choosing R Sanju Store. We hope you're happy with the service 😊 Please leave us a Google Review 🙏: https://share.google/9eVOobcsrXlsmEt3p`);
    const phone = bill.customerPhone.replace(/\D/g, '').slice(-10);
    // wa.me is the official universal link for WhatsApp, fixing iOS issues
    window.open(`https://wa.me/91${phone}?text=${msg}`, '_blank');
  };

  const assignRepairerToApt = (aptId, repairerName) => {
    saveAppointments(appointments.map(a => a.id === aptId ? { ...a, assignedRepairer: repairerName, status: 'in-progress' } : a));
  };

  // ---------- Earnings ----------
  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (earningsFilter === 'today') return { start: today, end: new Date(today.getTime() + 86400000) };
    if (earningsFilter === 'week') { const ws = new Date(today); ws.setDate(today.getDate() - today.getDay()); return { start: ws, end: now }; }
    if (earningsFilter === 'month') return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
    if (earningsFilter === 'custom' && customRange.startDate && customRange.endDate) {
      return { start: new Date(customRange.startDate), end: new Date(new Date(customRange.endDate).getTime() + 86400000) };
    }
    return { start: today, end: now };
  };

  const filterBillsByDate = (billList) => {
    const { start, end } = getDateRange();
    return billList.filter(b => {
      const d = new Date(b.completedAt || b.createdAt);
      return d >= start && d <= end;
    });
  };

  const completedBills = useMemo(() => bills.filter(b => b.status === 'completed'), [bills]);
  const filteredCompletedBills = filterBillsByDate(completedBills);

  // ---------- Metrics ----------
  const getLocalDateStr = (d) => {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date)) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const today = getLocalDateStr(new Date());

  const pendingCount = useMemo(() => appointments.filter(a => a.status === 'pending').length, [appointments]);
  const inProgressCount = useMemo(() => bills.filter(b => b.status === 'in-progress').length, [bills]);
  const completedCount = completedBills.length;
  const todayRevenue = useMemo(() => completedBills
    .filter(b => getLocalDateStr(b.completedAt || b.createdAt) === today)
    .reduce((s, b) => s + (+b.finalCharge || 0), 0), [completedBills, today]);

  // ---------- CSV Export ----------
  const downloadCSV = () => {
    const headers = ['Bill ID', 'Customer Name', 'Phone', 'Device', 'Color', 'Password', 'Service', 'Technician', 'Billed By', 'Final Charge', 'Expenses', 'Commission', 'Profit', 'Status', 'Date'];
    const rows = bills.map(b => [
      b.id, `"${b.customerName}"`, b.customerPhone, `"${b.deviceModel}"`,
      `"${b.phoneColor || ''}"`, `"${b.phonePassword || ''}"`, `"${b.serviceType}"`,
      `"${b.repairerName}"`, `"${b.billedBy || b.recipientName || ''}"`,
      b.finalCharge, (b.expenses || []).reduce((s, e) => s + +e.cost, 0),
      b.commission || 0, b.storeProfit || 0, b.status, fmtDate(b.createdAt)
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `bills-${today}.csv`; a.click();
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('rsanju_repair_admin_auth');
      localStorage.removeItem('rsanju_auth_user');
      window.location.reload();
    }
  };

  // ---------- Search Filter ----------
  const searchResults = useMemo(() => searchTriggered
    ? bills.filter(b => {
        const q = searchPhone.trim().toLowerCase();
        const bDate = (b.createdAt || '').slice(0, 10);
        const matchText = !q || (
          (b.customerPhone && b.customerPhone.includes(q)) ||
          (b.customerName && b.customerName.toLowerCase().includes(q)) ||
          (b.id && b.id.toLowerCase().includes(q)) ||
          (b.deviceModel && b.deviceModel.toLowerCase().includes(q))
        );
        const matchDate = !searchDate || bDate === searchDate;
        if (q && searchDate) return matchText && matchDate;
        if (q) return matchText;
        if (searchDate) return matchDate;
        return false;
      })
    : [], [searchTriggered, bills, searchPhone, searchDate]);

  const tabsList = [
    { id: 'bills', label: 'Bills' },
    ...(currentUser.role === 'master' ? [
      { id: 'repairers', label: 'Technicians' },
      { id: 'staff', label: 'Staff' },
      { id: 'earnings', label: 'Earnings' }
    ] : []),
    { id: 'refunds', label: 'Refunds' },
    { id: 'tracking', label: 'Tracking' },
    { id: 'search', label: 'Search' }
  ];

  // ===================== RENDER =====================
  return (
    <div className="repair-admin-panel">
      <header className="repair-admin-header">
        <div className="repair-header-content">
          <div className="repair-logo">
            <span className="repair-icon">⚙️</span>
            <h1>Repair Admin</h1>
          </div>

          {/* Center: DB status + sync */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 11, padding: '3px 9px', borderRadius: 20,
              background: mongoConnected === null ? '#eff6ff' : mongoConnected ? '#f0fdf4' : '#fef9c3',
              color: mongoConnected === null ? '#2563eb' : mongoConnected ? '#15803d' : '#854d0e',
              fontWeight: 600, border: `1px solid ${mongoConnected === null ? '#bfdbfe' : mongoConnected ? '#bbf7d0' : '#fde68a'}`
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: mongoConnected === null ? '#3b82f6' : mongoConnected ? '#22c55e' : '#eab308', flexShrink: 0 }}></span>
              {mongoConnected === null ? 'Connecting' : mongoConnected ? 'Synced' : 'Offline'}
            </span>
            <button
              onClick={() => syncFromMongoDB({ silent: false })}
              disabled={isSyncing}
              title="Sync from MongoDB"
              style={{
                background: 'none', border: '1px solid #e0e0e0', color: '#636366',
                borderRadius: 7, padding: '3px 10px', fontSize: 12,
                cursor: isSyncing ? 'not-allowed' : 'pointer', fontWeight: 500,
                display: 'inline-flex', alignItems: 'center', gap: 4, transition: 'all 0.15s'
              }}
            >
              {isSyncing ? 'Syncing…' : '↻ Sync'}
            </button>
            <span style={{ fontSize: 11, color: '#8e8e93', display: 'none' }} className="user-label">
              {currentUser.username}
            </span>
          </div>

          <div className="repair-actions">
            <button className="btn-download-csv" onClick={downloadCSV}>Export CSV</button>
            <button className="btn-logout" onClick={handleLogout}>Sign out</button>
          </div>
        </div>
      </header>

      {/* Sync Banner */}
      {syncBanner && (
        <div style={{
          padding: '9px 20px',
          background: syncBanner.type === 'success' ? '#f0fdf4' : syncBanner.type === 'warning' ? '#fffbeb' : '#fef2f2',
          borderBottom: `1px solid ${syncBanner.type === 'success' ? '#bbf7d0' : syncBanner.type === 'warning' ? '#fde68a' : '#fecaca'}`,
          color: syncBanner.type === 'success' ? '#15803d' : syncBanner.type === 'warning' ? '#92400e' : '#b91c1c',
          fontSize: 12,
          fontWeight: 500,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12
        }}>
          <span>{syncBanner.msg}</span>
          <button onClick={() => setSyncBanner(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0, opacity: 0.6 }}>×</button>
        </div>
      )}

      <div className="repair-admin-container">
        {/* Stats */}
        <div className="repair-stats">
          {[
            { icon: '🔧', val: inProgressCount, label: 'In Progress' },
            { icon: '✓', val: completedCount, label: 'Completed' },
            { icon: '₹', val: fmtMoney(todayRevenue), label: "Today" }
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-info"><h3>{s.val}</h3><p>{s.label}</p></div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="repair-tabs">
          {tabsList.map(t => (
            <button key={t.id} className={`repair-tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ---- BILLS ---- */}
        {activeTab === 'bills' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 className="section-title">Bills</h2>
                <button
                  onClick={() => setShowAllBills(v => !v)}
                  style={{
                    background: showAllBills ? '#1c1c1e' : '#f5f5f4',
                    border: '1px solid',
                    borderColor: showAllBills ? '#1c1c1e' : '#e0e0e0',
                    color: showAllBills ? '#fff' : '#636366',
                    borderRadius: 20,
                    padding: '4px 12px',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  {showAllBills ? `All (${bills.length})` : 'Today'}
                </button>
              </div>
              <button className="btn-create-bill" onClick={() => openBillForm()}>+ New Bill</button>
            </div>
            {(() => {
              const displayBills = showAllBills
                ? bills.slice(0, 200)
                : bills.filter(b =>
                    getLocalDateStr(b.createdAt) === today ||
                    getLocalDateStr(b.completedAt) === today ||
                    b.status === 'in-progress'
                  );

              if (displayBills.length === 0) {
                return (
                  <div className="empty-state" style={{ padding: 40 }}>
                    <div className="empty-icon">💰</div>
                    <h3>No Bills for Today</h3>
                    <p style={{ color: '#aaa', marginTop: 10 }}>
                      Today's bills are shown here automatically.<br/>
                      Click <strong style={{ color: '#93c5fd' }}>📋 All Bills</strong> above to see all records, or use the <strong>Search</strong> tab.<br/>
                      {getPendingQueue().length > 0 && (
                        <span style={{ color: '#fb923c' }}>⚠️ {getPendingQueue().length} bill(s) are pending MongoDB sync.</span>
                      )}
                    </p>
                  </div>
                );
              }

              return (
                <div className="bills-grid">
                  {displayBills.map(bill => {
                    const expTotal = (bill.expenses || []).reduce((s, e) => s + +e.cost, 0);
                    const issuer = bill.billedBy || bill.recipientName || 'master';
                    return (
                      <div key={bill.id} className="bill-card">
                        <div className="bill-header">
                          <span className="bill-id">{bill.id}</span>
                          <span className={`bill-status status-${bill.status}`}>{bill.status.replace('-', ' ')}</span>
                        </div>
                        <h3 className="bill-customer">{bill.customerName}</h3>
                        <p style={{ color: '#6b7280', fontSize: 13, margin: '2px 0' }}>{bill.customerPhone} · {bill.deviceModel}{bill.phoneColor ? ` · ${bill.phoneColor}` : ''}</p>
                        <p style={{ color: '#374151', fontSize: 13, margin: '2px 0 6px' }}>{bill.serviceType}</p>
                        <p style={{ color: '#6b7280', fontSize: 12, margin: '2px 0' }}>Tech: <strong style={{ color: '#374151' }}>{bill.repairerName}</strong></p>
                        <p style={{ color: '#9ca3af', fontSize: 11, margin: '2px 0 8px' }}>By {issuer} · {fmtDate(bill.createdAt)}</p>

                        {(bill.expenses || []).length > 0 && (
                          <div style={{ margin: '8px 0', padding: '10px 12px', background: '#f5f5f4', borderRadius: 8 }}>
                            {bill.expenses.map((e, i) => (
                              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', padding: '1px 0' }}>
                                <span>{e.name}</span><span>{fmtMoney(e.cost)}</span>
                              </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#374151', borderTop: '1px solid #e5e5e5', marginTop: 5, paddingTop: 5 }}>
                              <span>Parts total</span><span>{fmtMoney(expTotal)}</span>
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, margin: '8px 0 4px', color: '#1c1c1e' }}>
                          <span>Charge</span><span>{fmtMoney(bill.finalCharge)}</span>
                        </div>
                        {bill.status === 'completed' && (
                          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Commission</span><span>{fmtMoney(bill.commission)}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#374151' }}><span>Profit</span><span>{fmtMoney(bill.storeProfit)}</span></div>
                          </div>
                        )}

                        {/* Desktop Actions */}
                        <div className="desktop-actions" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                          {bill.status === 'in-progress' && (
                            <>
                              <button style={BS('#f5f5f4', '#374151', '1px solid #e0e0e0')} onClick={(e) => { e.stopPropagation(); openEditBill(bill); }}>Edit</button>
                              <button style={BS('#1c1c1e', '#fff')} onClick={(e) => { e.stopPropagation(); completeBill(bill.id); }}>Complete</button>
                            </>
                          )}
                          {bill.status === 'completed' && (
                            <>
                              <button style={BS('#dcfce7', '#15803d', '1px solid #bbf7d0')} onClick={(e) => { e.stopPropagation(); sendWhatsApp(bill); }}>WhatsApp</button>
                              <button style={BS('#fef2f2', '#b91c1c', '1px solid #fecaca')} onClick={(e) => { e.stopPropagation(); refundBill(bill.id); }}>Refund</button>
                            </>
                          )}
                          <button style={BS('#f5f5f4', '#636366', '1px solid #e0e0e0')} onClick={(e) => { e.stopPropagation(); printBill(bill, repairers); }}>Print</button>
                          <button style={BS('#f5f5f4', '#636366', '1px solid #e0e0e0')} onClick={(e) => { e.stopPropagation(); setViewBill(bill); }}>View</button>
                          {currentUser.role === 'master' && <button style={BS('#fef2f2', '#b91c1c', '1px solid #fecaca')} onClick={(e) => { e.stopPropagation(); deleteBill(bill.id); }}>Delete</button>}
                        </div>

                        {/* Mobile Actions Button */}
                        <button className="mobile-actions-btn" onClick={(e) => { e.stopPropagation(); setMobileActionBill(bill); }} style={{ marginTop: 10, padding: '10px', background: '#f5f5f4', border: '1px solid #e0e0e0', borderRadius: 8, color: '#1c1c1e', fontWeight: 600, width: '100%', display: 'none' }}>
                          Manage Bill Options
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ---- TECHNICIANS ---- */}
        {activeTab === 'repairers' && (
          <div>
            {selectedTechFolder ? (
              // --- TECHNICIAN FOLDER VIEW ---
              (() => {
                const r = selectedTechFolder;
                const rBills = bills.filter(b => b.repairerName === r.name || (b.custodyHistory?.length > 0 && b.custodyHistory.slice(-1)[0].holder === r.name) || (b.pendingCustody?.targetHolder === r.name));
                const completed = rBills.filter(b => b.repairerName === r.name && b.status === 'completed');
                const refunded = rBills.filter(b => b.repairerName === r.name && b.status === 'refunded');
                const deleted = rBills.filter(b => b.repairerName === r.name && b.status === 'deleted');
                const active = rBills.filter(b => b.status === 'in-progress' && (
                  b.pendingCustody?.targetHolder === r.name ||
                  (!b.pendingCustody?.targetHolder && b.custodyHistory?.slice(-1)[0]?.holder === r.name) ||
                  (!b.pendingCustody?.targetHolder && (!b.custodyHistory || b.custodyHistory.length === 0) && b.repairerName === r.name)
                ));

                const totalRev = completed.reduce((s, b) => s + (+b.finalCharge || 0), 0);
                const totalComm = completed.reduce((s, b) => s + (+b.commission || 0), 0);
                const refundedComm = refunded.reduce((s, b) => s + (+b.commission || 0), 0);

                return (
                  <div className="technician-folder">
                    <button onClick={() => setSelectedTechFolder(null)} style={{ background: 'transparent', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>←</span> Back to Technicians
                    </button>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 24, background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 24 }}>
                      <div>
                        <h2 style={{ margin: '0 0 4px', fontSize: 24, color: '#1c1c1e', display: 'flex', alignItems: 'center', gap: 8 }}>
                          👨‍🔧 {r.name}
                        </h2>
                        <div style={{ color: '#6b7280', fontSize: 14 }}>
                          {r.type === 'commission' ? `${r.commission}% Commission Based` : 'Salaried'} • PIN: <code style={{ color: '#fff', background: '#333', padding: '2px 6px', borderRadius: 4 }}>{r.pin || '0000'}</code>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Total Revenue</div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: '#1c1c1e' }}>{fmtMoney(totalRev)}</div>
                        </div>
                        <div style={{ width: 1, background: '#e5e5e5' }}></div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Earned</div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{fmtMoney(totalComm)}</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                      {/* Active Jobs */}
                      <div>
                        <h3 style={{ fontSize: 16, color: '#1c1c1e', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                          <span>🔧 Active Jobs (With Tech)</span>
                          <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>{active.length}</span>
                        </h3>
                        {active.length === 0 ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No active jobs.</p> : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {active.map(b => (
                              <div key={b.id} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, padding: 12, fontSize: 13 }}>
                                <div style={{ fontWeight: 600, color: '#1c1c1e', display: 'flex', justifyContent: 'space-between' }}>
                                  {b.deviceModel} <span>{b.customerPhone}</span>
                                </div>
                                <div style={{ color: '#6b7280', marginTop: 4 }}>{b.customerName}</div>
                                {b.pendingCustody?.targetHolder === r.name && (
                                  <div style={{ marginTop: 8, fontSize: 12, color: '#d97706', background: '#fef3c7', padding: '4px 8px', borderRadius: 4, display: 'inline-block' }}>
                                    Pending Acceptance from {b.pendingCustody.transferredBy}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Completed Jobs */}
                      <div>
                        <h3 style={{ fontSize: 16, color: '#1c1c1e', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                          <span>✅ Completed</span>
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>{completed.length}</span>
                        </h3>
                        {completed.length === 0 ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No completed jobs.</p> : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 500, overflowY: 'auto', paddingRight: 4 }}>
                            {completed.map(b => (
                              <div key={b.id} style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 8, padding: 12, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontWeight: 600, color: '#1c1c1e' }}>{b.deviceModel}</div>
                                  <div style={{ color: '#6b7280', marginTop: 4 }}>{b.customerName} • {fmtDate(b.createdAt)}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ color: '#1c1c1e', fontWeight: 600 }}>{fmtMoney(b.finalCharge)}</div>
                                  <div style={{ color: '#10b981', fontSize: 12, fontWeight: 700 }}>+{fmtMoney(b.commission)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Refunded/Deleted Jobs */}
                      <div>
                        <h3 style={{ fontSize: 16, color: '#1c1c1e', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                          <span>💸 Refunded / Deleted</span>
                          <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>{refunded.length + deleted.length}</span>
                        </h3>
                        {refunded.length === 0 && deleted.length === 0 ? <p style={{ color: '#9ca3af', fontSize: 13 }}>No refunded or deleted jobs.</p> : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {refunded.map(b => (
                              <div key={b.id} style={{ background: '#fff', border: '1px solid #fca5a5', borderRadius: 8, padding: 12, fontSize: 13 }}>
                                <div style={{ fontWeight: 600, color: '#991b1b', display: 'flex', justifyContent: 'space-between' }}>
                                  {b.deviceModel} <span style={{ fontSize: 11, background: '#fef2f2', padding: '2px 6px', borderRadius: 4 }}>REFUNDED</span>
                                </div>
                                <div style={{ color: '#6b7280', marginTop: 4 }}>{b.customerName}</div>
                                <div style={{ color: '#ef4444', fontSize: 12, fontWeight: 700, marginTop: 4 }}>Returned to customer (was {fmtMoney(b.commission)})</div>
                              </div>
                            ))}
                            {deleted.map(b => (
                              <div key={b.id} style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, padding: 12, fontSize: 13, opacity: 0.7 }}>
                                <div style={{ fontWeight: 600, color: '#4b5563', display: 'flex', justifyContent: 'space-between' }}>
                                  {b.deviceModel} <span style={{ fontSize: 11, background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>DELETED</span>
                                </div>
                                <div style={{ color: '#6b7280', marginTop: 4 }}>{b.customerName}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              // --- STANDARD GRID VIEW ---
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 className="section-title">Technicians</h2>
                  <button className="btn-create-bill" onClick={() => { setEditingRepairer(null); setRepairerForm({ name: '', type: 'commission', commission: 0, pin: '0000' }); setShowRepairerForm(true); }}>
                    ➕ Add Technician
                  </button>
                </div>
                {repairers.length === 0 ? (
                  <div className="empty-state"><div className="empty-icon">👨‍🔧</div><h3>No Technicians Added</h3></div>
                ) : (
                  <div className="repairers-grid">
                    {repairers.map(r => (
                      <div key={r.id} className="repairer-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="repairer-header">
                          <h3>{r.name}</h3>
                          <span className="repairer-type status-in-progress">{r.type === 'commission' ? `${r.commission}% Comm.` : 'Salaried'}</span>
                        </div>
                        <div style={{ fontSize: 13, color: '#aaa', marginTop: 8, flex: 1 }}>
                          PIN: <code style={{ color: '#fff', background: '#222', padding: '2px 6px', borderRadius: 4 }}>{r.pin || '0000'}</code>
                        </div>
                        
                        <button 
                          style={{ marginTop: 16, width: '100%', padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                          onClick={() => setSelectedTechFolder(r)}
                        >
                          📂 Open Folder / View Work
                        </button>
                        
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button style={{ ...BS('#1a1a1a', '#fff', '1px solid #333'), flex: 1 }} onClick={() => startEditRepairer(r)}>Edit</button>
                          <button style={{ ...BS('#222', '#f44', '1px solid #444'), flex: 1 }} onClick={() => deleteRepairer(r.id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ---- STAFF & ROLES (Master Admin Only) ---- */}
        {activeTab === 'staff' && currentUser.role === 'master' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 className="section-title" style={{ margin: 0 }}>👥 Staff & Bill Recipients</h2>
                <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
                  Master Admin authenticated. You can convert Sub-Admin ⇄ Accountant roles and assign them as bill recipients.
                </p>
              </div>
              <button className="btn-create-bill" onClick={() => setShowAddStaffModal(true)}>
                ➕ Add Sub-Admin / Accountant
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {staffUsers.map(user => (
                <div key={user._id || user.username} className="bill-card" style={{ padding: 18, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <h3 style={{ margin: 0, fontSize: 17, color: '#1c1c1e' }}>👤 {user.username}</h3>
                    <span style={{
                      padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                      background: user.role === 'master' ? '#2563eb' : user.role === 'sub_admin' ? '#059669' : '#d97706',
                      color: '#fff'
                    }}>
                      {user.role === 'master' ? 'Master Admin' : user.role === 'sub_admin' ? 'Sub-Admin' : 'Accountant'}
                    </span>
                  </div>

                  <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 14, flex: 1 }}>
                    {user.role === 'master'
                      ? 'Full privileges: staff management, bill issuing, and system control.'
                      : user.role === 'sub_admin'
                      ? 'Authorized to manage repair jobs, technicians, and issue bills.'
                      : 'Authorized to review revenue, finances, and issue bills.'}
                  </p>

                  {user.role !== 'master' && (
                    <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #e5e5e5', paddingTop: 12 }}>
                      {user.role === 'sub_admin' ? (
                        <button
                          style={BS('#f5f5f4', '#1c1c1e', '1px solid #e5e5e5')}
                          onClick={() => convertUserRole(user._id, 'accountant')}
                        >
                          🔄 Convert to Accountant
                        </button>
                      ) : (
                        <button
                          style={BS('#f5f5f4', '#1c1c1e', '1px solid #e5e5e5')}
                          onClick={() => convertUserRole(user._id, 'sub_admin')}
                        >
                          🔄 Convert to Sub-Admin
                        </button>
                      )}
                      <button
                        style={BS('#fef2f2', '#ef4444', '1px solid #fecaca')}
                        onClick={() => handleDeleteStaff(user._id, user.username)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- EARNINGS ---- */}
        {activeTab === 'earnings' && (() => {
          const repairerEarnings = repairers.map(r => {
            const rBills = filteredCompletedBills.filter(b => b.repairerName === r.name);
            const totalRev = rBills.reduce((s, b) => s + (+b.finalCharge || 0), 0);
            const totalComm = r.type === 'commission'
              ? rBills.reduce((s, b) => s + (+b.commission || 0), 0)
              : 0;
            return { ...r, jobs: rBills.length, revenue: totalRev, commissionEarned: totalComm, commissionPercent: r.commission, bills: rBills };
          });

          const totalJobs = filteredCompletedBills.length;
          const totalRev = filteredCompletedBills.reduce((s, b) => s + (+b.finalCharge || 0), 0);
          const totalComm = repairerEarnings.reduce((s, r) => s + r.commissionEarned, 0);
          const totalExp = filteredCompletedBills.reduce((s, b) => s + ((b.expenses || []).reduce((es, e) => es + +e.cost, 0)), 0);
          const netProfit = totalRev - totalComm - totalExp;

          return (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <h2 className="section-title" style={{ margin: 0 }}>Financial Dashboard</h2>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {['today', 'week', 'month', 'custom'].map(f => (
                    <button
                      key={f}
                      onClick={() => setEarningsFilter(f)}
                      style={{
                        padding: '6px 14px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
                        background: earningsFilter === f ? '#1c1c1e' : '#fff',
                        color: earningsFilter === f ? '#fff' : '#6b7280',
                        border: '1px solid ' + (earningsFilter === f ? '#1c1c1e' : '#e0e0e0'),
                        fontWeight: earningsFilter === f ? 700 : 500
                      }}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                  {earningsFilter === 'custom' && (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="date" value={customRange.startDate} onChange={e => setCustomRange(r => ({ ...r, startDate: e.target.value }))} style={{ ...IS, width: 'auto', padding: '4px 8px' }} />
                      <span style={{ color: '#666' }}>to</span>
                      <input type="date" value={customRange.endDate} onChange={e => setCustomRange(r => ({ ...r, endDate: e.target.value }))} style={{ ...IS, width: 'auto', padding: '4px 8px' }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
                {[
                  { label: 'Completed Jobs', val: totalJobs, sub: 'Filtered period', color: '#1c1c1e' },
                  { label: 'Total Revenue', val: fmtMoney(totalRev), sub: 'Gross incoming', color: '#1c1c1e' },
                  { label: 'Commissions Paid', val: fmtMoney(totalComm), sub: 'To technicians', color: '#6b7280' },
                  { label: 'Net Store Profit', val: fmtMoney(netProfit), sub: 'After comm. & expenses', color: netProfit >= 0 ? '#10b981' : '#ef4444' }
                ].map((c, i) => (
                  <div key={i} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, padding: 18 }}>
                    <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, fontWeight: 600 }}>{c.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: c.color, marginBottom: 4 }}>{c.val}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{c.sub}</div>
                  </div>
                ))}
              </div>

              {/* Technician Breakdown */}
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#aaa', marginBottom: 12 }}>Technician Breakdown</h3>
              {repairers.length === 0 ? (
                <div className="empty-state"><p>No technicians configured yet.</p></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {repairerEarnings.map(d => (
                    <div key={d.id} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 8, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', flexWrap: 'wrap', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 20 }}>👨‍🔧</span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: '#1c1c1e' }}>{d.name}</div>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>{d.type === 'commission' ? `${d.commissionPercent}% commission` : 'Salaried'}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 20, textAlign: 'right' }}>
                          <div><div style={{ fontSize: 16, fontWeight: 700, color: '#1c1c1e' }}>{d.jobs}</div><div style={{ fontSize: 11, color: '#6b7280' }}>Jobs</div></div>
                          <div><div style={{ fontSize: 16, fontWeight: 700, color: '#1c1c1e' }}>{fmtMoney(d.revenue)}</div><div style={{ fontSize: 11, color: '#6b7280' }}>Revenue</div></div>
                          <div><div style={{ fontSize: 16, fontWeight: 700, color: d.commissionEarned >= 0 ? '#10b981' : '#ef4444' }}>{fmtMoney(d.commissionEarned)}</div><div style={{ fontSize: 11, color: '#6b7280' }}>Earned</div></div>
                        </div>
                      </div>
                      {d.bills.length > 0 && (
                        <details>
                          <summary style={{ padding: '10px 18px', cursor: 'pointer', fontSize: 13, color: '#3b82f6', listStyle: 'none', userSelect: 'none', fontWeight: 500 }}>
                            ▸ View {d.bills.length} bill{d.bills.length > 1 ? 's' : ''}
                          </summary>
                          <div style={{ padding: '0 18px 12px' }}>
                            {d.bills.map(b => (
                              <div 
                                key={b.id} 
                                onClick={() => setViewBill(b)}
                                style={{ 
                                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                  padding: '8px 6px', borderBottom: '1px solid #f3f4f6', fontSize: 13,
                                  cursor: 'pointer', transition: 'background 0.2s', borderRadius: 4
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                <div>
                                  <span style={{ fontWeight: 600, color: '#1c1c1e' }}>{b.customerName}</span>
                                  <span style={{ color: '#6b7280', marginLeft: 8 }}>{b.deviceModel}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontWeight: 600 }}>{fmtMoney(b.finalCharge)}</div>
                                  <div style={{ fontSize: 11, color: '#888' }}>{fmtDate(b.createdAt)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* ---- SEARCH ---- */}
        {activeTab === 'search' && (
          <div>
            <h2 className="section-title" style={{ marginBottom: 16 }}>🔍 Search Bills</h2>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Enter 10-digit phone, Bill ID, or customer name..."
                value={searchPhone}
                onChange={e => { setSearchPhone(e.target.value); setSearchTriggered(false); }}
                onKeyDown={e => { if (e.key === 'Enter') setSearchTriggered(true); }}
                style={{ ...IS, flex: 1, minWidth: '200px', fontSize: 15, padding: '10px 14px' }}
              />
              <input
                type="date"
                value={searchDate}
                onChange={e => { setSearchDate(e.target.value); setSearchTriggered(false); }}
                onKeyDown={e => { if (e.key === 'Enter') setSearchTriggered(true); }}
                style={{ ...IS, width: 'auto', fontSize: 15, padding: '10px 14px' }}
              />
              <button
                onClick={() => setSearchTriggered(true)}
                style={{ padding: '10px 20px', background: '#fff', color: '#000', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}
              >
                Search
              </button>
            </div>

            {!searchTriggered && (
              <div className="empty-state" style={{ padding: 40 }}>
                <div className="empty-icon">🔍</div>
                <h3>Enter details to search</h3>
                <p>Search by 10-digit Phone, Bill ID, Customer Name, or Date</p>
              </div>
            )}

            {searchTriggered && !searchDate && searchPhone.length < 3 && (
              <div className="empty-state"><h3>Enter at least 3 characters</h3></div>
            )}

            {searchTriggered && (searchDate || searchPhone.length >= 3) && (
              <div className="bills-grid">
                {searchResults.length === 0 ? (
                  <div className="empty-state"><h3>No bills found</h3></div>
                ) : (
                  searchResults.map(bill => {
                    const expTotal = (bill.expenses || []).reduce((s, e) => s + +e.cost, 0);
                    return (
                      <div key={bill.id} className="bill-card">
                        <div className="bill-header">
                          <span className="bill-id">{bill.id}</span>
                          <span className={`bill-status status-${bill.status}`}>{bill.status}</span>
                        </div>
                        <h3 className="bill-customer">{bill.customerName}</h3>
                        <p style={{ color: '#aaa', fontSize: 13 }}>📞 {bill.customerPhone}</p>
                        <p style={{ color: '#aaa', fontSize: 13 }}>📱 {bill.deviceModel}{bill.phoneColor ? ` • ${bill.phoneColor}` : ''}</p>
                        <p style={{ color: '#444', fontSize: 11, marginBottom: 10 }}>{fmtDate(bill.createdAt)}</p>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {bill.status === 'completed' && (
                            <>
                              <button style={BS('#25D366', '#fff')} onClick={() => sendWhatsApp(bill)}>📱 WhatsApp</button>
                              <button style={BS('#111', '#aaa', '1px solid #333')} onClick={() => printBill(bill, repairers)}>🖨️ Print</button>
                            </>
                          )}
                          <button style={BS('#111', '#888', '1px solid #333')} onClick={() => setViewBill(bill)}>👁️ View</button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* ---- REFUNDS ---- */}
        {activeTab === 'refunds' && (
          <div>
            <h2 className="section-title">💸 Refunds</h2>
            <p style={{ color: '#888', marginBottom: 20 }}>Bills marked as refunded are completely excluded from Earnings and Commissions.</p>
            
            <div className="bills-grid">
              {bills.filter(b => b.status === 'refunded').length === 0 ? (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <div className="empty-icon">💸</div>
                  <h3>No Refunded Bills</h3>
                  <p>Search for a completed bill in the <strong>Search</strong> tab to process a refund.</p>
                </div>
              ) : (
                bills.filter(b => b.status === 'refunded').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(bill => {
                  const expTotal = (bill.expenses || []).reduce((s, e) => s + +e.cost, 0);
                  return (
                    <div key={bill.id} className="bill-card" style={{ border: '1px solid #ef4444' }}>
                      <div className="bill-header">
                        <span className="bill-id">{bill.id}</span>
                        <span className="bill-status" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>Refunded</span>
                      </div>
                      <h3 className="bill-customer">{bill.customerName}</h3>
                      <p style={{ color: '#aaa', fontSize: 13 }}>📞 {bill.customerPhone}</p>
                      <p style={{ color: '#aaa', fontSize: 13 }}>📱 {bill.deviceModel}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 15, margin: '8px 0' }}>
                        <span>Refunded Amount:</span><span style={{ color: '#ef4444' }}>-{fmtMoney(bill.finalCharge)}</span>
                      </div>
                      <p style={{ color: '#444', fontSize: 11, marginBottom: 10 }}>{fmtDate(bill.createdAt)}</p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button style={BS('#111', '#888', '1px solid #333')} onClick={() => setViewBill(bill)}>👁️ View Original Bill</button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* ---- PHONE TRACKING ---- */}
        {activeTab === 'tracking' && (
          <div>
            <h2 className="section-title">📱 Phone Custody Tracking</h2>
            <p style={{ color: '#888', marginBottom: 20 }}>Track where a device currently is and update custody when handing it over.</p>
            
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Enter 10-digit phone or Bill ID..."
                value={trackingSearch}
                onChange={e => setTrackingSearch(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') searchTrackingBill(); }}
                style={{ ...IS, flex: 1, minWidth: '200px', fontSize: 15, padding: '10px 14px' }}
              />
              <button
                onClick={searchTrackingBill}
                style={{ padding: '10px 20px', background: '#1c1c1e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
              >
                Search
              </button>
            </div>

            {!trackingBill && (
              <div className="empty-state" style={{ padding: 40 }}>
                <div className="empty-icon">📱</div>
                <h3>Search to track a phone</h3>
              </div>
            )}

            {trackingBill === 'NOT_FOUND' && (
              <div className="empty-state"><h3>Device not found</h3><p>Ensure the Bill ID or Phone Number is correct.</p></div>
            )}

            {trackingBill && trackingBill !== 'NOT_FOUND' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                <div className="card" style={{ background: '#fff', border: '1px solid #e8e8e8' }}>
                  <h3 style={{ fontSize: 16, marginBottom: 12, color: '#1c1c1e' }}>Device Details</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: '#6b7280' }}>Customer:</span> <strong style={{ color: '#1c1c1e' }}>{trackingBill.customerName}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: '#6b7280' }}>Phone:</span> <strong style={{ color: '#1c1c1e' }}>{trackingBill.customerPhone}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: '#6b7280' }}>Model:</span> <strong style={{ color: '#1c1c1e' }}>{trackingBill.deviceModel}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: '#6b7280' }}>Status:</span> <strong style={{ color: '#1c1c1e' }}>{trackingBill.status}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: '#6b7280' }}>Current Holder:</span> <strong style={{ color: '#d97706', fontSize: 16 }}>{trackingBill.custodyHistory?.slice(-1)[0]?.holder || 'Store Front Desk'}</strong></div>
                  {trackingBill.pendingCustody && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: '#6b7280' }}>Pending Transfer:</span> <strong style={{ color: '#fbbf24', fontSize: 16 }}>To {trackingBill.pendingCustody.targetHolder}</strong></div>
                  )}
                  
                  {trackingBill.status === 'deleted' ? (
                    <div style={{ marginTop: 24, padding: 16, border: '1px solid #fca5a5', borderRadius: 8, background: '#fef2f2', color: '#991b1b' }}>
                      <h4 style={{ marginBottom: 4 }}>Device Deleted</h4>
                      <p style={{ fontSize: 14, margin: 0 }}>This bill was deleted. Tracking and custody transfers are disabled.</p>
                    </div>
                  ) : (
                    <div style={{ marginTop: 24, padding: 16, border: '1px solid #e5e5e5', borderRadius: 8, background: '#f9fafb' }}>
                      <h4 style={{ marginBottom: 12 }}>Admin Override Transfer</h4>
                      <select 
                        style={{ ...IS, marginBottom: 12 }} 
                        value={newCustodyHolder} 
                        onChange={e => setNewCustodyHolder(e.target.value)}
                      >
                        <option value="">-- Select New Holder --</option>
                        <optgroup label="Locations">
                          <option value="Store Front Desk">Store Front Desk</option>
                          <option value="Customer (Delivered)">Customer (Delivered)</option>
                        </optgroup>
                        <optgroup label="Technicians">
                          {repairers.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                        </optgroup>
                        <optgroup label="Staff">
                          {staffUsers.map(s => <option key={s.username} value={s.username}>{s.username}</option>)}
                          <option value="master">Master Admin</option>
                        </optgroup>
                      </select>
                      <button style={BS('#2563eb', '#fff', 'none', '100%')} onClick={handleCustodyTransfer}>Update Custody</button>
                    </div>
                  )}
                </div>

                <div className="card" style={{ background: '#fff', border: '1px solid #e8e8e8' }}>
                  <h3 style={{ fontSize: 16, marginBottom: 16, color: '#1c1c1e' }}>Custody Timeline</h3>
                  {(trackingBill.custodyHistory || []).length === 0 && !trackingBill.pendingCustody && <p style={{ color: '#6b7280' }}>No tracking history recorded.</p>}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {trackingBill.pendingCustody && (
                      <div style={{ display: 'flex', gap: 12, opacity: 0.6 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fbbf24', border: '2px solid #fff', outline: '2px dashed #fbbf24' }}></div>
                          <div style={{ width: 2, flex: 1, background: '#e5e5e5', marginTop: 4 }}></div>
                        </div>
                        <div style={{ paddingBottom: 16 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: '#d97706' }}>Pending Transfer to {trackingBill.pendingCustody.targetHolder}</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>{fmtDate(trackingBill.pendingCustody.timestamp)}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Sent by: {trackingBill.pendingCustody.transferredBy}</div>
                        </div>
                      </div>
                    )}
                    {(trackingBill.custodyHistory || []).slice().reverse().map((h, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: 12, height: 12, borderRadius: '50%', background: (i === 0 && !trackingBill.pendingCustody) ? '#10b981' : '#d1d5db' }}></div>
                          {i !== trackingBill.custodyHistory.length - 1 && <div style={{ width: 2, flex: 1, background: '#e5e5e5', marginTop: 4 }}></div>}
                        </div>
                        <div style={{ paddingBottom: i !== trackingBill.custodyHistory.length - 1 ? 16 : 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: (i === 0 && !trackingBill.pendingCustody) ? '#1c1c1e' : '#4b5563' }}>{h.holder}</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>{fmtDate(h.timestamp)}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Logged by: {h.updatedBy} {h.notes ? `• ${h.notes}` : ''}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== MODALS ===================== */}

        {/* Add Staff Modal (Master Admin) */}
        <AnimatePresence>
          {showAddStaffModal && (
            <motion.div className="bill-form-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddStaffModal(false)}>
              <motion.div className="bill-form" initial={{ scale: 0.85, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 40 }} onClick={e => e.stopPropagation()}>
                <h2 className="form-title">➕ Add Staff Account</h2>
                <div className="bill-form-content">
                  <FG label="Username *">
                    <input style={IS} value={newStaffForm.username} onChange={e => setNewStaffForm(f => ({ ...f, username: e.target.value }))} placeholder="e.g. subadmin2, accountant2" />
                  </FG>
                  <FG label="Password *">
                    <input style={IS} type="password" value={newStaffForm.password} onChange={e => setNewStaffForm(f => ({ ...f, password: e.target.value }))} placeholder="Account password" />
                  </FG>
                  <FG label="Role *">
                    <select style={IS} value={newStaffForm.role} onChange={e => setNewStaffForm(f => ({ ...f, role: e.target.value }))}>
                      <option value="sub_admin">Sub-Admin (Operations & Bills)</option>
                      <option value="accountant">Accountant (Earnings & Bills)</option>
                    </select>
                  </FG>
                  <div className="form-buttons" style={{ marginTop: 16 }}>
                    <button className="btn-cancel" onClick={() => setShowAddStaffModal(false)}>Cancel</button>
                    <button className="btn-complete" onClick={handleAddStaff}>Create Account</button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Technician Form Modal */}
        <AnimatePresence>
          {showRepairerForm && (
            <motion.div className="bill-form-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRepairerForm(false)}>
              <motion.div className="bill-form" initial={{ scale: 0.85, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 40 }} onClick={e => e.stopPropagation()}>
                <h2 className="form-title">{editingRepairer ? 'Edit Technician' : 'Add Technician'}</h2>
                <div className="bill-form-content">
                  <div className="form-group"><label>Name *</label><input style={IS} value={repairerForm.name} onChange={e => setRepairerForm(f => ({ ...f, name: e.target.value }))} placeholder="Technician name" /></div>
                  <div className="form-group"><label>4-Digit PIN (for Tech Portal) *</label><input style={IS} maxLength={4} pattern="\d{4}" value={repairerForm.pin} onChange={e => setRepairerForm(f => ({ ...f, pin: e.target.value }))} placeholder="e.g. 0000" /></div>
                  <div className="form-group"><label>Payment Type</label>
                    <select style={IS} value={repairerForm.type} onChange={e => setRepairerForm(f => ({ ...f, type: e.target.value }))}>
                      <option value="commission">Commission Based (%)</option>
                      <option value="salaried">Salaried (Fixed)</option>
                    </select>
                  </div>
                  {repairerForm.type === 'commission' && (
                    <div className="form-group"><label>Commission % *</label><input style={IS} type="number" min={0} max={100} value={repairerForm.commission} onChange={e => setRepairerForm(f => ({ ...f, commission: e.target.value }))} placeholder="e.g. 30" /></div>
                  )}
                  <div className="form-buttons">
                    <button className="btn-cancel" onClick={() => { setShowRepairerForm(false); setEditingRepairer(null); }}>Cancel</button>
                    <button className="btn-complete" onClick={saveRepairer}>{editingRepairer ? 'Update' : 'Add'}</button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Bill Form Modal */}
        <AnimatePresence>
          {showBillForm && (
            <motion.div className="bill-form-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBillForm(false)}>
              <motion.div className="bill-form" initial={{ scale: 0.85, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 40 }} onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                <h2 className="form-title">Create Bill</h2>
                <div className="bill-form-content">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <FG label="Customer Name *">
                      <input style={IS} value={billForm.customerName} onChange={e => setBillForm(b => ({ ...b, customerName: e.target.value }))} placeholder="Full name" />
                    </FG>

                    {/* Recipient / Billed By: authenticated user & selector */}
                    {currentUser.role === 'master' ? (
                      <FG label="Billed By / Recipient *">
                        <select
                          style={IS}
                          value={billForm.recipientName || currentUser.username}
                          onChange={e => setBillForm(b => ({ ...b, recipientName: e.target.value, billedBy: e.target.value }))}
                        >
                          <option value={currentUser.username}>{currentUser.username} (Master Admin) [You]</option>
                          {staffUsers
                            .filter(u => u.username !== currentUser.username)
                            .map(u => (
                              <option key={u._id || u.username} value={u.username}>
                                {u.username} ({u.role === 'sub_admin' ? 'Sub-Admin' : u.role === 'accountant' ? 'Accountant' : u.role})
                              </option>
                            ))}
                        </select>
                      </FG>
                    ) : (
                      <FG label="Billed By / Recipient">
                        <input
                          style={{ ...IS, background: '#181818', color: '#bbb' }}
                          readOnly
                          value={`${currentUser.username} (${currentUser.role === 'sub_admin' ? 'Sub-Admin' : 'Accountant'}) [You]`}
                        />
                      </FG>
                    )}

                    {/* Phone Number with 10-digit validation */}
                    <FG label="Phone Number *">
                      <input
                        style={{ ...IS, borderColor: phoneError ? '#ef4444' : '#333' }}
                        type="tel"
                        value={billForm.customerPhone}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setBillForm(b => ({ ...b, customerPhone: val }));
                          if (val.length > 0 && val.length !== 10) {
                            setPhoneError('Incorrect. Please enter 10 digits');
                          } else {
                            setPhoneError('');
                          }
                        }}
                        placeholder="10-digit mobile number"
                      />
                      {phoneError ? (
                        <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontWeight: 'bold' }}>
                          ⚠️ {phoneError} ({billForm.customerPhone.length}/10 digits)
                        </div>
                      ) : billForm.customerPhone.length === 10 ? (
                        <div style={{ color: '#10b981', fontSize: '11px', marginTop: '4px', fontWeight: 'bold' }}>
                          ✓ Valid 10-digit mobile number
                        </div>
                      ) : null}
                    </FG>

                    <FG label="Device Model *"><input style={IS} value={billForm.deviceModel} onChange={e => setBillForm(b => ({ ...b, deviceModel: e.target.value }))} placeholder="e.g. iPhone 13" /></FG>
                    <FG label="Phone Color"><input style={IS} value={billForm.phoneColor} onChange={e => setBillForm(b => ({ ...b, phoneColor: e.target.value }))} placeholder="e.g. Black, Silver" /></FG>
                    <FG label="Phone Password / Pattern"><input style={IS} value={billForm.phonePassword} onChange={e => setBillForm(b => ({ ...b, phonePassword: e.target.value }))} placeholder="PIN or pattern description" /></FG>
                    <FG label="Service Type *" style={{ gridColumn: 'span 2' }}><input style={IS} value={billForm.serviceType} onChange={e => setBillForm(b => ({ ...b, serviceType: e.target.value }))} placeholder="e.g. Screen Replacement, Battery" /></FG>
                  </div>

                  <div className="form-group" style={{ marginTop: 8 }}>
                    <label style={{ fontSize: 13, color: '#aaa', display: 'block', marginBottom: 6 }}>Assign Technician *</label>
                    <select style={IS} value={billForm.repairerName} onChange={e => setBillForm(b => ({ ...b, repairerName: e.target.value }))}>
                      <option value="">Select Technician</option>
                      {repairers.map(r => <option key={r.id} value={r.name}>{r.name} ({r.type === 'commission' ? `${r.commission}%` : 'Salary'})</option>)}
                    </select>
                  </div>

                  {/* Parts / Expenses */}
                  <div className="form-group" style={{ marginTop: 8 }}>
                    <label style={{ fontSize: 13, color: '#aaa', display: 'block', marginBottom: 6 }}>Parts / Expenses (optional)</label>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                      <input style={{ ...IS, flex: 2 }} placeholder="Part name (e.g. LCD, Battery)" value={newExpense.name} onChange={e => setNewExpense(n => ({ ...n, name: e.target.value }))} />
                      <input style={{ ...IS, flex: 1 }} type="number" placeholder="₹" value={newExpense.cost} onChange={e => setNewExpense(n => ({ ...n, cost: e.target.value }))} />
                      <button style={BS('#222', '#fff', '1px solid #444')} onClick={addExpense}>➕</button>
                    </div>
                    {billForm.expenses.map((e, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '5px 0', borderBottom: '1px solid #1a1a1a' }}>
                        <span style={{ color: '#ccc' }}>{e.name} — {fmtMoney(e.cost)}</span>
                        <button onClick={() => removeExpense(i)} style={{ background: 'none', border: 'none', color: '#f44', cursor: 'pointer', fontSize: 16 }}>✕</button>
                      </div>
                    ))}
                  </div>

                  <div className="form-group" style={{ marginTop: 8 }}>
                    <label style={{ fontSize: 13, color: '#aaa', display: 'block', marginBottom: 6 }}>Final Charge to Customer (₹)</label>
                    <input style={IS} type="number" placeholder="Leave blank if not decided yet" value={billForm.finalCharge} onChange={e => setBillForm(b => ({ ...b, finalCharge: e.target.value }))} />
                    <p style={{ fontSize: 11, color: '#555', marginTop: 4 }}>You can set or update this later when the job is in progress.</p>
                  </div>

                  {/* Live Commission Preview */}
                  {billForm.repairerName && billForm.finalCharge && (
                    <div style={{ background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                      {(() => {
                        const fc = +billForm.finalCharge || 0;
                        const exTotal = (billForm.expenses || []).reduce((s, e) => s + +e.cost, 0);
                        const r = getRepairerForBill(billForm.repairerName);
                        const comm = calcCommission(fc, exTotal, billForm.repairerName);
                        const profit = fc - exTotal - comm;
                        return (<>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: 13, marginBottom: 4 }}>
                            <span>Commission ({r?.commission || 0}%)</span><span>{fmtMoney(comm)}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
                            <span>Store Profit</span><span>{fmtMoney(profit)}</span>
                          </div>
                        </>);
                      })()}
                    </div>
                  )}

                  <div className="form-group">
                    <label style={{ fontSize: 13, color: '#aaa', display: 'block', marginBottom: 6 }}>Notes</label>
                    <textarea style={{ ...IS, resize: 'vertical' }} rows={3} placeholder="Additional notes..." value={billForm.notes} onChange={e => setBillForm(b => ({ ...b, notes: e.target.value }))} />
                  </div>

                  <div className="form-buttons">
                    <button className="btn-cancel" onClick={() => setShowBillForm(false)}>Cancel</button>
                    <button className="btn-complete" onClick={saveBillDraft}>Save as In Progress</button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* In-Progress Bill Edit Modal */}
        <AnimatePresence>
          {editingBill && (
            <motion.div className="bill-form-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingBill(null)}>
              <motion.div className="bill-form" initial={{ scale: 0.85, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 40 }} onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                <h2 className="form-title">Edit Bill — {editingBill.id}</h2>
                <div className="bill-form-content">
                  <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>
                    {editingBill.customerName} • {editingBill.deviceModel} • 👨‍🔧 {editingBill.repairerName}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <FG label="Customer Phone *">
                      <input
                        style={{ ...IS, borderColor: editPhoneError ? '#ef4444' : '#333' }}
                        type="tel"
                        value={editingBill.customerPhone || ''}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setEditingBill(b => ({ ...b, customerPhone: val }));
                          if (val.length > 0 && val.length !== 10) {
                            setEditPhoneError('Incorrect. Please enter 10 digits');
                          } else {
                            setEditPhoneError('');
                          }
                        }}
                        placeholder="10-digit phone"
                      />
                      {editPhoneError ? (
                        <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', fontWeight: 'bold' }}>
                          ⚠️ {editPhoneError} ({(editingBill.customerPhone || '').length}/10)
                        </div>
                      ) : (editingBill.customerPhone || '').length === 10 ? (
                        <div style={{ color: '#10b981', fontSize: '11px', marginTop: '4px', fontWeight: 'bold' }}>
                          ✓ Valid 10-digit number
                        </div>
                      ) : null}
                    </FG>

                    <FG label="Phone Password / PIN">
                      <input style={IS} value={editingBill.phonePassword || ''} onChange={e => setEditingBill(b => ({ ...b, phonePassword: e.target.value }))} placeholder="PIN / Pattern" />
                    </FG>
                  </div>

                  {/* Add expense */}
                  <div className="form-group">
                    <label style={{ fontSize: 13, color: '#aaa', display: 'block', marginBottom: 6 }}>Add Expense (e.g. LCD, Parts)</label>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                      <input style={{ ...IS, flex: 2 }} placeholder="Expense name" value={editExpense.name} onChange={e => setEditExpense(x => ({ ...x, name: e.target.value }))} />
                      <input style={{ ...IS, flex: 1 }} type="number" placeholder="₹ Cost" value={editExpense.cost} onChange={e => setEditExpense(x => ({ ...x, cost: e.target.value }))} />
                      <button style={BS('#222', '#fff', '1px solid #444')} onClick={addExpenseToEditBill}>➕ Add</button>
                    </div>
                    {(editingBill.expenses || []).map((e, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '5px 0', borderBottom: '1px solid #1a1a1a' }}>
                        <span style={{ color: '#ccc' }}>{e.name} — {fmtMoney(e.cost)}</span>
                        <button onClick={() => removeExpenseFromEditBill(i)} style={{ background: 'none', border: 'none', color: '#f44', cursor: 'pointer', fontSize: 16 }}>✕</button>
                      </div>
                    ))}
                  </div>

                  {/* Final Charge */}
                  <div className="form-group" style={{ marginTop: 12 }}>
                    <label style={{ fontSize: 13, color: '#aaa', display: 'block', marginBottom: 6 }}>Final Charge to Customer (₹) *</label>
                    <input style={IS} type="number" placeholder="Set final charge" value={editingBill.finalCharge || ''} onChange={e => setEditingBill(b => ({ ...b, finalCharge: e.target.value }))} />
                  </div>

                  {/* Notes */}
                  <div className="form-group" style={{ marginTop: 12 }}>
                    <label style={{ fontSize: 13, color: '#aaa', display: 'block', marginBottom: 6 }}>Notes</label>
                    <textarea style={{ ...IS, resize: 'vertical' }} rows={2} value={editingBill.notes || ''} onChange={e => setEditingBill(b => ({ ...b, notes: e.target.value }))} />
                  </div>

                  <div className="form-buttons" style={{ marginTop: 16 }}>
                    <button className="btn-cancel" onClick={() => setEditingBill(null)}>Cancel</button>
                    <button className="btn-complete" onClick={saveEditBill}>Save Changes</button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Bill Modal */}
        <AnimatePresence>
          {viewBill && (
            <motion.div className="bill-form-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewBill(null)}>
              <motion.div className="bill-form" initial={{ scale: 0.85, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 40 }} onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h2 className="form-title" style={{ margin: 0 }}>Bill #{viewBill.id}</h2>
                  <span className={`bill-status status-${viewBill.status}`}>{viewBill.status}</span>
                </div>
                <div style={{ fontSize: 13 }}>
                  {[
                    ['Customer', viewBill.customerName],
                    ['Phone', viewBill.customerPhone],
                    ['Device', viewBill.deviceModel],
                    viewBill.phoneColor && ['Color', viewBill.phoneColor],
                    viewBill.phonePassword && ['Password / PIN', viewBill.phonePassword],
                    ['Service', viewBill.serviceType],
                    ['Technician', viewBill.repairerName],
                    ['Billed By', viewBill.billedBy || viewBill.recipientName || 'master'],
                    ['Created', fmtDate(viewBill.createdAt)],
                  ].filter(Boolean).map(([k, v], i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1a1a1a', padding: '4px 0' }}>
                      <span style={{ color: '#888' }}>{k}</span><span>{v}</span>
                    </div>
                  ))}
                  {(viewBill.expenses || []).length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <strong style={{ color: '#888', fontSize: 13 }}>Expenses</strong>
                      {viewBill.expenses.map((e, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                          <span>{e.name}</span><span>{fmtMoney(e.cost)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 17, marginTop: 14, paddingTop: 10, borderTop: '1px solid #333' }}>
                    <span>Final Charge</span><span>{fmtMoney(viewBill.finalCharge)}</span>
                  </div>
                  {viewBill.status === 'completed' && (
                    <div style={{ marginTop: 8, fontSize: 13, color: '#888' }}>
                      <Row label="Commission" val={fmtMoney(viewBill.commission)} />
                      <Row label="Store Profit" val={fmtMoney(viewBill.storeProfit)} bold />
                    </div>
                  )}
                  {viewBill.notes && <p style={{ marginTop: 12, color: '#666', fontSize: 13, fontStyle: 'italic' }}>📝 {viewBill.notes}</p>}
                </div>
                <div className="form-buttons" style={{ marginTop: 16 }}>
                  <button className="btn-cancel" onClick={() => setViewBill(null)}>Close</button>
                  {viewBill.status === 'completed' && (
                    <button className="btn-draft" onClick={() => sendWhatsApp(viewBill)} style={{ borderColor: '#25D366', color: '#25D366' }}>📱 WhatsApp</button>
                  )}
                  <button className="btn-complete" onClick={() => printBill(viewBill, repairers)}>🖨️ Print Bill</button>
                  {currentUser.role === 'master' && <button className="btn-cancel" style={{ borderColor: '#fecaca', color: '#b91c1c' }} onClick={() => { deleteBill(viewBill.id); setViewBill(null); }}>🗑️ Delete</button>}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Action Sheet for Bills */}
        <AnimatePresence>
          {mobileActionBill && (
            <motion.div className="bill-form-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileActionBill(null)} style={{ alignItems: 'flex-end', padding: 0 }}>
              <motion.div className="bill-form" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} onClick={e => e.stopPropagation()} style={{ borderRadius: '20px 20px 0 0', padding: '24px 20px', paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, color: '#1c1c1e' }}>{mobileActionBill.id}</h3>
                    <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{mobileActionBill.customerName}</p>
                  </div>
                  <button onClick={() => setMobileActionBill(null)} style={{ background: '#f5f5f4', border: 'none', width: 32, height: 32, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18, color: '#6b7280' }}>×</button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {mobileActionBill.status === 'in-progress' && (
                    <>
                      <button style={{ ...IS, background: '#1c1c1e', color: '#fff', fontWeight: 600, padding: 14 }} onClick={() => { completeBill(mobileActionBill.id); setMobileActionBill(null); }}>✅ Mark as Complete</button>
                      <button style={{ ...IS, fontWeight: 600, padding: 14 }} onClick={() => { openEditBill(mobileActionBill); setMobileActionBill(null); }}>✏️ Edit / Add Expense</button>
                    </>
                  )}
                  {mobileActionBill.status === 'completed' && (
                    <>
                      <button style={{ ...IS, background: '#dcfce7', color: '#15803d', borderColor: '#bbf7d0', fontWeight: 600, padding: 14 }} onClick={() => { sendWhatsApp(mobileActionBill); setMobileActionBill(null); }}>📱 Send WhatsApp Invoice</button>
                      <button style={{ ...IS, background: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca', fontWeight: 600, padding: 14 }} onClick={() => { refundBill(mobileActionBill.id); setMobileActionBill(null); }}>💸 Process Refund</button>
                    </>
                  )}
                  <button style={{ ...IS, fontWeight: 600, padding: 14 }} onClick={() => { printBill(mobileActionBill, repairers); setMobileActionBill(null); }}>🖨️ Print Bill</button>
                  <button style={{ ...IS, fontWeight: 600, padding: 14 }} onClick={() => { setViewBill(mobileActionBill); setMobileActionBill(null); }}>👁️ View Details</button>
                  {currentUser.role === 'master' && <button style={{ ...IS, background: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca', fontWeight: 600, padding: 14 }} onClick={() => { deleteBill(mobileActionBill.id); setMobileActionBill(null); }}>🗑️ Delete Bill</button>}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

// ---- Mini helper components ----
const FG = ({ label, children, style }) => (
  <div className="form-group" style={style}>
    <label style={{ fontSize: 11, color: '#636366', display: 'block', marginBottom: 5, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.4px' }}>{label}</label>
    {children}
  </div>
);
const Row = ({ label, val, bold }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0', fontWeight: bold ? 700 : 400 }}>
    <span style={{ color: '#8e8e93' }}>{label}</span><span style={{ color: '#1c1c1e' }}>{val}</span>
  </div>
);

// Shared styles — light theme
const IS = {
  width: '100%', padding: '10px 12px', background: '#f5f5f4', border: '1px solid transparent',
  borderRadius: 8, color: '#1c1c1e', fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit',
  transition: 'border-color 0.15s, background 0.15s'
};
const BS = (bg, color, border = 'none', width = 'auto') => ({
  background: bg, color, border, borderRadius: 7, padding: '8px 14px', cursor: 'pointer',
  fontSize: 13, whiteSpace: 'nowrap', fontWeight: 600, width, fontFamily: 'inherit'
});

export default RepairAdminPanel;
