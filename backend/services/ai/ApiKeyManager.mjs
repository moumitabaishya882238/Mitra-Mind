/**
 * Manages multiple Gemini API keys using a round-robin strategy.
 * Handles automatic fallback if a key fails due to quota or rate limits.
 */
class ApiKeyManager {
    constructor(keys = []) {
        this.keys = keys.filter(key => !!key);
        this.currentIndex = 0;
        this.failedKeys = new Set();
    }

    /**
     * Gets the next available API key in a round-robin fashion.
     * If a key has previously failed, it will still try it unless we implement a cooldown.
     */
    getNextKey() {
        if (this.keys.length === 0) {
            throw new Error("No Gemini API keys configured in environment variables.");
        }

        const key = this.keys[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.keys.length;
        return key;
    }

    /**
     * Marks a key as failed (e.g., 429 or 403) to potentially avoid it in the current cycle.
     */
    markKeyAsFailed(key) {
        console.warn(`⚠️ API Key starting with ${key.substring(0, 8)}... failed. Switching...`);
        this.failedKeys.add(key);
    }

    resetFailedKeys() {
        this.failedKeys.clear();
    }
}

// Extract keys from process.env (e.g., GEMINI_KEY_1, GEMINI_KEY_2, ...)
const keys = [];
for (let i = 1; i <= 50; i++) {
    const key = process.env[`GEMINI_KEY_${i}`] || (i === 1 ? process.env.GEMINI_API_KEY : null);
    if (key && !key.includes('YOUR_')) keys.push(key);
}

export const apiKeyManager = new ApiKeyManager(keys);
