const BehaviorPattern = require('../models/BehaviorPattern');
const { generateNudgeResponse } = require('./geminiService');
const { getTimeBucket } = require('../utils/timeUtils');

/**
 * Service to identify users needing proactive support and generate nudges.
 */
async function processNudges(io) {
    console.log('--- Starting Proactive Nudge Engine ---');
    try {
        const patterns = await BehaviorPattern.find({});
        const now = new Date();

        for (const pattern of patterns) {
            try {
                // 1. Cooling period: Don't nudge more than once every 24 hours
                if (pattern.lastNudgeAt) {
                    const hoursSinceLastNudge = (now.getTime() - pattern.lastNudgeAt.getTime()) / (1000 * 60 * 60);
                    if (hoursSinceLastNudge < 24) continue;
                }

                const lastUpdate = pattern.lastUpdatedAt || pattern.updatedAt;
                const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);

                // 2. Silence Detection (3+ days of inactivity)
                if (daysSinceUpdate >= 3) {
                    console.log(`[Silence] Nudging user: ${pattern.sessionId}`);
                    const nudgeText = await generateNudgeResponse('SILENCE', { days: Math.floor(daysSinceUpdate) });

                    emitNudge(io, pattern.sessionId, {
                        type: 'SILENCE',
                        text: nudgeText,
                        action: 'chat'
                    });

                    pattern.lastNudgeAt = now;
                    await pattern.save();
                    continue; // Skip stress peak if silence nudge was sent
                }

                // 3. Stress Peak Recognition
                const currentBucket = getTimeBucket(now);
                const stressTimes = Array.from(pattern.stressTimeCounts.entries())
                    .sort((a, b) => b[1] - a[1]);

                const peakBucket = stressTimes[0]?.[0];
                const peakCount = stressTimes[0]?.[1] || 0;

                // If currently in peak stress bucket and we have enough data (e.g., at least 3 occurrences)
                if (peakBucket === currentBucket && peakCount >= 3) {
                    console.log(`[StressPeak] Nudging user: ${pattern.sessionId} for ${currentBucket}`);
                    const nudgeText = await generateNudgeResponse('STRESS_PEAK', { bucket: currentBucket });

                    emitNudge(io, pattern.sessionId, {
                        type: 'STRESS_PEAK',
                        text: nudgeText,
                        action: 'coping'
                    });

                    pattern.lastNudgeAt = now;
                    await pattern.save();
                }

            } catch (err) {
                console.error(`Error processing nudge for session ${pattern.sessionId}:`, err);
            }
        }
    } catch (error) {
        console.error('Nudge engine main loop error:', error);
    }
}

function emitNudge(io, sessionId, nudgeData) {
    if (!io) return;
    io.to(`user:${sessionId}`).emit('ai:nudge', {
        id: Math.random().toString(36).substring(7),
        ...nudgeData,
        timestamp: new Date()
    });
}

module.exports = {
    processNudges
};
