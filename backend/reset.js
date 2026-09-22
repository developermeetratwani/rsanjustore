require('dotenv').config();
const mongoose = require('mongoose');
const Bill = require('./models/Bill');
const Technician = require('./models/Technician');
const Admin = require('./models/Admin');

async function resetDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    const resBills = await Bill.deleteMany({});
    console.log(`Deleted ${resBills.deletedCount} bills.`);

    const resTechs = await Technician.deleteMany({});
    console.log(`Deleted ${resTechs.deletedCount} technicians.`);

    const resAdmins = await Admin.deleteMany({ role: { $ne: 'master' } });
    console.log(`Deleted ${resAdmins.deletedCount} non-master admins.`);

    console.log('Database reset complete.');
  } catch (err) {
    console.error('Error resetting DB:', err);
  } finally {
    process.exit(0);
  }
}

resetDB();
