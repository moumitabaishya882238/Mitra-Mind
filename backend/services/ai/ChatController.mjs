import { chatService } from "./ChatService.mjs";

/**
 * Controller for the AI Chat API.
 */
export class ChatController {
    /**
     * POST /api/chat
     * Body: { message, conversationHistory, sessionId, language }
     */
    async handleChat(req, res) {
        const {
            message,
            conversationHistory = [],
            sessionId = 'anonymous-device',
            language = 'en'
        } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required." });
        }

        try {
            const reply = await chatService.processChat(sessionId, message, conversationHistory, language);

            res.json({
                success: true,
                reply,
                sessionId
            });
        } catch (error) {
            console.error("ChatController Error:", error);
            res.status(500).json({ error: "Sorry, I'm having trouble connecting right now. Please try again in a moment." });
        }
    }
}

export const chatController = new ChatController();
