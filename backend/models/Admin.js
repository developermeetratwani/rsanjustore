const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['master', 'sub_admin', 'accountant'],
    default: 'sub_admin'
  }
});

module.exports = mongoose.model('Admin', AdminSchema);
