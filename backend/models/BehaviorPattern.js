const mongoose = require('mongoose');

const BehaviorPatternSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        messageCount: {
            type: Number,
            default: 0,
        },
        moodCounts: {
            type: Map,
            of: Number,
            default: {},
        },
        stressTimeCounts: {
            type: Map,
            of: Number,
            default: {},
        },
        topicCounts: {
            type: Map,
            of: Number,
            default: {},
        },
        lastMoodCategory: {
            type: String,
            default: 'Unknown',
        },
        lastStressScore: {
            type: Number,
            min: 1,
            max: 10,
            default: 5,
        },
        lastUpdatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('BehaviorPattern', BehaviorPatternSchema);
