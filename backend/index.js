const express = require("express");
const app = express();
const { DBConnection } = require("./database/db");
const cors = require("cors");
const authRoutes = require("./routes/auth");

// Connect to database
DBConnection();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Handle multiple origins from CLIENT_URL
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000").split(',');

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Basic routes
app.get("/", (req, res) => {
  res.send("API is running");
});

// Use authentication routes
app.use("/auth", authRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", message: "Server is running properly" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!`);
});

