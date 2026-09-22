const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  billId: {
    type: String,
    required: true,
    unique: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  deviceModel: {
    type: String,
    required: true
  },
  phoneColor: {
    type: String,
    default: ''
  },
  phonePassword: {
    type: String,
    default: ''
  },
  serviceType: {
    type: String,
    default: ''
  },
  repairerName: {
    type: String,
    required: true
  },
  billedBy: {
    type: String,
    default: 'master'
  },
  billedByRole: {
    type: String,
    default: 'master'
  },
  recipientName: {
    type: String,
    default: ''
  },
  finalCharge: {
    type: Number,
    default: 0
  },
  expenses: [{
    name: String,
    cost: Number
  }],
  expenseTotal: {
    type: Number,
    default: 0
  },
  commission: {
    type: Number,
    default: 0
  },
  storeProfit: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'refunded'],
    default: 'in-progress'
  },
  notes: {
    type: String,
    default: ''
  },
  custodyHistory: [{
    timestamp: { type: Date, default: Date.now },
    holder: String,
    updatedBy: String,
    notes: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Bill', BillSchema);
