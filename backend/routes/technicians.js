const express = require('express');
const router = express.Router();
const Technician = require('../models/Technician');
const { verifyToken, requireRole } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Public list of technicians for login dropdown
router.get('/list', async (req, res) => {
  try {
    const technicians = await Technician.find({}, 'name').sort({ name: 1 });
    res.json(technicians);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Technician Login
router.post('/login', async (req, res) => {
  const { name, pin } = req.body;
  try {
    const technician = await Technician.findOne({ name });
    if (!technician) return res.status(404).json({ message: 'Technician not found' });
    if (technician.pin !== pin) return res.status(401).json({ message: 'Invalid PIN' });
    
    const token = jwt.sign(
      { userId: technician._id, role: 'technician' },
      process.env.JWT_SECRET || 'rsanju_secret_key_2024',
      { expiresIn: '30d' }
    );
    
    res.json({ token, user: { name: technician.name, role: 'technician' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all technicians (Master & Sub-Admin)
router.get('/', verifyToken, requireRole(['master', 'sub_admin']), async (req, res) => {
  try {
    const technicians = await Technician.find().sort({ name: 1 });
    res.json(technicians);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a new technician (Master & Sub-Admin)
router.post('/', verifyToken, requireRole(['master', 'sub_admin']), async (req, res) => {
  const { name, compensationType, compensationValue, pin } = req.body;
  try {
    const newTechnician = new Technician({
      name,
      compensationType,
      compensationValue: Number(compensationValue) || 0,
      pin: pin || '0000',
      assignedBy: req.userId
    });
    await newTechnician.save();
    res.status(201).json(newTechnician);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a technician (Master & Sub-Admin)
router.put('/:id', verifyToken, requireRole(['master', 'sub_admin']), async (req, res) => {
  try {
    const { name, compensationType, compensationValue, pin } = req.body;
    console.log("PUT /technicians/:id", req.params.id, "body:", req.body);
    const technician = await Technician.findById(req.params.id);
    
    if (!technician) return res.status(404).json({ message: 'Technician not found' });

    if (name !== undefined) technician.name = name;
    if (compensationType !== undefined) technician.compensationType = compensationType;
    if (compensationValue !== undefined) technician.compensationValue = Number(compensationValue);
    if (pin !== undefined) {
      console.log("Updating PIN to:", pin);
      technician.pin = pin;
    }

    await technician.save();
    console.log("Saved technician:", technician.pin);
    res.json(technician);
  } catch (error) {
    console.error("PUT error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a technician (Master & Sub-Admin)
router.delete('/:id', verifyToken, requireRole(['master', 'sub_admin']), async (req, res) => {
  try {
    await Technician.findByIdAndDelete(req.params.id);
    res.json({ message: 'Technician deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
