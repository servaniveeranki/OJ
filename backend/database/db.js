const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const DBConnection = async () => {
  const MONGO_URI = process.env.MONGODB_URL;
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Database connection established");
  } catch (error) {
    console.log("Error connecting to database", error);
  }
};
module.exports = { DBConnection };
