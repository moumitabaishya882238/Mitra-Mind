const mongoose = require('mongoose');

const DailyMoodLogSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        default: 'anonymous-device',
        index: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student', // Or User depending on auth
        required: false // Temporarily false until auth is active
    },
    date: {
        type: Date,
        default: Date.now
    },
    moodCategory: {
        type: String,
        enum: ['Happy', 'Calm', 'Neutral', 'Stressed', 'Anxious', 'Sad', 'Depressed', 'Angry', 'Unknown'],
        default: 'Neutral'
    },
    stressScore: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
    },
    crisisDetected: {
        type: Boolean,
        default: false
    },
    conversationSummary: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('DailyMoodLog', DailyMoodLogSchema);
