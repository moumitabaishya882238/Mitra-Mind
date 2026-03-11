const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.resolve('./.env') });
const key = process.env.GEMINI_KEY_1 || process.env.GEMINI_API_KEY;

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.models) {
            fs.writeFileSync('all-models.txt', data.models.map(m => m.name).join('\n'));
            console.log("Saved to all-models.txt");
        }
    } catch (err) {
        console.error("Error:", err);
    }
}
listModels();
