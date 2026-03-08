import axios from 'axios';
import { NativeModules, Platform } from 'react-native';

// Keep this port in sync with backend/.env PORT.
const API_PORT = 5000;

function resolveDevHost(): string {
    // In React Native dev mode, scriptURL usually contains the Metro host.
    // Example: http://192.168.1.23:8081/index.bundle?... on physical device.
    const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
        const match = scriptURL.match(/^https?:\/\/([^/:]+)(?::\d+)?\//i);
        if (match?.[1]) {
            return match[1];
        }
    }

    // Fallbacks when scriptURL is unavailable.
    if (Platform.OS === 'android') return '10.0.2.2';
    return 'localhost';
}

const BASE_URL = `http://${resolveDevHost()}:${API_PORT}`;

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 7000,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default apiClient;
