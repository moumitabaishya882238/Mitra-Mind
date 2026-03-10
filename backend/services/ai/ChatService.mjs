import { geminiClient } from "./GeminiClient.mjs";
import { HistoryTrimmer } from "./HistoryTrimmer.mjs";
import BehaviorPattern from "../../models/BehaviorPattern.js";
import DailyMoodLog from "../../models/DailyMoodLog.js";
import ChatMessage from "../../models/ChatMessage.js";
import geminiService from "../geminiService.js";
const { analyzeEmotionAndExtractData } = geminiService;

/**
 * Service to orchestrate the AI chat flow.
 * Handles history trimming, key rotation, and context building.
 */
export class ChatService {
    /**
     * Main chat processing function.
     */
    async processChat(sessionId, message, conversationHistory = [], language = 'en') {
        console.log(`[ChatService] Processing chat for session: ${sessionId}`);
        // 1. Context Enhancement
        // We keep your "yesterday you mentioned" feature by fetching BehaviorPattern
        const pattern = await BehaviorPattern.findOne({ sessionId });

        let behavioralInjections = "";
        if (pattern && pattern.lastCommunityInsight) {
            const insightDate = new Date(pattern.lastCommunityInsight.date);
            const now = new Date();
            const diffHours = (now.getTime() - insightDate.getTime()) / (1000 * 60 * 60);

            if (diffHours <= 48) {
                behavioralInjections += `Note: Yesterday the student shared in the community: "${pattern.lastCommunityInsight.text}". They felt a stress level of ${pattern.lastCommunityInsight.stressScore}/10. `;
            }
        }

        // 2. History Trimming
        // We limit history to last 6 messages to save many tokens/quota
        const trimmedHistory = HistoryTrimmer.trim(conversationHistory, 6);

        // 3. System Instruction
        // This is where "Mitra" personality lives.
        const systemInstruction = `
      You are Mitra, an empathetic AI student companion. 
      CRITICAL RULE: You MUST respond EXCLUSIVELY in this language: ${language}. 
      Even if the user types in English or a mix of languages ("Hinglish"), your final output MUST be translated and written purely in ${language}.
      Context: ${behavioralInjections}.
      Provide supportive, actionable mental health coaching. 
      Keep responses warm, human, and concise.
    `;

        // 4. Call Gemini via the Rotated Key Client
        const reply = await geminiClient.generateResponse(message, trimmedHistory, systemInstruction);

        // 5. Background Tasks (Log to DB)
        // We do this asynchronously or after responding to keep the API fast.
        this.logActivity(sessionId, message, reply, language).catch(err => console.error("Logging error:", err));

        return reply;
    }

    /**
     * Logs conversation and analyzes emotion for the Dashboard.
     */
    async logActivity(sessionId, userMsg, botReply, language) {
        try {
            // We reuse your existing analysis tool to feed the Dashboard
            const analysis = await analyzeEmotionAndExtractData(userMsg);

            await DailyMoodLog.create({
                sessionId,
                moodCategory: analysis.mood_category || 'Neutral',
                stressScore: Number(analysis.stress_score) || 5,
                crisisDetected: Boolean(analysis.crisis_detected),
                conversationSummary: userMsg.slice(0, 400),
            });

            await ChatMessage.insertMany([
                { sessionId, role: 'user', text: userMsg, language },
                { sessionId, role: 'bot', text: botReply, language }
            ]);
        } catch (err) {
            console.error("Activity logging failed:", err);
        }
    }
}

export const chatService = new ChatService();
