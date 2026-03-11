import { GoogleGenerativeAI } from "@google/generative-ai";
import { apiKeyManager } from "./ApiKeyManager.mjs";

let totalTokensUsedGlobal = 0;

/**
 * Low-level client for interacting with Gemini.
 * Includes automatic retry logic with API key rotation.
 */
export class GeminiClient {
    constructor(modelName = "gemini-2.5-flash") {
        this.modelName = modelName;
    }

    /**
     * Generates a response from Gemini using key rotation and retries.
     */
    async generateResponse(prompt, history = [], systemInstruction = "") {
        let lastError = null;
        const maxRetries = apiKeyManager.keys.length;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            const apiKey = apiKeyManager.getNextKey();

            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({
                    model: this.modelName
                });

                const chat = model.startChat({
                    history: history,
                });

                const result = await chat.sendMessage(`${systemInstruction}\n\n${prompt}`);
                const response = await result.response;

                // Log Token Usage
                if (response.usageMetadata) {
                    totalTokensUsedGlobal += response.usageMetadata.totalTokenCount;
                    console.log(`[AI Usage - ChatV2] Tokens: Prompt=${response.usageMetadata.promptTokenCount}, Total=${response.usageMetadata.totalTokenCount} | Global Session Total: ${totalTokensUsedGlobal} (Key: ${apiKey.substring(0, 8)}...)`);
                }

                return response.text();

            } catch (error) {
                lastError = error;
                const status = error?.status || error?.response?.status;

                // If it's a quota (429), auth (403), or server error (500+), mark key as failed and retry
                if (status === 429 || status === 403 || status >= 500 || error.message?.includes("quota")) {
                    apiKeyManager.markKeyAsFailed(apiKey);
                    continue;
                }

                // For other errors, we might want to throw immediately
                throw error;
            }
        }

        throw new Error(`All Gemini API keys failed. Last error: ${lastError?.message}`);
    }
}

export const geminiClient = new GeminiClient();
