import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import path, { dirname } from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { resetSpinLimitsCron, scratchCardCron, taskCron, usersScanning } from "./automation/cron.js";
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

const allowedOrigins = [
  process.env.LOCALHOST,
  process.env.FRONTEND_URL1,
  process.env.FRONTEND_URL2,
  null,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
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
    origin: "*",
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
