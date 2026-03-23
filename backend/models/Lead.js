const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now, index: true },
  name: {
    type: String,
    required: [true, 'Name is required'],
    maxlength: 100,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    index: true,
    maxlength: 10,
    validate: {
      validator: v => /^\d{10}$/.test(v),
      message: props => `${props.value} is not a valid 10-digit phone number!`
    }
  },
  location: { type: String, required: [true, 'Location is required'], maxlength: 200, trim: true },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    validate: {
      validator: v => /^\d{6}$/.test(v),
      message: props => `${props.value} is not a valid 6-digit pincode!`
    }
  },
  ip_address: String,
  browser: { type: String, maxlength: 500 },
  platform: { type: String, maxlength: 100 },
  screen_resolution: { type: String, maxlength: 20 },
  language: { type: String, maxlength: 20 },
  timezone: { type: String, maxlength: 100 },
  referrer: { type: String, maxlength: 500 },
  utm_source: { type: String, maxlength: 100 },
  utm_medium: { type: String, maxlength: 100 },
  utm_campaign: { type: String, maxlength: 200, index: true },
  utm_content: { type: String, maxlength: 200 },
  page_source: {
    type: String,
    enum: ['landing', 'offer'],
    required: true,
    index: true
  },
  consent: {
    type: Boolean,
    required: [true, 'Consent is required'],
    validate: {
      validator: v => v === true,
      message: 'Consent must be granted'
    }
  },
  status: {
    type: String,
    enum: ['new', 'called', 'interested', 'converted', 'not_interested'],
    default: 'new',
    index: true
  },
  notes: { type: String, default: '', maxlength: 2000 },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', leadSchema);
