require('dotenv').config();
const mongoose = require('mongoose');
const Settings = require('./models/Settings');
const Lead = require('./models/Lead');

const MONGO_URI = process.env.MONGO_URI;
const ADMIN_SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN;

const realisticLeads = [
    { name: "Rahul Sharma", phone: "9876543210", location: "New Delhi", pincode: "110001", utm_campaign: "facebook_mens_health" },
    { name: "Amit Patel", phone: "8765432109", location: "Mumbai", pincode: "400001", utm_campaign: "instagram_story" },
    { name: "Vikram Singh", phone: "7654321098", location: "Jaipur", pincode: "302001", utm_campaign: "fb_carousel" },
    { name: "Sanjay Gupta", phone: "9988776655", location: "Lucknow", pincode: "226001", utm_campaign: "facebook_mens_health" },
    { name: "Deepak Verma", phone: "8877665544", location: "Patna", pincode: "800001", utm_campaign: "instagram_story" },
    { name: "Rajesh Kumar", phone: "7766554433", location: "Indore", pincode: "452001", utm_campaign: "fb_carousel" },
    { name: "Manoj Tiwari", phone: "9566778899", location: "Bhopal", pincode: "462001", utm_campaign: "facebook_mens_health" },
    { name: "Arun Mishra", phone: "8455667788", location: "Chandigarh", pincode: "160001", utm_campaign: "instagram_story" },
    { name: "Sunil Yadav", phone: "7344556677", location: "Ranchi", pincode: "834001", utm_campaign: "fb_carousel" },
    { name: "Vijay Singh", phone: "9233445566", location: "Dehradun", pincode: "248001", utm_campaign: "facebook_mens_health" }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    // 1. Seed Settings (Upsert)
    const defaultSettings = {
      _id: "app_settings",
      whatsapp_number: "910000000000",
      backend_url: "https://your-app.onrender.com",
      phone_display: "Support Available",
      business_name: "Hammer of Thor",
      offer_price: "999",
      original_price: "4999",
      updated_at: new Date()
    };

    await Settings.findByIdAndUpdate(
      "app_settings",
      { $set: defaultSettings },
      { upsert: true, new: true }
    );
    console.log('Settings seeded.');

    // 2. Seed Leads
    // Clear existing test leads if any (optional, but requested for testing)
    // await Lead.deleteMany({ utm_campaign: { $in: ["facebook_mens_health", "instagram_story", "fb_carousel"] } });

    const leadsToInsert = realisticLeads.map((lead, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (index * 2)); // Spread over 20 days
        return {
            ...lead,
            ip_address: `1.2.3.${index + 1}`,
            browser: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            platform: "Win32",
            screen_resolution: "1920x1080",
            language: "hi-IN",
            timezone: "Asia/Kolkata",
            referrer: "https://www.google.com",
            page_source: index % 2 === 0 ? "landing" : "offer",
            consent: true,
            status: ["new", "called", "interested", "converted", "not_interested"][index % 5],
            date: date
        };
    });

    await Lead.insertMany(leadsToInsert);
    console.log('10 leads seeded.');

    console.log(`
╔══════════════════════════════════════════════╗
║         HAMMER OF THOR — SEED COMPLETE       ║
╠══════════════════════════════════════════════╣
║ Admin Dashboard URL:                         ║
║ /admin/index.html                            ║
║ ?token=${ADMIN_SECRET_TOKEN} ║
║                                              ║
║ MongoDB: horsefiredb                         ║
║ Leads seeded: 10                             ║
║ Settings seeded: yes                         ║
║ WhatsApp: Support Available                  ║
╚══════════════════════════════════════════════╝
    `);

    mongoose.disconnect();
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
