const express = require('express');

const ChatMessage = require('../models/ChatMessage');
const DailyMoodLog = require('../models/DailyMoodLog');
const Post = require('../models/Post');
const BehaviorPattern = require('../models/BehaviorPattern');
const DistressScore = require('../models/DistressScore');

const router = express.Router();

const NEGATIVE_MARKERS = [
    'sad',
    'anxious',
    'stressed',
    'depressed',
    'hopeless',
    'panic',
    'angry',
    'alone',
    'worthless',
    'crying',
    'suicide',
    'self-harm',
    'die',
];

function countNegativeMarkers(text = '') {
    const value = String(text || '').toLowerCase();
    return NEGATIVE_MARKERS.reduce((sum, marker) => (value.includes(marker) ? sum + 1 : sum), 0);
}

function buildRecommendation(tier) {
    if (tier === 'high') {
        return {
            primaryAction: 'Connect with verified listener or helpline now',
            supportLevel: 4,
            actions: [
                'Open verified listener network and start a real-time chat.',
                'Use emergency helplines if you feel unsafe.',
                'Keep AI companion open while waiting for human support.',
            ],
        };
    }

    if (tier === 'medium') {
        return {
            primaryAction: 'Talk to AI companion for guided emotional support',
            supportLevel: 2,
            actions: [
                'Start an AI companion chat for grounding and journaling prompts.',
                'Try one 10-minute MindSpace activity after chat.',
                'Switch to a verified listener if symptoms intensify.',
            ],
        };
    }

    return {
        primaryAction: 'Try MindSpace activity to maintain emotional balance',
        supportLevel: 1,
        actions: [
            'Start a breathing or gratitude session in MindSpace.',
            'Track mood to keep your support plan personalized.',
            'Use AI companion if stress rises later today.',
        ],
    };
}

async function calculateDistressScore(sessionId) {
    const sevenDaysAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));

    const [userMessages, moodLogs, posts, behavior] = await Promise.all([
        ChatMessage.find({ sessionId, role: 'user', createdAt: { $gte: sevenDaysAgo } }).lean(),
        DailyMoodLog.find({ sessionId, date: { $gte: sevenDaysAgo } }).lean(),
        Post.find({ userId: sessionId, createdAt: { $gte: sevenDaysAgo } }).lean(),
        BehaviorPattern.findOne({ sessionId }).lean(),
    ]);

    const negativeSentimentHits = userMessages.reduce((sum, msg) => {
        return sum + (countNegativeMarkers(msg.text) > 0 || msg.distressLevel === 'high' ? 1 : 0);
    }, 0);

    const lowMoodLogHits = moodLogs.reduce((sum, log) => {
        return sum + (['Stressed', 'Anxious', 'Sad', 'Depressed', 'Angry'].includes(log.moodCategory) ? 1 : 0);
    }, 0);

    const repeatedStressPostHits = posts.reduce((sum, post) => {
        const lowered = String(post.message || '').toLowerCase();
        return sum + (countNegativeMarkers(lowered) > 0 ? 1 : 0);
    }, 0);

    const activityBehaviorHits = behavior && Number(behavior.lastStressScore) >= 7 ? 1 : 0;

    // Weighted scoring based on the requested examples.
    const rawScore =
        Math.min(40, negativeSentimentHits * 20) +
        Math.min(30, repeatedStressPostHits * 15) +
        Math.min(20, lowMoodLogHits * 10) +
        (activityBehaviorHits ? 10 : 0);

    const score = Math.max(0, Math.min(100, rawScore));
    const tier = score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';

    return {
        score,
        tier,
        factors: {
            negativeSentimentHits,
            lowMoodLogHits,
            repeatedStressPostHits,
            activityBehaviorHits,
        },
    };
}

router.get('/recommendation', async (req, res) => {
    const sessionId = req.query.sessionId || 'anonymous-device';

    try {
        const { score, tier, factors } = await calculateDistressScore(sessionId);
        const recommendation = buildRecommendation(tier);

        const saved = await DistressScore.create({
            sessionId,
            score,
            tier,
            factors,
            recommendation,
        });

        return res.json({
            sessionId,
            distressScore: score,
            tier,
            factors,
            recommendation,
            savedAt: saved.createdAt,
            supportEcosystem: [
                { level: 1, label: 'AI Companion' },
                { level: 2, label: 'Community Support' },
                { level: 3, label: 'Verified Listener Network' },
                { level: 4, label: 'Professional Help / Helplines' },
            ],
        });
    } catch (error) {
        console.error('Support recommendation error:', error);
        return res.status(500).json({ error: 'Failed to calculate support recommendation' });
    }
});

module.exports = router;
