import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://mitra-mind.onrender.com';

export const api = axios.create({
  baseURL,
  timeout: 12000,
  withCredentials: true, // Enable cookies for session management
  headers: {
    'Content-Type': 'application/json',
  },
});
