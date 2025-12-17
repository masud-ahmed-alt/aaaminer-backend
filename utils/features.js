import fs from "fs";
import jwt from "jsonwebtoken";
import multer from "multer";
import TelegramBot from "node-telegram-bot-api";
import nodemailer from "nodemailer";
import ScratchCard from "../models/ScratchCard.js";
import Task from "../models/Task.js";
import { getOTPMessage } from "./otpMessage.js";
import User from "../models/User.js";
import { logger } from "./logger.js";

// Determine if we're in production (check multiple ways)
const isProduction = process.env.NODE_ENV === "production" || 
                     process.env.NODE_ENV === "prod" ||
                     (process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "dev");

// For cross-domain cookies to work, we need SameSite=None with Secure=true
// In production (HTTPS): sameSite="none" and secure=true
// In development (HTTP): sameSite="lax" and secure=false (for localhost)
const cookieOptions = {
  maxAge: 15 * 24 * 60 * 60 * 1000,
  sameSite: isProduction ? "none" : "lax", // "none" required for cross-domain with secure cookies
  httpOnly: true,
  secure: isProduction, // Only true in production (HTTPS), false in development (HTTP)
  path: "/", // Explicitly set path to root for cross-domain cookies
  // Don't set domain - let browser use the domain that sets it (rewardplus.cloud)
};

// Cookie configuration is set based on environment

const sendToken = (resp, user, code, message) => {
  try {
    if (!user || !user._id) {
      throw new Error("Invalid user object: missing user or user._id");
    }

    const userWithoutPassword = user.toObject ? user.toObject() : { ...user };
    delete userWithoutPassword.password;

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    if (!process.env.COOKIE_NAME) {
      throw new Error("COOKIE_NAME is not defined in environment variables");
    }

    return resp
      .status(code)
      .cookie(process.env.COOKIE_NAME, token, cookieOptions)
      .json({
        success: true,
        message,
        token, 
        user: userWithoutPassword,
      });
  } catch (error) {
    logger.error("Error in sendToken", error);
    throw error;
  }
};

const sendEmail = async (email, subject, htmlContent, next) => {
  const smtpPort = Number(process.env.SMTP_PORT) || 465;
  const isSecure = smtpPort === 465;
  
  const transporterConfig = {
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: isSecure,
    requireTLS: !isSecure,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
  };

  const domain = process.env.DOMAIN || (process.env.SMTP_MAIL ? process.env.SMTP_MAIL.split('@')[1] : null);
  const keySelector = process.env.KEY_SELECTOR;
  const privateKey = process.env.DKIM_PRIVATE_KEY;

  if (domain && keySelector && privateKey && privateKey.trim()) {
    transporterConfig.dkim = {
      domainName: domain,
      keySelector: keySelector,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    };
  }

  const transporter = nodemailer.createTransport(transporterConfig);

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject: subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    logger.error("SMTP Error", {
      code: error.code,
      command: error.command,
      response: error.response,
      host: process.env.SMTP_HOST,
      port: smtpPort,
    });
    return new Error("Failed to send email");
  }
};

const getAvailableTasks = async (userId) => {
  return await Task.find({ completedBy: { $ne: userId } })
    .select("-completedBy")
    .sort({ createdAt: +1 });
};

const getAvailableScratchCard = async (userId) => {
  return await ScratchCard.find({ completedBy: { $ne: userId } }).select(
    "-completedBy"
  );
};

const generateOTP = () => {
  return Math.random()
    .toString()
    .slice(2, 2 + 6);
};

const setAndSendOTP = async (user, subject) => {
  const otp = generateOTP();
  const message = getOTPMessage(subject, user.name, otp);
  user.emailOTP = otp;
  user.otpExpiry = Date.now() + 15 * 60 * 1000;
  await user.save();
  await sendEmail(user.email, subject, message);
};

const getUploadPath = (type) => {
  const baseDir = "uploads/";
  const subDir = `${baseDir}${type}/`;
  if (!fs.existsSync(subDir)) {
    fs.mkdirSync(subDir, { recursive: true });
  }
  return subDir;
};

const storage = (type) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = getUploadPath(type || "general");
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

const sendTelegramMessage = (message, imagePath) => {
  const token = process.env.TEL_BOT_TOKEN;
  const chatId = process.env.CHAT_ID;
  const bot = new TelegramBot(token, { polling: false });

  if (imagePath) {
    if (!fs.existsSync(imagePath)) {
      logger.error("Image file not found", { imagePath });
      return;
    }

    bot
      .sendPhoto(chatId, fs.createReadStream(imagePath), { caption: message })
      .catch((error) => {
        logger.error("Error sending telegram image message", error);
      });
  } else {
    bot
      .sendMessage(chatId, message, { parse_mode: "HTML" })
      .catch((error) => {
        logger.error("Error sending telegram text message", error);
      });
  }
};

const findSuspectedUser = async () => {
  const knownDomains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "live.com",
  ];

  const suspiciousEmailRegex = new RegExp(
    `^(?:[^@\\s]+(?:\\.[^@\\s]+)*|"(?:[^"\\\\]|\\\\.)*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|(?:\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\]))$`,
    "i"
  );

  const usernameSuspicionRegex = /[.]{2,}|[^\w.@-]/;

  const unknownDomainRegex = new RegExp(
    `@(?!(${knownDomains.join("|")})$).*`,
    "i"
  );

  const suspectedUsers = await User.find({
    $or: [
      { email: { $not: suspiciousEmailRegex } },
      { email: { $regex: usernameSuspicionRegex } },
      { email: { $regex: unknownDomainRegex } },
      { name: { $regex: /[.]{2,}|[^a-zA-Z0-9\s.-]/ } },
    ],
  });

  return suspectedUsers;
};

const generateUsername = async () => {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";

  let username = "";
  for (let i = 0; i < 6; i++) {
    username += chars[Math.floor(Math.random() * chars.length)];
  }
  username += numbers[Math.floor(Math.random() * numbers.length)];
  username = username
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
  return username;
};

const extractName = async (email) => {
  if (!email || typeof email !== "string") return null;
  return email.split("@")[0];
};

const getActivityLog = async (user, message) => {
  console.info(`${user} ${message}`);
};

const resetSpinLimits = async () => {
  try {
    await User.updateMany(
      {},
      { $set: { dailySpinLimit: 17, freeSpinLimit: 3 } }
    );
  } catch (error) {
    logger.error("Error resetting spin limits", error);
  }
};

export {
  cookieOptions,
  generateOTP,
  getAvailableScratchCard,
  getAvailableTasks,
  sendEmail,
  sendTelegramMessage,
  findSuspectedUser,
  sendToken,
  setAndSendOTP,
  storage,
  generateUsername,
  extractName,
  getActivityLog,
  resetSpinLimits,
};
