import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import path, { dirname } from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import {
  resetSpinLimitsCron,
  scratchCardCron,
  taskCron,
  usersScanning,
} from "./automation/cron.js";
import connectDB from "./config/db.js";
import { setupSocketEvents } from "./controllers/adminController.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { homePage } from "./utils/homePage.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import { instantRedeemCron } from "./automation/redeemAuto.js";
import { validateEnv } from "./utils/validateEnv.js";
import { logger } from "./utils/logger.js";
import { sanitizeBody } from "./middlewares/validationMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
dotenv.config({ path: ".env" });

// Validate environment variables on startup
try {
  validateEnv();
} catch (error) {
  logger.error("Environment validation failed", error);
  process.exit(1);
}

// Build allowed origins, normalize by removing trailing slashes
const allowedOrigins = [
  process.env.LOCALHOST,
  process.env.FRONTEND_URL1,
  process.env.FRONTEND_URL2,
]
  .filter(Boolean) // remove null/undefined
  .map((url) => url?.replace(/\/$/, "")); // remove trailing slash

const isDevelopment = process.env.NODE_ENV === "development";
// Android apps don't send Origin headers, so we should allow requests without origin
// Set ALLOW_MOBILE_NO_ORIGIN=false in env if you want to strictly require origin
const allowNoOrigin = process.env.ALLOW_MOBILE_NO_ORIGIN !== "false";

logger.info(`Environment: ${isDevelopment ? "DEVELOPMENT" : "PRODUCTION"}`);
logger.info(`CORS Allowed Origins: ${allowedOrigins.join(", ") || "None configured"}`);
logger.info(`Allow requests without origin: ${allowNoOrigin ? "YES (for mobile apps)" : "NO"}`);

app.use(
  cors({
    origin: function (origin, callback) {
      // For requests without origin (like mobile apps, Postman, etc.)
      if (!origin) {
        // Allow mobile app requests - Android apps don't send Origin headers
        if (allowNoOrigin) {
          logger.debug("CORS: Allowing request without origin (mobile app)");
          callback(null, true);
        } else {
          logger.warn("CORS: Blocked request without origin");
          callback(new Error("Origin required"));
        }
        return;
      }

      // Remove trailing slash from origin for comparison
      const normalizedOrigin = origin.replace(/\/$/, "");

      // Check if origin is in allowed list
      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
      } else {
        // In development mode, log and allow; in production, reject
        if (isDevelopment) {
          logger.warn(`CORS: Allowing non-allowed origin in development: ${origin}`);
          callback(null, true); // Allow in development for testing
        } else {
          logger.error(`CORS blocked origin: ${origin}`);
          callback(new Error("Not allowed by CORS"));
        }
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Cookie"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);

const dbURI = process.env.MONGO_URI;
if (!dbURI) {
  logger.error("MONGO_URI is not defined in environment variables");
  process.exit(1);
}

connectDB(dbURI);

// Initialize cron jobs
logger.info("Initializing cron jobs...");
taskCron();
// instantRedeemCron()
scratchCardCron();
usersScanning();
resetSpinLimitsCron();
logger.success("Cron jobs initialized");

// Body parsing middleware with size limit
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Sanitize request body
app.use(sanitizeBody);

app.use(cookieParser());
app.set("trust proxy", true);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests without origin (mobile apps)
      if (!origin) {
        if (allowNoOrigin) {
          callback(null, true);
        } else {
          callback(new Error("Origin required"));
        }
        return;
      }
      // Check allowed origins
      const normalizedOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
      } else {
        // In development, allow any origin for testing
        if (isDevelopment) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT"],
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// seedUsers(150)

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/settings", settingsRoutes);

// Error Middleware
app.use(errorMiddleware);

// Setup socket events
setupSocketEvents(io);

// Handle uncaught exceptions and rejections
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", { promise, reason });
  process.exit(1);
});

app.get("/", (req, resp) => {
  resp.send(homePage());
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces
server.listen(PORT, HOST, () => {
  logger.success(`Server running on ${HOST}:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(`Accessible from network at: http://192.168.1.4:${PORT}`);
});
