const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Add user id to request
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Optional middleware to check token but continue if not present
const optionalAuth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // If no token, just continue without setting userId
  if (!token) {
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Add user id to request
    req.userId = decoded.userId;
    next();
  } catch (err) {
    // Continue even if token is invalid
    next();
  }
};

module.exports = { verifyToken, optionalAuth };
