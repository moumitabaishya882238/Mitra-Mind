import axios from 'axios';

// Replace with local network IP or localhost if running android emulator
const BASE_URL = 'http://10.0.2.2:5001';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default apiClient;
