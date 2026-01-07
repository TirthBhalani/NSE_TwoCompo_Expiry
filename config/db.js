require('dotenv').config()
const mongoose = require('mongoose');

// Use a global variable to store the connection state across function calls
let cachedConnection = null;

const connectDB = async () => {
  // If a connection exists and is ready, use it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('Using existing MongoDB connection');
    return cachedConnection;
  }

  console.log('Creating new MongoDB connection...');
  
  try {
    // Set connection options for stability
    const opts = {
      bufferCommands: false, // Disable mongoose buffering for faster errors in serverless
    };

    cachedConnection = await mongoose.connect(process.env.MONGODB_URI, opts);
    return cachedConnection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

module.exports = connectDB;