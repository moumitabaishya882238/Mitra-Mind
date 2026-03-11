import axios from 'axios';
import { NativeModules, Platform } from 'react-native';

// Keep this port in sync with backend/.env PORT.
const API_PORT = 5000;

// TODO: Replace with your actual production backend URL
const PROD_URL = 'https://mitra-mind-production.up.railway.app'; 

function resolveDevHost(): string {
    if (!__DEV__) return PROD_URL;

    // In React Native dev mode, scriptURL usually contains the Metro host.
    // Example: http://192.168.1.23:8081/index.bundle?... on physical device.
    const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
        const match = scriptURL.match(/^https?:\/\/([^/:]+)(?::\d+)?\//i);
        if (match?.[1]) {
            return `http://${match[1]}:${API_PORT}`;
        }
    }

    // Fallbacks when scriptURL is unavailable.
    if (Platform.OS === 'android') return `http://10.0.2.2:${API_PORT}`;
    return `http://localhost:${API_PORT}`;
}

export const BASE_URL = resolveDevHost();

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 7000,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default apiClient;
