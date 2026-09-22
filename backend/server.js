const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const technicianRoutes = require('./routes/technicians');
const accountantRoutes = require('./routes/accountant');
const billRoutes = require('./routes/bills');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Database connection with robust options
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/r-sanju-store';
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,  // fail fast on initial connect
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  retryWrites: true,
})
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));

// Log reconnections
mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('✅ MongoDB reconnected'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/accountant', accountantRoutes);
app.use('/api/bills', billRoutes);

// Health check endpoint — includes MongoDB state
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const stateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status: dbState === 1 ? 'ok' : 'degraded',
    db: stateMap[dbState] || 'unknown',
    message: 'Backend is running'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
