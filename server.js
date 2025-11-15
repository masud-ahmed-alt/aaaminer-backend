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
import pubScaleRoutes from "./routes/pubscaleRoutes.js";
import { homePage } from "./utils/homePage.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import { instantRedeemCron } from "./automation/redeemAuto.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
dotenv.config({ path: ".env" });

// Build allowed origins, normalize by removing trailing slashes
const allowedOrigins = [
  process.env.LOCALHOST,
  process.env.FRONTEND_URL1,
  process.env.FRONTEND_URL2,
]
  .filter(Boolean) // remove null/undefined
  .map((url) => url?.replace(/\/$/, "")); // remove trailing slash

const isDevelopment = process.env.NODE_ENV === "development";

// console.log(`Environment: ${isDevelopment ? "DEVELOPMENT" : "PRODUCTION"}`);
// console.log("CORS Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // For development, allow requests without origin (like from Android Emulator initial requests)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Remove trailing slash from origin for comparison
      const normalizedOrigin = origin.replace(/\/$/, "");

      // Check if origin is in allowed list
      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
      } else {
        // In development, log and allow; in production, reject
        if (isDevelopment) {
          console.warn(
            `CORS: Allowing non-allowed origin in development: ${origin}`
          );
          callback(null, true); // Allow in development for testing
        } else {
          console.warn(`CORS blocked origin: ${origin}`);
          callback(new Error("Not allowed by CORS"));
        }
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);

const dbURI = process.env.MONGO_URI;
connectDB(dbURI);

taskCron();
// instantRedeemCron()
scratchCardCron();
usersScanning();
resetSpinLimitsCron();

app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", true);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
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
app.use("/api/v1/offers", pubScaleRoutes);
app.use("/api/v1/settings", settingsRoutes);

// Error Middleware
app.use(errorMiddleware);

// Setup socket events
setupSocketEvents(io);

// Handle uncaught exceptions and rejections
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception: ", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at: ", promise, "reason: ", reason);
  process.exit(1);
});

app.get("/", (req, resp) => {
  resp.send(homePage());
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
