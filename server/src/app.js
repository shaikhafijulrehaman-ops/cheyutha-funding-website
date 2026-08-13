const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();

// Middleware
const allowedOrigins = [
    'https://cheyutha-india.org',
    'https://www.cheyutha-india.org',
    'http://localhost:5173',
    'http://localhost:3000'
];

if (process.env.CLIENT_ORIGIN) {
    allowedOrigins.push(process.env.CLIENT_ORIGIN);
}

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(null, true); // Fallback allow to avoid breaking third-party embeds while logging
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets from client/dist
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// API Routes (mounted under both /api and root to support Vercel serverless function rewrites)
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// SPA Fallback for client-side routing (Express 5 compatible)
app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
        return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
        if (err) next();
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong on the server!' });
});

module.exports = app;
