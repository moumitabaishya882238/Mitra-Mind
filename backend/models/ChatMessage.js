const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            index: true,
        },
        role: {
            type: String,
            enum: ['user', 'bot'],
            required: true,
        },
        language: {
            type: String,
            default: 'en',
        },
        text: {
            type: String,
            required: true,
        },
        moodCategory: {
            type: String,
            default: 'Unknown',
        },
        stressScore: {
            type: Number,
            min: 1,
            max: 10,
            default: 5,
        },
        distressLevel: {
            type: String,
            enum: ['low', 'moderate', 'high'],
            default: 'low',
        },
        crisisDetected: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
