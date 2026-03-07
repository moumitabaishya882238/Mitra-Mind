const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
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
// TODO: app.use('/auth', require('./routes/auth'));
app.use('/ai', require('./routes/ai'));

// Root Endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Mitra-Mind Backend is running' });
});

const PORT = process.env.PORT || 5001; // Using 5001 to avoid conflict with Matri
app.listen(PORT, () => {
    console.log(`Mitra-Mind Server running on port ${PORT}`);
});
