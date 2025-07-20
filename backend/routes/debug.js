const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Debug endpoint to check system status
router.get('/status', (req, res) => {
  try {
    const status = {
      server: 'running',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'not set',
        PORT: process.env.PORT || 'not set',
        MONGODB_URI: process.env.MONGODB_URI ? 'set (hidden)' : 'not set',
        SECRET_KEY: process.env.SECRET_KEY ? 'set (hidden)' : 'not set',
        CLIENT_URL: process.env.CLIENT_URL || 'not set'
      },
      database: {
        connected: mongoose.connection.readyState === 1,
        state: mongoose.connection.readyState,
        host: mongoose.connection.host || 'not connected',
        name: mongoose.connection.name || 'not connected'
      },
      routes: {
        auth_routes_loaded: true // We'll verify this exists
      }
    };
    
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({
      error: 'Debug endpoint failed',
      message: error.message
    });
  }
});

// Test auth route registration
router.get('/test-auth', (req, res) => {
  res.status(200).json({
    message: 'Debug auth route working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
