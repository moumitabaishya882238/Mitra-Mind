const express = require('express');
const router = express.Router();
const { generateCompanionResponse, analyzeEmotionAndExtractData } = require('../services/geminiService');

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

module.exports = router;
