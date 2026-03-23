const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const Settings = require('../models/Settings');

// Helper: sanitize string input
function sanitize(val, maxlen = 200) {
  if (typeof val !== 'string') return '';
  return val.trim().replace(/<[^>]*>/g, '').slice(0, maxlen);
}

// GET /api/settings/public — no auth
router.get('/public', async (req, res) => {
  try {
    const settings = await Settings.findById('app_settings');
    if (!settings) return res.status(404).json({ status: 'error', message: 'Settings not found' });
    res.json({
      whatsapp_number: settings.whatsapp_number,
      phone_display: settings.phone_display,
      backend_url: settings.backend_url,
      business_name: settings.business_name,
      offer_price: settings.offer_price,
      original_price: settings.original_price
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// POST /api/leads — public lead submission
router.post('/', async (req, res) => {
  try {
    const body = req.body;

    // Sanitized required fields
    const name      = sanitize(body.name, 100);
    const phone     = sanitize(body.phone, 10).replace(/\D/g, '');
    const location  = sanitize(body.location, 200);
    const pincode   = sanitize(body.pincode, 6).replace(/\D/g, '');
    const page_source = body.page_source;
    const consent   = body.consent;

    if (!name || name.length < 2)          return res.status(400).json({ status: 'error', message: 'Valid name is required' });
    if (!/^[6-9]\d{9}$/.test(phone))       return res.status(400).json({ status: 'error', message: 'Valid 10-digit phone is required' });
    if (!location || location.length < 2)  return res.status(400).json({ status: 'error', message: 'Location is required' });
    if (!/^\d{6}$/.test(pincode))          return res.status(400).json({ status: 'error', message: 'Valid 6-digit pincode is required' });
    if (!['landing', 'offer'].includes(page_source) && !page_source.startsWith('checkout')) {
      return res.status(400).json({ status: 'error', message: 'Invalid page_source' });
    }
    if (consent !== true)                  return res.status(400).json({ status: 'error', message: 'Consent is required' });

    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

    const newLead = new Lead({
      name, phone, location, pincode,
      ip_address: ip,
      browser:           sanitize(body.browser, 500),
      platform:          sanitize(body.platform, 100),
      screen_resolution: sanitize(body.screen_resolution, 20),
      language:          sanitize(body.language, 20),
      timezone:          sanitize(body.timezone, 100),
      referrer:          sanitize(body.referrer, 500),
      utm_source:        sanitize(body.utm_source, 100),
      utm_medium:        sanitize(body.utm_medium, 100),
      utm_campaign:      sanitize(body.utm_campaign, 200),
      utm_content:       sanitize(body.utm_content, 200),
      page_source,
      consent: true
    });

    await newLead.save();

    // Audit log
    console.log(`[LEAD] name=${name} phone=${phone} location=${location} source=${page_source} campaign=${body.utm_campaign || '-'} ip=${ip}`);

    res.status(201).json({ status: 'success', message: 'Lead saved successfully' });
  } catch (error) {
    console.error('Lead save error:', error);
    if (error.name === 'ValidationError') {
      const msgs = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ status: 'error', message: msgs.join(', ') });
    }
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

module.exports = router;
