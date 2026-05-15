require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

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

// ===== ALTCHA CAPTCHA =====
app.get('/api/captcha-challenge', (req, res) => {
  const hmacKey = process.env.ALTCHA_HMAC_KEY || 'default_secret';
  const salt = crypto.randomBytes(12).toString('hex');
  const number = Math.floor(Math.random() * 10000); // Low difficulty for "one-click" feel
  const algorithm = 'sha-256';
  
  const challenge = crypto.createHash('sha256').update(salt + number).digest('hex');
  const signature = crypto.createHmac('sha256', hmacKey).update(challenge).digest('hex');
  
  res.json({
    algorithm,
    challenge,
    salt,
    signature,
    maxnumber: 10000
  });
});

app.post('/api/captcha-verify', (req, res) => {
  const { payload } = req.body;
  if (!payload) return res.status(400).json({ error: 'Missing payload' });

  try {
    const hmacKey = process.env.ALTCHA_HMAC_KEY || 'default_secret';
    const jsonPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
    const { algorithm, challenge, number, salt, signature } = jsonPayload;

    // Verify signature
    const expectedSignature = crypto.createHmac('sha256', hmacKey).update(challenge).digest('hex');
    if (signature !== expectedSignature) return res.json({ success: false, error: 'Invalid signature' });

    // Verify challenge
    const expectedChallenge = crypto.createHash('sha256').update(salt + number).digest('hex');
    if (challenge !== expectedChallenge) return res.json({ success: false, error: 'Invalid challenge' });

    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, error: 'Invalid payload format' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Pureveda Static Server running on port ${PORT}`);
  console.log(`📡 MongoDB has been removed as per user request.`);
});

module.exports = app;
