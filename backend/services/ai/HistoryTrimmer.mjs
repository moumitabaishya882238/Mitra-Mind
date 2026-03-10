/**
 * Logic for trimming conversation history to save tokens.
 */
export class HistoryTrimmer {
    /**
     * Trims the history to the last N messages.
     * Also ensures the history alternates correctly if needed (Gemini expects user/model).
     */
    static trim(history = [], maxMessages = 10) {
        if (!Array.isArray(history)) return [];

        // 1. Get the last N messages
        let trimmed = history.slice(-maxMessages);

        // 2. Merge consecutive messages with the SAME role into a single message Block
        // Gemini throws an error if two 'user' or two 'model' messages appear in a row.
        let merged = [];
        for (const msg of trimmed) {
            if (merged.length > 0 && merged[merged.length - 1].role === msg.role) {
                // Same role as previous, append text
                if (msg.parts && msg.parts[0] && msg.parts[0].text) {
                    merged[merged.length - 1].parts[0].text += `\n\n${msg.parts[0].text}`;
                }
            } else {
                // New role block
                const text = (msg.parts && msg.parts[0]) ? msg.parts[0].text : '';
                merged.push({ role: msg.role, parts: [{ text }] });
            }
        }

        // 3. Ensure the FIRST message in history is from 'user'
        // Gemini throws an error if history starts with 'model'
        while (merged.length > 0 && merged[0].role !== 'user') {
            merged.shift();
        }

        // 4. Ensure the LAST message in history is from 'model'
        // Because we are about to call chat.sendMessage() which acts as the next 'user' turn.
        // If history ends with 'user', sending another 'user' message throws an alternation error.
        while (merged.length > 0 && merged[merged.length - 1].role !== 'model') {
            merged.pop();
        }

        return merged;
    }
}
