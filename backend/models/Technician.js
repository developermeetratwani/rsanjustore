const mongoose = require('mongoose');

const TechnicianSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  compensationType: {
    type: String,
    enum: ['salary', 'percentage'],
    required: true
  },
  compensationValue: {
    type: Number,
    required: true
  },
  pin: {
    type: String,
    default: '0000'
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  jobsCompleted: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  completedJobs: [{
    billId: String,
    deviceModel: String,
    customerName: String,
    dateCompleted: Date,
    commissionEarned: Number
  }]
});

module.exports = mongoose.model('Technician', TechnicianSchema);
