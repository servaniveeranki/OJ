const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
};

// Register route
router.post("/register", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    console.log('Registration attempt:', { firstname, lastname, email, passwordProvided: !!password });
    
    // Check if all required fields are provided
    if (!(firstname && lastname && email && password)) {
      console.log('Missing required fields');
      return res.status(400).json({ message: "All input fields are required" });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists. Please login." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await User.create({
      firstname,
      lastname,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    // Return new user with token
    user.password = undefined;
    
    res.status(201).json({ user, token, message: "Registration successful" });
  } catch (error) {
    console.error('Registration error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, passwordProvided: !!password });

    // Validate input
    if (!(email && password)) {
      console.log('Missing email or password');
      return res.status(400).json({ message: "All input fields are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    
    // Check if user exists and password is correct
    if (user && (await bcrypt.compare(password, user.password))) {
      // Generate token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.SECRET_KEY,
        { expiresIn: "24h" }
      );

      user.password = undefined;
      
      return res.status(200).json({ user, token, message: "Login successful" });
    }
    
    res.status(400).json({ message: "Invalid email or password" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Protected route example
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { firstname, lastname, profilePicture } = req.body;
    
    // Find user and update
    const updatedUser = await User.findByIdAndUpdate(
      req.user.user_id,
      { 
        $set: { 
          firstname: firstname || undefined,
          lastname: lastname || undefined,
          profilePicture: profilePicture || undefined
        } 
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user: updatedUser, message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Change password
router.put("/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!(currentPassword && newPassword)) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    // Find user
    const user = await User.findById(req.user.user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
