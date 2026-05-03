import path from "node:path";
import url from "node:url";

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

dotenv.config();

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

function normalizeOrigin(origin) {
  return String(origin || "")
    .trim()
    .replace(/\/+$/, "");
}

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
  });

  const allowedOrigins =
    process.env.CLIENT_URL?.split(",")
      .map((origin) => normalizeOrigin(origin))
      .filter(Boolean) || [];

  console.log("CORS Configuration:");
  console.log("- Allowed origins from CLIENT_URL:", allowedOrigins);

  const productionDomains = [
    /^https:\/\/.*\.netlify\.app$/,
    /^https:\/\/.*\.vercel\.app$/,
    /^https:\/\/.*\.github\.dev$/,
    /^http:\/\/(localhost|127\.0\.0\.1):\d+$/
  ];

  app.use(
    cors({
      origin(origin, callback) {
        console.log("CORS check for origin:", origin);

        if (!origin) {
          callback(null, true);
          return;
        }

        const normalizedOrigin = normalizeOrigin(origin);

        if (allowedOrigins.includes(normalizedOrigin)) {
          callback(null, true);
          return;
        }

        if (productionDomains.some((pattern) => pattern.test(normalizedOrigin))) {
          callback(null, true);
          return;
        }

        console.warn("Blocked by CORS:", normalizedOrigin);
        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
      optionsSuccessStatus: 200
    })
  );

  app.use(express.json({ limit: "8mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));
  app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

  app.get("/api", (_req, res) => {
    res.json({
      success: true,
      message: "API Server Running",
      status: "ok",
      version: "1.0.0"
    });
  });

  app.get("/api/health", (_req, res) => {
    res.json({
      success: true,
      message: "TaskPro API is healthy"
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/teams", teamRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/tasks", taskRoutes);
  app.use("/api/events", eventRoutes);
  app.use("/api/files", fileRoutes);
  app.use("/api/reports", reportRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/workspace", workspaceRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
