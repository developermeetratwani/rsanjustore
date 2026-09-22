const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('./models/Admin');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/r-sanju-store';

async function seedMasterAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const existingMaster = await Admin.findOne({ role: 'master' });
    if (existingMaster) {
      console.log('Master admin already exists:', existingMaster.username);
      process.exit(0);
    }

    const newMaster = new Admin({
      username: 'Sanju',
      password: 'Sanju1984',
      role: 'master'
    });

    await newMaster.save();
    console.log('Successfully created initial Master Admin (username: Sanju, password: Sanju1984)');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding master admin:', error);
    process.exit(1);
  }
}

seedMasterAdmin();
