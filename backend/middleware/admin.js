const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify if the user is an admin
const isAdmin = async (req, res, next) => {
  try {
    // Get token from Authorization header (Bearer token)
    const token = req.headers['authorization']?.split(' ')[1];

    // Check if no token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY || 'your_jwt_secret');
    
    // Add user id to request
    req.userId = decoded.user_id;

    // Find the user by ID
    const user = await User.findById(req.userId);
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is admin
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied: Admin privileges required' });
    }

    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = { isAdmin };
