const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');
const XLSX = require('xlsx');

// Apply auth middleware to all admin routes
router.use(auth);

// --- SETTINGS ENDPOINTS ---

// GET /api/admin/settings - Fetch all settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await Settings.findById('app_settings');
    if (!settings) {
      return res.status(404).json({ status: 'error', message: 'Settings not found' });
    }
    res.json({ status: 'success', data: settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

// PATCH /api/admin/settings - Update settings
router.patch('/settings', async (req, res) => {
  try {
    const updateData = req.body;
    updateData.updated_at = new Date();

    const updatedSettings = await Settings.findByIdAndUpdate(
      'app_settings',
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({ status: 'success', data: updatedSettings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

// --- LEADS ENDPOINTS ---

// GET /api/admin/leads - Fetch leads with pagination and filters
router.get('/leads', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      status,
      search,
      startDate,
      endDate
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const totalLeads = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      status: 'success',
      data: leads,
      pagination: {
        total: totalLeads,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalLeads / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

// PATCH /api/admin/leads/:id - Update status/notes
router.patch('/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const update = {};
    if (status) update.status = status;
    if (notes !== undefined) update.notes = notes;

    const updatedLead = await Lead.findByIdAndUpdate(id, update, { new: true });

    if (!updatedLead) {
      return res.status(404).json({ status: 'error', message: 'Lead not found' });
    }

    res.json({ status: 'success', data: updatedLead });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

// GET /api/admin/leads/export - Export leads to Excel
router.get('/leads/export', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ date: -1 }).lean();
    const data = leads.map(lead => ({
      Date: lead.date.toLocaleString(),
      Name: lead.name,
      Phone: lead.phone,
      Location: lead.location,
      Pincode: lead.pincode,
      Status: lead.status,
      Source: lead.page_source,
      UTM_Campaign: lead.utm_campaign || '',
      Notes: lead.notes || ''
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const dateStr = new Date().toISOString().split('T')[0];

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=leads_export_${dateStr}.xlsx`);
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting leads:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

// GET /api/admin/stats - Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisWeek = new Date(today);
    thisWeek.setDate(today.getDate() - today.getDay());
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      total,
      todayCount,
      weekCount,
      monthCount,
      statusBreakdown,
      campaignBreakdown
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ date: { $gte: today } }),
      Lead.countDocuments({ date: { $gte: thisWeek } }),
      Lead.countDocuments({ date: { $gte: thisMonth } }),
      Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.aggregate([{ $group: { _id: '$utm_campaign', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }])
    ]);

    res.json({
      status: 'success',
      data: {
        total,
        today: todayCount,
        week: weekCount,
        month: monthCount,
        statusBreakdown,
        campaignBreakdown
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

module.exports = router;
