// Test script to debug MongoDB Atlas connection
const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

console.log("Testing MongoDB Atlas connection...");
console.log(
  "Connection String:",
  MONGODB_URI.replace(/:([^:@]{4})[^:@]*@/, ":$1****@")
); // Hide password

async function testConnection() {
  try {
    console.log("Attempting to connect...");

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      bufferCommands: false,
    });

    console.log("✅ Successfully connected to MongoDB Atlas!");
    console.log("Database name:", mongoose.connection.db.databaseName);
    console.log("Host:", mongoose.connection.host);

    // Test creating a collection
    const testCollection = mongoose.connection.db.collection("test_connection");
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    console.log("✅ Successfully inserted test document");

    // Clean up
    await testCollection.deleteOne({ test: true });
    console.log("✅ Successfully cleaned up test document");

    await mongoose.connection.close();
    console.log("✅ Connection closed successfully");
  } catch (error) {
    console.error("❌ Connection failed!");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);

    if (error.message.includes("authentication failed")) {
      console.log("\n🔧 Possible solutions:");
      console.log("1. Check your username and password");
      console.log("2. Make sure the user has read/write permissions");
      console.log("3. Try resetting the password in Atlas");
    }

    if (error.message.includes("getaddrinfo ENOTFOUND")) {
      console.log("\n🔧 Possible solutions:");
      console.log("1. Check your internet connection");
      console.log("2. Verify the cluster URL is correct");
    }

    if (error.message.includes("querySrv ENOTFOUND")) {
      console.log("\n🔧 Possible solutions:");
      console.log("1. Check if your IP is whitelisted");
      console.log("2. Verify the connection string format");
      console.log("3. Make sure the cluster is not paused");
    }
  }
}

testConnection();
