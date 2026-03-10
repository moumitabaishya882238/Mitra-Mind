const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');
const { Server } = require('socket.io');
const { processNudges } = require('./services/nudgeService');

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

const corsOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
const io = new Server(httpServer, {
    cors: {
        origin: corsOrigin,
        credentials: true,
    },
});

app.set('io', io);

// Middleware
app.use(cors({
    origin: corsOrigin,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'mitra_mind_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mitra-mind';
mongoose.connect(MONGODB_URI, {
    maxPoolSize: 50,
    serverSelectionTimeoutMS: 5000,
})
    .then(() => console.log('MongoDB Connected successfully to Mitra-Mind DB'))
    .catch(err => console.error('MongoDB connection error:', err));
// Define Routes
app.use('/auth', require('./routes/auth'));
app.use('/ai', require('./routes/ai'));
app.use('/community', require('./routes/community'));
app.use('/upload', require('./routes/upload'));
app.use('/', require('./routes/listeners'));
app.use('/support', require('./routes/support'));

// Root Endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Mitra-Mind Backend is running' });
});

// Optimized AI Chat Route (Phase 7 - ESM Bridge)
app.post('/api/chat', async (req, res) => {
    try {
        const { chatController } = await import('./services/ai/ChatController.mjs');
        return chatController.handleChat(req, res);
    } catch (err) {
        console.error("ESM Bridge Error:", err);
        res.status(500).json({ error: "AI Service initialization failed" });
    }
});

io.on('connection', (socket) => {
    const initialUserId = socket.handshake?.auth?.userId || socket.handshake?.query?.userId;
    if (initialUserId) {
        socket.join(`user:${String(initialUserId)}`);
    }

    socket.on('register', ({ userId }) => {
        if (!userId) return;
        socket.join(`user:${String(userId)}`);
    });

    socket.on('register-listener', ({ listenerId }) => {
        if (!listenerId) return;
        socket.join(`listener:${String(listenerId)}`);
    });
});

const PORT = process.env.PORT || 5001; // Using 5001 to avoid conflict with Matri
httpServer.listen(PORT, () => {
    console.log(`Mitra-Mind Server running on port ${PORT}`);

    // Start Proactive AI Nudge Engine
    // Check for nudges 1 minute after startup, then every 6 hours
    setTimeout(() => {
        processNudges(io);
    }, 60000);

    setInterval(() => {
        processNudges(io);
    }, 6 * 60 * 60 * 1000);
});
