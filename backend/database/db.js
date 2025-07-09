const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const DBConnection = async () => {
  // Use the environment variable or default to mern_oj database
  const MONGO_URI = process.env.MONGODB_URL || "mongodb://localhost:27017/mern_oj";
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Database connection established ");
  } catch (error) {
    console.log("Error connecting to database", error);
  }
};
module.exports = { DBConnection };
