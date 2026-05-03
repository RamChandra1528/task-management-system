import dotenv from "dotenv";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

// Log environment check
console.log("🔍 Environment Check:");
console.log("- MONGODB_URI:", process.env.MONGODB_URI ? "✓ Set" : "✗ Missing");
console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "✓ Set" : "✗ Missing");
console.log("- CLIENT_URL:", process.env.CLIENT_URL ? "✓ Set" : "✗ Missing");
console.log("- NODE_ENV:", process.env.NODE_ENV || "development");

// Set defaults
process.env.MONGODB_URI ||= "mongodb://127.0.0.1:27017/taskpro";
process.env.JWT_SECRET ||= "super-secret-taskpro-key";
process.env.CLIENT_URL ||= "http://localhost:5173";
process.env.SEED_ON_START = "false";

let app = null;
let dbConnected = false;
let initError = null;

async function initializeApp() {
  try {
    // Try to connect to database only once
    if (!dbConnected) {
      try {
        console.log("📡 Connecting to MongoDB:", process.env.MONGODB_URI.substring(0, 50) + "...");
        const { connectDatabase } = await import("../src/config/db.js");
        await connectDatabase(process.env.MONGODB_URI);
        dbConnected = true;
        console.log("✅ Database connected successfully");
      } catch (dbError) {
        console.error("❌ Database connection error:", dbError.message);
        throw new Error(`Database connection failed: ${dbError.message}`);
      }
    }

    // Create Express app only once
    if (!app) {
      try {
        console.log("🚀 Initializing Express app...");
        const { createApp } = await import("../src/app.js");
        app = createApp();
        console.log("✅ Express app created successfully");
      } catch (appError) {
        console.error("❌ App creation error:", appError.message);
        throw new Error(`App creation failed: ${appError.message}`);
      }
    }

    return app;
  } catch (error) {
    initError = error;
    console.error("❌ Initialization error:", error.message);
    console.error(error.stack);
    throw error;
  }
}

export default async function handler(req, res) {
  try {
    console.log(`📨 ${req.method} ${req.url}`);
    
    const expressApp = await initializeApp();
    
    // Handle the request with Express
    return expressApp(req, res);
  } catch (error) {
    console.error("🔴 Handler caught error:", error.message);
    console.error(error.stack);
    
    if (!res.headersSent) {
      const errorMessage = initError 
        ? initError.message 
        : error.message;
      
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: errorMessage,
        details: {
          dbConnected,
          hasApp: !!app,
          nodeEnv: process.env.NODE_ENV
        }
      });
    }
  }
}
