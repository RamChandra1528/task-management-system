import dotenv from "dotenv";
import path from "node:path";
import url from "node:url";

import { createApp } from "../src/app.js";
import { connectDatabase } from "../src/config/db.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

process.env.MONGODB_URI ||= "mongodb://127.0.0.1:27017/taskpro";
process.env.JWT_SECRET ||= "super-secret-taskpro-key";
process.env.CLIENT_URL ||= "http://localhost:5173";

let app = null;
let dbConnected = false;

async function initializeApp() {
  if (!dbConnected) {
    try {
      await connectDatabase(process.env.MONGODB_URI);
      dbConnected = true;
      console.log("✓ Database connected");
    } catch (error) {
      console.error("✗ Database connection failed:", error.message);
      throw error;
    }
  }

  if (!app) {
    app = createApp();
    console.log("✓ App initialized");
  }

  return app;
}

export default async function handler(req, res) {
  try {
    const expressApp = await initializeApp();
    expressApp(req, res);
  } catch (error) {
    console.error("Handler error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message
    });
  }
}
