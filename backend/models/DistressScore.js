const mongoose = require('mongoose');

const DistressScoreSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            index: true,
        },
        score: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        tier: {
            type: String,
            enum: ['low', 'medium', 'high'],
            required: true,
        },
        factors: {
            negativeSentimentHits: { type: Number, default: 0 },
            lowMoodLogHits: { type: Number, default: 0 },
            repeatedStressPostHits: { type: Number, default: 0 },
            activityBehaviorHits: { type: Number, default: 0 },
        },
        recommendation: {
            primaryAction: { type: String, default: '' },
            supportLevel: { type: Number, min: 1, max: 4, default: 1 },
            actions: { type: [String], default: [] },
        },
    },
    {
        timestamps: true,
    }
);

DistressScoreSchema.index({ sessionId: 1, createdAt: -1 });

module.exports = mongoose.model('DistressScore', DistressScoreSchema);
