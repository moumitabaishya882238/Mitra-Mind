const mongoose = require('mongoose');

const LandingContactInquirySchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 180,
  },
  inquiryType: {
    type: String,
    enum: ['partnership', 'beta', 'general'],
    default: 'general',
  },
  organization: {
    type: String,
    trim: true,
    maxlength: 180,
    default: '',
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000,
  },
  sourcePage: {
    type: String,
    default: 'landing-contact',
  },
  status: {
    type: String,
    enum: ['new', 'in_review', 'resolved'],
    default: 'new',
  },
  adminNote: {
    type: String,
    trim: true,
    maxlength: 2000,
    default: '',
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
  collection: 'landing_contact_inquiries',
});

module.exports = mongoose.model('LandingContactInquiry', LandingContactInquirySchema);
