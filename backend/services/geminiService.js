const { GoogleGenerativeAI } = require('@google/generative-ai');

// Accept either legacy GOOGLE_AI_API_KEY or GEMINI_API_KEY from .env
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || 'YOUR_API_KEY';
const genAI = new GoogleGenerativeAI(apiKey);

// System prompt specific to student mental health companion
const SYSTEM_PROMPT = `
You are Mitra, an empathetic, AI-powered mental health companion for university students.
Your goal is to provide a safe, anonymous space for students to talk about their struggles, academic stress, and emotions.

Guidelines:
1. Always be empathetic and non-judgmental.
2. Use evidence-based coping strategies (like CBT techniques) when appropriate.
3. Keep responses conversational and concise (suitable for a chat or voice interface).
4. If the user mentions severe distress, self-harm, or crisis language, clearly state they should reach out to a professional or helpline.
5. Your output should be plain text designed to be read aloud via Text-to-Speech (so no complex markdown, just natural sentences).

You will be given the student's recent emotion context (if any) and their current message.
Respond directly to their message as Mitra.
If behavioral patterns are provided, gently reference them in a supportive way without sounding repetitive or creepy.
`;

async function generateCompanionResponse(
    userMessage,
    emotionContext = {},
    language = 'en',
    conversationHistory = [],
    behaviorPatterns = null,
    communityInsight = null
) {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: SYSTEM_PROMPT
        });

        const contextStr = Object.keys(emotionContext).length > 0
            ? `Student's recent context: ${JSON.stringify(emotionContext, null, 2)}\n\n`
            : '';

        const historyStr = Array.isArray(conversationHistory) && conversationHistory.length > 0
            ? `Recent conversation (oldest to latest):\n${conversationHistory
                .map((entry) => `${entry.role === 'user' ? 'User' : 'Mitra'}: ${entry.text}`)
                .join('\n')}\n\n`
            : '';

        const patternStr = behaviorPatterns
            ? `Behavioral patterns summary: ${JSON.stringify(behaviorPatterns, null, 2)}\n\n`
            : '';

        const insightStr = communityInsight && communityInsight.text
            ? `${COMMUNITY_INSIGHT_PROMPT}\nRecent Community Post: "${communityInsight.text}" (Mood: ${communityInsight.mood}, Stress: ${communityInsight.stressScore}/10, Date: ${communityInsight.date})\n\n`
            : '';

        const finalPrompt = `${contextStr}${patternStr}${insightStr}${historyStr}User (${language}): ${userMessage}`;

        const result = await model.generateContent(finalPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini AI generation error:", error);
        throw error;
    }
}

// Optional: A more structured extraction function similar to Matri
async function analyzeEmotionAndExtractData(userMessage, language = 'en') {
    const schemaPrompt = `
Analyze the text and extract:
1. "mood_category": (e.g., Happy, Stressed, Anxious, Depressed, Neutral)
2. "stress_score": (1-10)
3. "crisis_detected": boolean
Return strictly in JSON formatting.
User text: ${userMessage}
   `;

    const LISTENER_INSIGHT_PROMPT = `
You are an AI assistant for a human volunteer listener. 
Your task is to provide a brief, anonymized summary of a student's distress to help the listener understand how to help.

Rules:
1. Keep it to EXACTLY 3 bullet points.
2. Focus on: Current Stress Level, Main Concerns (e.g., exams, family, isolation), and Recent Coping Efforts.
3. Be professional, objective, yet empathetic.
4. Use "The student" instead of names.
5. Stay extremely brief (max 1 sentence per bullet).
`;

    const NUDGE_PROMPT = `
You are Mitra, a proactive mental health companion. 
Your goal is to reach out to a student with a SHORT, gentle, and empathetic nudge.

Context:
- "SILENCE": The student hasn't checked in for over 3 days. Show you care and miss them, but don't be pushy.
- "STRESS_PEAK": It's a time of day when they usually feel stressed (e.g., late night). Offer a quick 2-minute coping activity or just a listening ear.

Rules:
1. Keep it to 1-2 natural sentences. 
2. No markdown.
3. Be extremely supportive.
`;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(schemaPrompt);
        let textResponse = result.response.text();

        // Clean up markdown block if it exists
        textResponse = textResponse.replace(/^```json/g, '').replace(/```$/g, '').trim();
        return JSON.parse(textResponse);
    } catch (e) {
        console.error("Emotion extraction error", e);
        return {
            mood_category: 'Unknown',
            stress_score: 5,
            crisis_detected: false
        };
    }
}

async function generateNudgeResponse(type = 'SILENCE', context = {}, language = 'en') {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: NUDGE_PROMPT
        });

        const prompt = `Type: ${type}. Context: ${JSON.stringify(context)}. Language: ${language}. Generate a nudge:`;
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error("Nudge generation error:", error);
        return "Hey! Just wanted to check in and see how you're feeling today. I'm here if you need to talk.";
    }
}

async function generateListenerInsight(studentContext = {}, language = 'en') {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: LISTENER_INSIGHT_PROMPT
        });

        const prompt = `Student History/Context: ${JSON.stringify(studentContext)}. Language: ${language}. Provide a 3-line preview:`;
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error("Listener insight generation error:", error);
        return "• The student is experiencing moderate stress levels.\n• Main concerns include academic pressure and daily routine.\n• They have recently engaged with basic breathing exercises.";
    }
}

module.exports = {
    generateCompanionResponse,
    analyzeEmotionAndExtractData,
    generateNudgeResponse,
    generateListenerInsight
};
