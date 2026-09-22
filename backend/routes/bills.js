const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const Technician = require('../models/Technician');

// Helper to keep MongoDB Technician stats in sync with bills
async function syncTechnicianStats(repairerName) {
  if (!repairerName) return;
  try {
    const bills = await Bill.find({ repairerName, status: 'completed' });
    const jobsCompleted = bills.length;
    const totalEarnings = bills.reduce((sum, b) => sum + (Number(b.commission) || 0), 0);
    
    await Technician.findOneAndUpdate(
      { name: repairerName },
      { jobsCompleted, totalEarnings }
    );
  } catch(e) {
    console.error('Error syncing tech stats', e);
  }
}

// Get all bills
router.get('/', async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
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
router.post('/', async (req, res) => {
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
    if (newBill.repairerName) await syncTechnicianStats(newBill.repairerName);
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
router.put('/:id', async (req, res) => {
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
    
    // Sync both the old and new repairer if it changed
    if (originalRepairer && originalRepairer !== bill.repairerName) {
      await syncTechnicianStats(originalRepairer);
    }
    if (bill.repairerName) {
      await syncTechnicianStats(bill.repairerName);
    }

    res.json({ ...bill.toObject(), id: bill.billId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a bill
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isValidObjectId
      ? { $or: [{ billId: id }, { _id: id }] }
      : { billId: id };

    const deletedBill = await Bill.findOneAndDelete(query);
    if (deletedBill && deletedBill.repairerName) {
      await syncTechnicianStats(deletedBill.repairerName);
    }
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
