const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const Technician = require('../models/Technician');
const { verifyToken, requireRole } = require('../middleware/auth');

// Helper to keep MongoDB Technician stats in sync with bills
async function syncTechnicianStats(repairerName) {
  if (!repairerName) return;
  try {
    const bills = await Bill.find({ repairerName, status: 'completed' });
    const jobsCompleted = bills.length;
    const totalEarnings = bills.reduce((sum, b) => sum + (Number(b.commission) || 0), 0);
    const completedJobsList = bills.map(b => ({
      billId: b.billId,
      deviceModel: b.deviceModel,
      customerName: b.customerName,
      dateCompleted: b.completedAt || b.createdAt,
      commissionEarned: Number(b.commission) || 0
    })).sort((a, b) => new Date(b.dateCompleted) - new Date(a.dateCompleted));
    
    await Technician.findOneAndUpdate(
      { name: repairerName },
      { jobsCompleted, totalEarnings, completedJobs: completedJobsList }
    );
  } catch(e) {
    console.error('Error syncing tech stats', e);
  }
}

// Get all bills — optionally narrowed to a date range (?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD)
// so the frontend's Bills-tab date filter doesn't have to pull the whole collection.
router.get('/', verifyToken, requireRole(['master', 'sub_admin', 'technician']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(`${startDate}T00:00:00`);
      if (endDate) query.createdAt.$lte = new Date(`${endDate}T23:59:59.999`);
    }

    const bills = await Bill.find(query).sort({ createdAt: -1 });
    // Always return id = billId so frontend never needs to guess _id vs billId
    const mapped = bills.map(b => ({
      ...b.toObject(),
      id: b.billId
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new bill
router.post('/', verifyToken, requireRole(['master', 'sub_admin']), async (req, res) => {
  try {
    const {
      billId, customerName, customerPhone, deviceModel, phoneColor, phonePassword,
      serviceType, repairerName, billedBy, billedByRole, recipientName,
      finalCharge, expenses, expenseTotal, commission, storeProfit, status, notes,
      custodyHistory, createdAt, completedAt, appointmentId
    } = req.body;

    // Validate 10 digits phone
    const cleanPhone = (customerPhone || '').replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ message: 'Incorrect phone number. Exactly 10 digits required.' });
    }

    const finalBillId = billId || ('RS-' + Date.now().toString().slice(-6));

    // Check for duplicate billId
    const existing = await Bill.findOne({ billId: finalBillId });
    if (existing) {
      // Already exists — return the existing record instead of erroring
      return res.status(200).json({ ...existing.toObject(), id: existing.billId });
    }

    const newBill = new Bill({
      billId: finalBillId,
      customerName,
      customerPhone: cleanPhone,
      deviceModel,
      phoneColor,
      phonePassword,
      serviceType,
      repairerName,
      billedBy: billedBy || 'master',
      billedByRole: billedByRole || 'master',
      recipientName: recipientName || billedBy || 'master',
      finalCharge: Number(finalCharge) || 0,
      expenses: expenses || [],
      expenseTotal: Number(expenseTotal) || 0,
      commission: Number(commission) || 0,
      storeProfit: Number(storeProfit) || 0,
      status: status || 'in-progress',
      notes: notes || '',
      custodyHistory: custodyHistory || [],
      createdAt: createdAt ? new Date(createdAt) : new Date(),
      completedAt: completedAt ? new Date(completedAt) : undefined,
    });

    await newBill.save();
    // Don't make the caller wait on the stats recompute — it's a side effect, not
    // part of the bill-creation result, and it re-scans that technician's bills.
    if (newBill.repairerName) syncTechnicianStats(newBill.repairerName);
    res.status(201).json({ ...newBill.toObject(), id: newBill.billId });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key — bill already saved, treat as success
      try {
        const dup = await Bill.findOne({ billId: req.body.billId });
        if (dup) return res.status(200).json({ ...dup.toObject(), id: dup.billId });
      } catch (_) {}
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a bill
router.put('/:id', verifyToken, requireRole(['master', 'sub_admin', 'technician']), async (req, res) => {
  try {
    const id = req.params.id;
    // Always prefer billId match; fallback to _id if it looks like an ObjectId
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isValidObjectId
      ? { $or: [{ billId: id }, { _id: id }] }
      : { billId: id };

    const bill = await Bill.findOne(query);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Strip frontend-only fields that shouldn't overwrite schema fields
    const { id: _id2, _id: _id3, __v, ...updateData } = req.body;
    const originalRepairer = bill.repairerName;

    Object.assign(bill, updateData);
    if (req.body.customerPhone) {
      bill.customerPhone = req.body.customerPhone.replace(/\D/g, '');
    }
    if (req.body.createdAt) bill.createdAt = new Date(req.body.createdAt);
    if (req.body.completedAt) bill.completedAt = new Date(req.body.completedAt);

    await bill.save();

    // Sync both the old and new repairer if it changed — fire-and-forget, same reasoning as create.
    if (originalRepairer && originalRepairer !== bill.repairerName) {
      syncTechnicianStats(originalRepairer);
    }
    if (bill.repairerName) {
      syncTechnicianStats(bill.repairerName);
    }

    res.json({ ...bill.toObject(), id: bill.billId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a bill
router.delete('/:id', verifyToken, requireRole(['master', 'sub_admin']), async (req, res) => {
  try {
    const id = req.params.id;
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isValidObjectId
      ? { $or: [{ billId: id }, { _id: id }] }
      : { billId: id };

    const deletedBill = await Bill.findOneAndDelete(query);
    if (deletedBill && deletedBill.repairerName) {
      syncTechnicianStats(deletedBill.repairerName);
    }
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
