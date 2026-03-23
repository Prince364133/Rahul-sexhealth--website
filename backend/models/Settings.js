const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: 'app_settings'
  },
  whatsapp_number: {
    type: String,
    required: true
  },
  backend_url: {
    type: String,
    required: true
  },
  phone_display: {
    type: String,
    required: true
  },
  business_name: {
    type: String,
    required: true
  },
  offer_price: {
    type: String,
    required: true
  },
  original_price: {
    type: String,
    required: true
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, { _id: false }); // Disable automatic _id, we use a fixed string

module.exports = mongoose.model('Settings', settingsSchema);
