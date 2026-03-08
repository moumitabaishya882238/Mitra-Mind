const express = require('express');
const router = express.Router();
const { generateCompanionResponse, analyzeEmotionAndExtractData } = require('../services/geminiService');
const DailyMoodLog = require('../models/DailyMoodLog');
const ChatMessage = require('../models/ChatMessage');
const BehaviorPattern = require('../models/BehaviorPattern');

const HELPLINES = [
    { name: 'India - Tele MANAS', phone: '14416 / 1-800-891-4416', site: 'https://telemanas.mohfw.gov.in' },
    { name: 'USA & Canada - 988 Lifeline', phone: 'Call or text 988', site: 'https://988lifeline.org' },
    { name: 'UK & ROI - Samaritans', phone: '116 123', site: 'https://www.samaritans.org' },
    { name: 'Global hotline directory', phone: 'Varies by country', site: 'https://findahelpline.com' },
];

const POSITIVE_WORDS = [
    'okay', 'calm', 'better', 'hopeful', 'happy', 'good', 'relaxed', 'fine', 'grateful', 'peaceful',
    'bien', 'tranquilo', 'feliz', 'mejor', 'shant', 'achha', 'behtar', 'khush',
    'shant', 'accha', 'theek', 'शांत', 'अच्छा', 'बेहतर', 'खुश',
];

const NEGATIVE_WORDS = [
    'sad', 'anxious', 'stressed', 'depressed', 'hopeless', 'lonely', 'tired', 'panic', 'worthless', 'angry',
    'triste', 'ansioso', 'estresado', 'solo', 'cansado', 'nirash', 'udas', 'tanav', 'akela', 'bekar',
    'pareshan', 'thaka', 'निराश', 'उदास', 'तनाव', 'अकेला',
];

const CRISIS_WORDS = [
    'suicide', 'kill myself', 'end my life', 'self-harm', 'die', "can't go on", 'want to disappear',
    'me quiero morir', 'suicidio', 'autolesion',
    'marna chahta', 'aatmahatya', 'khud ko nuksan', 'मरना चाहता', 'आत्महत्या', 'खुद को नुकसान',
];

const TOPIC_KEYWORDS = {
    exams: ['exam', 'exams', 'test', 'quiz', 'midterm', 'final', 'marks', 'grade', 'study'],
    assignments: ['assignment', 'deadline', 'project', 'submission', 'homework', 'lab'],
    relationships: ['friend', 'friends', 'boyfriend', 'girlfriend', 'partner', 'breakup', 'family', 'parents'],
    sleep: ['sleep', 'insomnia', 'awake', 'tired', 'night', 'rest'],
    career: ['internship', 'job', 'placement', 'career', 'interview', 'resume'],
    finances: ['money', 'fees', 'rent', 'bills', 'financial', 'debt'],
    health: ['health', 'sick', 'headache', 'pain', 'panic', 'anxiety', 'therapy', 'counseling'],
};

function tokenize(text = '') {
    return text
        .toLowerCase()
    .replace(/[^\p{L}\s]/gu, ' ')
        .split(/\s+/)
        .filter(Boolean);
}

function containsPhrase(text = '', phrases = []) {
    const lower = text.toLowerCase();
    return phrases.some((phrase) => lower.includes(phrase));
}

function normalizeMoodCategory(mood = '') {
    const value = String(mood || '').toLowerCase();
    if (value.includes('happy')) return 'Happy';
    if (value.includes('calm')) return 'Calm';
    if (value.includes('neutral')) return 'Neutral';
    if (value.includes('stress')) return 'Stressed';
    if (value.includes('anx')) return 'Anxious';
    if (value.includes('sad')) return 'Sad';
    if (value.includes('depress')) return 'Depressed';
    if (value.includes('angry')) return 'Angry';
    return 'Unknown';
}

function analyzeEmotionRuleBased(text = '') {
    const tokens = tokenize(text);
    let score = 0;

    for (const token of tokens) {
        if (POSITIVE_WORDS.includes(token)) score += 1;
        if (NEGATIVE_WORDS.includes(token)) score -= 1;
    }

    const crisis = containsPhrase(text, CRISIS_WORDS);
    const distress = score <= -2 ? 'high' : score < 0 ? 'moderate' : 'low';
    return { score, distress, crisis };
}

function copingStrategies(analysis) {
    const base = [
        'Try a 4-7-8 breathing cycle for 2 minutes.',
        'Name 5 things you can see, 4 you can feel, 3 you can hear (grounding).',
        'Write one self-compassion sentence you would tell a friend.',
        'Break your next task into a 10-minute starter step.',
    ];

    if (analysis.distress === 'high') {
        return [
            'Pause and place your hand on your chest; breathe slowly for 10 cycles.',
            'Text or call one trusted person and share exactly one feeling.',
            'Reduce overload: drink water, stand, and take a 5-minute walk.',
            ...base,
        ];
    }

    if (analysis.distress === 'moderate') {
        return [
            'Use a thought record: situation -> thought -> evidence -> balanced thought.',
            'Set a 15-minute focus timer, then take a stretch break.',
            ...base,
        ];
    }

    return [
        'Keep a short gratitude note: three things that went okay today.',
        'Protect sleep: avoid screens 30 minutes before bed.',
        ...base,
    ];
}

function moodEmoji(mood) {
    const value = String(mood || '').toLowerCase();
    if (value.includes('happy') || value.includes('calm')) return '🙂';
    if (value.includes('neutral')) return '😐';
    if (value.includes('stress') || value.includes('anx') || value.includes('angry')) return '😟';
    if (value.includes('sad') || value.includes('depress')) return '😔';
    return '😐';
}

function getTimeBucket(date = new Date()) {
    const hour = date.getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
}

function incrementMapValue(mapObj, key, amount = 1) {
    const current = Number(mapObj.get(key) || 0);
    mapObj.set(key, current + amount);
}

function extractFrequentTopics(message = '') {
    const lower = String(message).toLowerCase();
    const topics = [];

    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
        if (keywords.some((kw) => lower.includes(kw))) {
            topics.push(topic);
        }
    }

    if (!topics.length) {
        topics.push('general');
    }

    return topics;
}

function topEntriesFromMap(mapObj, limit = 3) {
    return Array.from(mapObj.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([key, count]) => ({ key, count }));
}

async function updateBehaviorPattern({ sessionId, moodCategory, stressScore, message }) {
    let pattern = await BehaviorPattern.findOne({ sessionId });
    if (!pattern) {
        pattern = new BehaviorPattern({ sessionId });
    }

    pattern.messageCount += 1;
    pattern.lastMoodCategory = moodCategory;
    pattern.lastStressScore = stressScore;
    pattern.lastUpdatedAt = new Date();

    incrementMapValue(pattern.moodCounts, moodCategory, 1);

    const timeBucket = getTimeBucket(pattern.lastUpdatedAt);
    if (stressScore >= 6) {
        incrementMapValue(pattern.stressTimeCounts, timeBucket, 1);
    }

    const topics = extractFrequentTopics(message);
    topics.forEach((topic) => incrementMapValue(pattern.topicCounts, topic, 1));

    await pattern.save();
    return pattern;
}

function buildBehaviorSummary(patternDoc) {
    if (!patternDoc) {
        return {
            topMoods: [],
            stressPeakTime: null,
            frequentTopics: [],
            narrative: '',
        };
    }

    const topMoods = topEntriesFromMap(patternDoc.moodCounts, 2);
    const stressTimes = topEntriesFromMap(patternDoc.stressTimeCounts, 1);
    const frequentTopics = topEntriesFromMap(patternDoc.topicCounts, 3);

    const narrativeParts = [];
    if (topMoods[0]) {
        narrativeParts.push(`Most common recent mood: ${topMoods[0].key}`);
    }
    if (stressTimes[0]) {
        narrativeParts.push(`Stress often appears during ${stressTimes[0].key}`);
    }
    if (frequentTopics[0]) {
        narrativeParts.push(`Frequent topic: ${frequentTopics[0].key}`);
    }

    return {
        topMoods,
        stressPeakTime: stressTimes[0]?.key || null,
        frequentTopics,
        narrative: narrativeParts.join('. '),
    };
}

// @route   POST /ai/analyze-emotion
// @desc    Analyze student's text for emotional state, stress score, and crisis keywords
router.post('/analyze-emotion', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message text is required' });
    }

    try {
        const analysis = await analyzeEmotionAndExtractData(message, req.body.language || 'en');
        res.json({ analysis });
    } catch (error) {
        console.error("Emotion analysis error:", error);
        res.status(500).json({ error: 'Failed to analyze emotion' });
    }
});

// @route   POST /ai/generate-response
// @desc    Generate a response as Mitra the AI companion
router.post('/generate-response', async (req, res) => {
    const { message, emotionContext } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message text is required' });
    }

    try {
        const reply = await generateCompanionResponse(message, emotionContext || {}, req.body.language || 'en');
        res.json({ reply });
    } catch (error) {
        console.error("Response generation error:", error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});

// @route   POST /ai/detect-crisis
// @desc    Evaluate if a message triggered a severe crisis
router.post('/detect-crisis', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message text is required' });
    }

    try {
        // Here we could use a specific prompt or rule-based engine
        const analysis = await analyzeEmotionAndExtractData(message, req.body.language || 'en');
        const isCrisis = analysis.crisis_detected === true || analysis.stress_score >= 9;

        res.json({
            isCrisis,
            action: isCrisis ? "escalate" : "monitor",
            suggestedResources: isCrisis ? ["National Suicide Prevention Lifeline: 988", "Campus counseling center: (555) 123-4567"] : []
        });
    } catch (error) {
        console.error("Crisis detection error:", error);
        res.status(500).json({ error: 'Failed to evaluate crisis state' });
    }
});

// @route   POST /ai/chat
// @desc    End-to-end chat: analyze + respond + persist
router.post('/chat', async (req, res) => {
    const { message, language = 'en', sessionId = 'anonymous-device' } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message text is required' });
    }

    try {
        const contextMessages = await ChatMessage.find({ sessionId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('role text')
            .lean();

        const conversationHistory = contextMessages
            .reverse()
            .map((item) => ({
                role: item.role,
                text: item.text,
            }));

        const heuristic = analyzeEmotionRuleBased(message);
        const extracted = await analyzeEmotionAndExtractData(message, language);

        const moodCategory = normalizeMoodCategory(extracted.mood_category);
        const stressScore = Number.isFinite(extracted.stress_score)
            ? Math.max(1, Math.min(10, Number(extracted.stress_score)))
            : heuristic.distress === 'high'
                ? 8
                : heuristic.distress === 'moderate'
                    ? 6
                    : 4;

        const distress = stressScore >= 8 ? 'high' : stressScore >= 6 ? 'moderate' : 'low';
        const crisisDetected = Boolean(extracted.crisis_detected) || heuristic.crisis;

        const emotionContext = {
            mood_category: moodCategory,
            stress_score: stressScore,
            distress,
            crisis_detected: crisisDetected,
            sentiment_score: heuristic.score,
        };

        const updatedPattern = await updateBehaviorPattern({
            sessionId,
            moodCategory,
            stressScore,
            message,
        });

        const behaviorSummary = buildBehaviorSummary(updatedPattern);

        const reply = await generateCompanionResponse(
            message,
            emotionContext,
            language,
            conversationHistory,
            behaviorSummary
        );

        await ChatMessage.insertMany([
            {
                sessionId,
                role: 'user',
                language,
                text: message,
                moodCategory,
                stressScore,
                distressLevel: distress,
                crisisDetected,
            },
            {
                sessionId,
                role: 'bot',
                language,
                text: reply,
                moodCategory,
                stressScore,
                distressLevel: distress,
                crisisDetected,
            },
        ]);

        await DailyMoodLog.create({
            sessionId,
            moodCategory,
            stressScore,
            crisisDetected,
            conversationSummary: message.slice(0, 400),
        });

        res.json({
            reply,
            analysis: {
                moodCategory,
                stressScore,
                distress,
                crisisDetected,
                sentimentScore: heuristic.score,
                emoji: moodEmoji(moodCategory),
            },
            copingStrategies: copingStrategies({ distress }),
            behaviorPatterns: behaviorSummary,
            helplines: HELPLINES,
        });
    } catch (error) {
        console.error('Chat pipeline error:', error);
        res.status(500).json({ error: 'Failed to process chat message' });
    }
});

// @route   GET /ai/dashboard-insights
// @desc    Get persisted mood trend and recent interaction insights
router.get('/dashboard-insights', async (req, res) => {
    const sessionId = req.query.sessionId || 'anonymous-device';

    try {
        const moodEntries = await DailyMoodLog.find({ sessionId })
            .sort({ date: -1 })
            .limit(14)
            .lean();

        const recentMessages = await ChatMessage.find({ sessionId, role: 'user' })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        const behaviorPattern = await BehaviorPattern.findOne({ sessionId }).lean();

        const latestMood = moodEntries[0] || null;
        const trend = moodEntries
            .slice()
            .reverse()
            .map((entry) => ({
                stressScore: entry.stressScore,
                score: 10 - entry.stressScore,
                moodCategory: entry.moodCategory,
                date: entry.date,
            }));

        const avgStress = moodEntries.length
            ? moodEntries.reduce((sum, entry) => sum + entry.stressScore, 0) / moodEntries.length
            : 5;

        const latestDistress = avgStress >= 8 ? 'high' : avgStress >= 6 ? 'moderate' : 'low';

        res.json({
            latest: latestMood
                ? {
                    moodCategory: latestMood.moodCategory,
                    stressScore: latestMood.stressScore,
                    crisisDetected: latestMood.crisisDetected,
                    emoji: moodEmoji(latestMood.moodCategory),
                }
                : {
                    moodCategory: 'Neutral',
                    stressScore: 5,
                    crisisDetected: false,
                    emoji: '😐',
                },
            trend,
            summary: {
                entryCount: moodEntries.length,
                averageStress: Number(avgStress.toFixed(2)),
            },
            copingStrategies: copingStrategies({ distress: latestDistress }),
            recentInteractions: recentMessages.map((item) => ({
                text: item.text,
                createdAt: item.createdAt,
            })),
            behaviorPatterns: buildBehaviorSummary(behaviorPattern),
            helplines: HELPLINES,
        });
    } catch (error) {
        console.error('Dashboard insights error:', error);
        res.status(500).json({ error: 'Failed to load dashboard insights' });
    }
});

// @route   POST /ai/log-session-mood
// @desc    Persist mood result from guided MindSpace sessions
router.post('/log-session-mood', async (req, res) => {
    const {
        sessionId = 'anonymous-device',
        moodCategory = 'Neutral',
        stressScore = 5,
        crisisDetected = false,
        conversationSummary = '',
    } = req.body || {};

    try {
        const normalizedMood = normalizeMoodCategory(moodCategory);
        const clampedStress = Math.max(1, Math.min(10, Number(stressScore) || 5));

        const saved = await DailyMoodLog.create({
            sessionId,
            moodCategory: normalizedMood,
            stressScore: clampedStress,
            crisisDetected: Boolean(crisisDetected),
            conversationSummary: String(conversationSummary || '').slice(0, 400),
        });

        res.json({
            success: true,
            id: saved._id,
            moodCategory: normalizedMood,
            stressScore: clampedStress,
            emoji: moodEmoji(normalizedMood),
        });
    } catch (error) {
        console.error('Session mood log error:', error);
        res.status(500).json({ error: 'Failed to save session mood log' });
    }
});

module.exports = router;
