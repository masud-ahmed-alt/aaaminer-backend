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

const allowedOrigins = [
  process.env.LOCALHOST,
  process.env.FRONTEND_URL1,
  process.env.FRONTEND_URL2,
]
  .filter(Boolean)
  .map((url) => url?.replace(/\/$/, ""));

const isDevelopment = process.env.NODE_ENV === "development";
const allowNoOrigin = true;

logger.info(`Environment: ${isDevelopment ? "DEVELOPMENT" : "PRODUCTION"}`);
logger.info(`CORS Allowed Origins: ${allowedOrigins.join(", ") || "None configured"}`);
logger.info(`Allow requests without origin: ${allowNoOrigin ? "YES (for mobile apps)" : "NO"}`);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        if (allowNoOrigin) {
          logger.debug("CORS: Allowing request without origin (mobile app)");
          callback(null, true);
        } else {
          logger.warn("CORS: Blocked request without origin");
          callback(new Error("Origin required"));
        }
        return;
      }

      const normalizedOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
      } else {
        if (isDevelopment) {
          logger.warn(`CORS: Allowing non-allowed origin in development: ${origin}`);
          callback(null, true);
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
      if (!origin) {
        if (allowNoOrigin) {
          callback(null, true);
        } else {
          callback(new Error("Origin required"));
        }
        return;
      }
      const normalizedOrigin = origin.replace(/\/$/, "");
      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
      } else {
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

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/settings", settingsRoutes);

app.use(errorMiddleware);
setupSocketEvents(io);
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
const HOST = process.env.HOST || '0.0.0.0';
server.listen(PORT, HOST, () => {
  logger.success(`Server running on ${HOST}:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
});
