const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const Technician = require('../models/Technician');

// Example endpoint for accountant to view financial metrics
router.get('/metrics', verifyToken, requireRole(['accountant', 'master']), async (req, res) => {
  try {
    // In a real application, you would aggregate data from Bills, Payments, etc.
    // For now, we will aggregate technician earnings as an example.
    
    const technicians = await Technician.find({});
    
    const totalCommissionsPaid = technicians.reduce((acc, tech) => {
      // Simplistic calculation: If percentage, calculate based on jobs completed (assuming a base value per job for demo)
      // Real app would sum up actual bill commissions.
      return acc + (tech.compensationType === 'salary' ? tech.compensationValue : (tech.jobsCompleted * (tech.compensationValue/100) * 100)); // assuming 100 is base job price
    }, 0);

    res.json({
      totalRevenue: 50000, // Placeholder
      totalCommissionsPaid,
      netProfit: 50000 - totalCommissionsPaid,
      activeTechnicians: technicians.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
