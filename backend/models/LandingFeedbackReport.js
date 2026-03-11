const mongoose = require('mongoose');

const LandingFeedbackReportSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['android', 'ios', 'web', 'unknown'],
    default: 'unknown',
  },
  feedbackType: {
    type: String,
    enum: ['bug', 'feature', 'ai', 'other'],
    default: 'other',
  },
  details: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000,
  },
  reporterEmail: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 180,
    default: '',
  },
  sourcePage: {
    type: String,
    default: 'landing-feedback',
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
  collection: 'landing_feedback_reports',
});

module.exports = mongoose.model('LandingFeedbackReport', LandingFeedbackReportSchema);
