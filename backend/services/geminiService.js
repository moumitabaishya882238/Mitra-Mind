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
`;

async function generateCompanionResponse(userMessage, emotionContext = {}, language = 'en') {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: SYSTEM_PROMPT
        });

        const contextStr = Object.keys(emotionContext).length > 0
            ? `Student's recent context: ${JSON.stringify(emotionContext, null, 2)}\n\n`
            : '';

        const finalPrompt = `${contextStr}User (${language}): ${userMessage}`;

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

module.exports = {
    generateCompanionResponse,
    analyzeEmotionAndExtractData
};
