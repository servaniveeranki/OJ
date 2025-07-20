const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const DBConnection = async () => {
  const MONGO_URI = process.env.MONGODB_URI;
  
  if (!MONGO_URI) {
    console.error("MONGODB_URI environment variable is not set!");
    process.exit(1);
  }
  
  console.log("Attempting to connect to MongoDB...");
  console.log("MongoDB URI:", MONGO_URI.replace(/\/\/.*@/, "//***:***@")); // Hide credentials in logs
  
  const connectWithRetry = async (retries = 5, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
      try {
        await mongoose.connect(MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 10000, // 10 seconds
          connectTimeoutMS: 10000, // 10 seconds
        });
        console.log("✅ Database connection to MONGODB successful!!");
        return;
      } catch (error) {
        console.log(`❌ Database connection attempt ${i + 1}/${retries} failed:`, error.message);
        
        if (i === retries - 1) {
          console.error("💀 All database connection attempts failed. Exiting...");
          process.exit(1);
        }
        
        console.log(`⏳ Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };
  
  await connectWithRetry();
};

module.exports = { DBConnection };
