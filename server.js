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

dotenv.config({ path: ".env" });

const app = express();

// FRONTEND ORIGINS (WEB ONLY)
const allowedOrigins = [
  process.env.LOCALHOST,
  process.env.FRONTEND_URL1,
  process.env.FRONTEND_URL2
].filter(Boolean);

// ENV
const isProduction = process.env.NODE_ENV === "production";

// -------------------------------
// FIXED CORS FOR ANDROID + WEB
// -------------------------------
app.use(
  cors({
    origin: function (origin, callback) {
      // 1. Android native apps (Retrofit) => no origin
      if (!origin) {
        return callback(null, true);
      }

      // 2. Android WebView / ads => origin null or file://
      if (origin === "null" || origin.startsWith("file://")) {
        return callback(null, true);
      }

      // 3. Normal browser request
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // 4. In development, allow everything
      if (!isProduction) {
        console.warn("CORS dev override:", origin);
        return callback(null, true);
      }

      // 5. In production, block unknown origins
      console.warn("CORS blocked:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// -------------------------------
// DATABASE
// -------------------------------
connectDB(process.env.MONGO_URI);

taskCron();
scratchCardCron();
usersScanning();
resetSpinLimitsCron();
// instantRedeemCron();

// -------------------------------
app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", true);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------------------
// SOCKET.IO — MATCH SAME CORS RULES
// -------------------------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || origin === "null" || origin.startsWith("file://")) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (!isProduction) {
        console.warn("SOCKET CORS dev override:", origin);
        return callback(null, true);
      }

      console.warn("SOCKET CORS blocked:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT"],
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// -------------------------------
// ROUTES
// -------------------------------
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/offers", pubScaleRoutes);
app.use("/api/v1/settings", settingsRoutes);

// ERRORS
app.use(errorMiddleware);

setupSocketEvents(io);

// -------------------------------
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", promise, "reason:", reason);
  process.exit(1);
});

// -------------------------------
app.get("/", (req, resp) => {
  resp.send(homePage());
});

// -------------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
