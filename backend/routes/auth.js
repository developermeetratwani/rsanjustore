const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { verifyToken, requireRole, JWT_SECRET } = require('../middleware/auth');

// Login Route for all admins
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Quick-login support for master password directly
    if (!username && (password === 'Meet250109' || password === 'Sanju1984')) {
      const master = (await Admin.findOne({ role: 'master' })) || { _id: 'master-admin', role: 'master', username: 'master' };
      const token = jwt.sign(
        { id: master._id, role: 'master', username: master.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.json({
        success: true,
        role: 'master',
        username: master.username,
        token
      });
    }

    // Normal credential lookup
    const admin = await Admin.findOne({ username, password });
    
    if (!admin) {
      // Check if trying to log into master account with master override password
      if (username === 'master' && (password === 'Meet250109' || password === 'Sanju1984')) {
        const masterAdmin = await Admin.findOne({ username: 'master' });
        if (masterAdmin) {
          const token = jwt.sign(
            { id: masterAdmin._id, role: masterAdmin.role, username: masterAdmin.username },
            JWT_SECRET,
            { expiresIn: '24h' }
          );
          return res.json({
            success: true,
            role: masterAdmin.role,
            username: masterAdmin.username,
            token
          });
        }
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role, username: admin.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      role: admin.role,
      username: admin.username,
      token: token
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all staff users (for Master Admin and dropdown selection)
router.get('/users', verifyToken, async (req, res) => {
  try {
    const users = await Admin.find({}, '-password').sort({ role: 1, username: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update an admin's role (Master Admin only)
router.put('/users/:id/role', verifyToken, requireRole(['master']), async (req, res) => {
  const { role } = req.body;
  if (!['sub_admin', 'accountant', 'master'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified' });
  }

  try {
    const user = await Admin.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = role;
    await user.save();
    res.json({ message: 'Role updated successfully', user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete an admin (Master Admin only)
router.delete('/users/:id', verifyToken, requireRole(['master']), async (req, res) => {
  try {
    const user = await Admin.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'master' && user.username === 'master') {
      return res.status(400).json({ message: 'Cannot delete primary master admin' });
    }
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create Admin (Master Admin only)
router.post('/create', verifyToken, requireRole(['master']), async (req, res) => {
  const { username, password, role } = req.body;

  if (!['sub_admin', 'accountant', 'master'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified' });
  }

  try {
    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const newAdmin = new Admin({ username, password, role });
    await newAdmin.save();

    res.status(201).json({ message: `${role} created successfully`, username: newAdmin.username, id: newAdmin._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


