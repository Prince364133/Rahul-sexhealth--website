require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

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
app.use(express.json({ limit: '10kb' })); 

// ===== STATIC FILES (Serve Frontend) =====
// Deny access to the backend folder when served statically
app.use('/backend', (req, res, next) => {
  res.status(403).send('Access Denied');
});

// Serve everything else from the root
app.use(express.static(path.join(__dirname, '..'), {
  index: 'index.html',
  extensions: ['html']
}));

// ===== HEALTH CHECK =====
app.get('/health', async (req, res) => {
  res.json({ status: 'ok', message: 'Pureveda Server Running', time: new Date().toISOString(), uptime: process.uptime() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Pureveda Static Server running on port ${PORT}`);
  console.log(`📡 MongoDB has been removed as per user request.`);
});

module.exports = app;
