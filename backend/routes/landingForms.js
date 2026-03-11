const express = require('express');

const LandingContactInquiry = require('../models/LandingContactInquiry');
const LandingFeedbackReport = require('../models/LandingFeedbackReport');
const { requireAdmin } = require('../middleware/adminAuth');

const router = express.Router();

function normalizeContactPayload(body = {}) {
  return {
    fullName: String(body.fullName || body.name || '').trim(),
    email: String(body.email || '').trim().toLowerCase(),
    inquiryType: String(body.inquiryType || body.interest || 'general').trim().toLowerCase(),
    organization: String(body.organization || '').trim(),
    message: String(body.message || '').trim(),
    sourcePage: 'landing-contact',
  };
}

function normalizeFeedbackPayload(body = {}) {
  return {
    platform: String(body.platform || 'unknown').trim().toLowerCase(),
    feedbackType: String(body.feedbackType || body.type || 'other').trim().toLowerCase(),
    details: String(body.details || body.feedbackDetails || body.message || '').trim(),
    reporterEmail: String(body.reporterEmail || body.email || '').trim().toLowerCase(),
    sourcePage: 'landing-feedback',
  };
}

router.post('/forms/landing-contact-inquiries', async (req, res) => {
  try {
    const payload = normalizeContactPayload(req.body);

    if (!payload.fullName || !payload.email || !payload.message) {
      return res.status(400).json({
        success: false,
        message: 'fullName, email, and message are required.',
      });
    }

    const created = await LandingContactInquiry.create(payload);

    return res.status(201).json({
      success: true,
      message: 'Landing contact inquiry submitted.',
      data: {
        id: created._id,
        status: created.status,
        createdAt: created.createdAt,
      },
    });
  } catch (error) {
    console.error('Landing contact inquiry submit error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to submit landing contact inquiry right now.',
    });
  }
});

router.post('/forms/landing-feedback-reports', async (req, res) => {
  try {
    const payload = normalizeFeedbackPayload(req.body);

    if (!payload.details) {
      return res.status(400).json({
        success: false,
        message: 'details are required for landing feedback report.',
      });
    }

    const created = await LandingFeedbackReport.create(payload);

    return res.status(201).json({
      success: true,
      message: 'Landing feedback report submitted.',
      data: {
        id: created._id,
        status: created.status,
        createdAt: created.createdAt,
      },
    });
  } catch (error) {
    console.error('Landing feedback report submit error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to submit landing feedback report right now.',
    });
  }
});

router.get('/admin/landing-contact-inquiries', requireAdmin, async (req, res) => {
  try {
    const items = await LandingContactInquiry.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: items });
  } catch (error) {
    console.error('Landing contact inquiry list error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load landing contact inquiries.' });
  }
});

router.get('/admin/landing-feedback-reports', requireAdmin, async (req, res) => {
  try {
    const items = await LandingFeedbackReport.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: items });
  } catch (error) {
    console.error('Landing feedback report list error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load landing feedback reports.' });
  }
});

router.patch('/admin/landing-contact-inquiries/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const update = {
      status,
      adminNote: String(adminNote || '').trim(),
      resolvedAt: status === 'resolved' ? new Date() : null,
    };

    const updated = await LandingContactInquiry.findByIdAndUpdate(req.params.id, update, { new: true }).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Landing contact inquiry not found.' });
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Landing contact inquiry status update error:', error);
    return res.status(500).json({ success: false, message: 'Unable to update landing contact inquiry.' });
  }
});

router.patch('/admin/landing-feedback-reports/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const update = {
      status,
      adminNote: String(adminNote || '').trim(),
      resolvedAt: status === 'resolved' ? new Date() : null,
    };

    const updated = await LandingFeedbackReport.findByIdAndUpdate(req.params.id, update, { new: true }).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Landing feedback report not found.' });
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Landing feedback report status update error:', error);
    return res.status(500).json({ success: false, message: 'Unable to update landing feedback report.' });
  }
});

module.exports = router;
