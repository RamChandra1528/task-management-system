import dotenv from "dotenv";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

// Set defaults
process.env.MONGODB_URI ||= "mongodb://127.0.0.1:27017/taskpro";
process.env.JWT_SECRET ||= "super-secret-taskpro-key";
process.env.CLIENT_URL ||= "http://localhost:5173";
process.env.SEED_ON_START = "false";

let app = null;
let dbConnected = false;

async function initializeApp() {
  try {
    if (!dbConnected) {
      const { connectDatabase } = await import("../src/config/db.js");
      await connectDatabase(process.env.MONGODB_URI);
      dbConnected = true;
      console.log("✓ Database connected");
    }

    if (!app) {
      const { createApp } = await import("../src/app.js");
      app = createApp();
      console.log("✓ Express app initialized");
    }

    return app;
  } catch (error) {
    console.error("✗ Initialization failed:", error.message);
    console.error(error.stack);
    throw error;
  }
}

export default async function handler(req, res) {
  try {
    const expressApp = await initializeApp();
    
    // Handle the request with Express
    return expressApp(req, res);
  } catch (error) {
    console.error("Handler error:", error);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: process.env.NODE_ENV === "production" ? "Server error" : error.message
      });
    }
  }
}
