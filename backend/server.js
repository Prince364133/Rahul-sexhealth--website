require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const leadsRouter = require('./routes/leads');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

// ===== SECURITY HEADERS =====
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limit request body size

// ===== RATE LIMITING =====
const leadsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Increased for testing and active traffic
  message: { status: 'error', message: 'Too many submissions. Please try again after 1 hour.' },
  standardHeaders: true,
  legacyHeaders: false
});

// ===== HEALTH CHECK =====
app.get('/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ status: 'ok', db: dbStatus, time: new Date().toISOString(), uptime: process.uptime() });
});

// ===== ROUTES =====
app.use('/api/leads', leadsLimiter, leadsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/settings', leadsRouter); // For /api/settings/public

// ===== DB CONNECT =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected — horsefiredb');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
