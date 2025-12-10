import fs from "fs";
import jwt from "jsonwebtoken";
import multer from "multer";
import TelegramBot from "node-telegram-bot-api";
import nodemailer from "nodemailer";
import ScratchCard from "../models/ScratchCard.js";
import Task from "../models/Task.js";
import { getOTPMessage } from "./otpMessage.js";
import User from "../models/User.js";

const cookieOptions = {
  // milliseconds: 15 days
  maxAge: 15 * 24 * 60 * 60 * 1000,
  sameSite: "none",
  httpOnly: true,
  secure: true,
};

const sendToken = (resp, user, code, message) => {
  try {
    // Validate user object
    if (!user || !user._id) {
      throw new Error("Invalid user object: missing user or user._id");
    }

    // Convert user to object safely
    const userWithoutPassword = user.toObject ? user.toObject() : { ...user };
    delete userWithoutPassword.password;

    // Validate JWT_SECRET
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    // Create JWT
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Validate COOKIE_NAME
    if (!process.env.COOKIE_NAME) {
      throw new Error("COOKIE_NAME is not defined in environment variables");
    }

    // Send token both as cookie (for browser) and JSON (for mobile apps)
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
    console.error("Error in sendToken:", error);
    throw error; // Re-throw to be caught by error middleware
  }
};

const sendEmail = async (email, subject, htmlContent, next) => {
  // Build transporter config
  const transporterConfig = {
    host: process.env.SMTP_HOST,
    service: process.env.SMTP_SERVICE,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  };

  // Only add DKIM if all required variables are present
  const domain = process.env.DOMAIN || (process.env.SMTP_MAIL ? process.env.SMTP_MAIL.split('@')[1] : null);
  const keySelector = process.env.KEY_SELECTOR;
  const privateKey = process.env.DKIM_PRIVATE_KEY;

  if (domain && keySelector && privateKey && privateKey.trim()) {
    transporterConfig.dkim = {
      domainName: domain,
      keySelector: keySelector,
      privateKey: privateKey.replace(/\\n/g, '\n'), // Handle newlines in private key
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
    console.error(error);
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
    // Check if the file exists
    if (!fs.existsSync(imagePath)) {
      console.error("Image file not found:", imagePath);
      return;
    }

    // Send the image with a caption
    bot
      .sendPhoto(chatId, fs.createReadStream(imagePath), { caption: message })
      .then(() => {
        console.log("Telegram image message sent successfully");
      })
      .catch((error) => {
        console.error("Error sending telegram image message:", error);
      });
  } else {
    // Send a text message only
    bot
      .sendMessage(chatId, message, { parse_mode: "HTML" })
      .then(() => {
        console.log("Telegram text message sent successfully");
      })
      .catch((error) => {
        console.error("Error sending telegram text message:", error);
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

  // More robust regex for suspicious email patterns
  const suspiciousEmailRegex = new RegExp(
    `^(?:[^@\\s]+(?:\\.[^@\\s]+)*|"(?:[^"\\\\]|\\\\.)*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|(?:\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\]))$`,
    "i"
  );

  // Regex to detect multiple dots or special characters in username part
  const usernameSuspicionRegex = /[.]{2,}|[^\w.@-]/;

  // Regex to detect non-standard domains
  const unknownDomainRegex = new RegExp(
    `@(?!(${knownDomains.join("|")})$).*`,
    "i"
  );

  const suspectedUsers = await User.find({
    $or: [
      // Users with emails that don't match a standard email pattern
      { email: { $not: suspiciousEmailRegex } },
      // Users with suspicious characters or patterns in the username part of their email
      { email: { $regex: usernameSuspicionRegex } },
      // Users with emails from unknown domains
      { email: { $regex: unknownDomainRegex } },
      // Users with names containing suspicious patterns (e.g., multiple dots, non-alphanumeric)
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
  // Ensure at least one number
  username += numbers[Math.floor(Math.random() * numbers.length)];
  // Shuffle the username to randomize number placement
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
  // Activity logging - can be enhanced with logger utility if needed
  console.info(`${user} ${message}`);
};

const resetSpinLimits = async () => {
  try {
    await User.updateMany(
      {},
      { $set: { dailySpinLimit: 17, freeSpinLimit: 3 } }
    );
    console.log("Spin limits reset successfully for all users.");
  } catch (error) {
    console.error("Error resetting spin limits:", error);
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
