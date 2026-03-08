import axios from 'axios';

// Android emulator reaches host machine via 10.0.2.2.
// Keep this port in sync with backend/.env PORT.
const BASE_URL = 'http://10.0.2.2:5000';

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 7000,
    headers: {
        'Content-Type': 'application/json'
    }
});

export default apiClient;
