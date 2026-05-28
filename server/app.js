// server/app.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const metricsRoutes = require('./routes/metrics');

const app = express();
const PORT = process.env.PORT || 4000;

// Basic Security Hardening Configuration
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  optionsSuccessStatus: 200
}));

// Rate Limiting Protection
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 10, 
  message: { error: 'Too many login attempts. Please try again after one minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Mount Routes to Target Routers
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/metrics', metricsRoutes);

// Fallback Route
app.use((expressReq, expressRes) => {
  expressRes.status(404).json({ error: 'Endpoint destination not found.' });
});

// Start the Server Listener if run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[SecureDash Server] Hardened API Gateway online on port ${PORT}`);
  });
}

module.exports = app;