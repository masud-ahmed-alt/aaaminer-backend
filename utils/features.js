import fs from 'fs';
import jwt from "jsonwebtoken";
import multer from 'multer';
import TelegramBot from "node-telegram-bot-api";
import nodemailer from 'nodemailer';
import ScratchCard from "../models/ScratchCard.js";
import Task from "../models/Task.js";
import { getOTPMessage } from "./otpMessage.js";
import User from '../models/User.js';

const cookieOptions = {
    maxAge: 15 * 24 * 60 * 60 * 100,
    sameSite: "none",
    httpOnly: true,
    secure: true
}
const sendToken = (resp, user, code, message) => {
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET)
    return resp.status(code).cookie(process.env.COOKIE_NAME, token, cookieOptions).json({
        success: true,
        user: userWithoutPassword,
        token,
        message,
    })
}

const sendEmail = async (email, subject, htmlContent, next) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        // service: process.env.SMTP_SERVICE,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: email,
        subject: subject,
        html: htmlContent,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
        return new Error('Failed to send email');
    }
};

const getAvailableTasks = async (userId) => {
    return await Task.find({ completedBy: { $ne: userId } }).select("-completedBy").sort({ "createdAt": +1 })
};

const getAvailableScratchCard = async (userId) => {
    return await ScratchCard.find({ completedBy: { $ne: userId } }).select("-completedBy")
}

const generateOTP = () => {
    return Math.random().toString().slice(2, 2 + 6);
}

const setAndSendOTP = async (user, subject) => {
    const otp = generateOTP()
    const message = getOTPMessage(subject, user.name, otp)
    user.emailOTP = otp
    user.otpExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();
    await sendEmail(user.email, subject, message)
}

const getUploadPath = (type) => {
    const baseDir = 'uploads/';
    const subDir = `${baseDir}${type}/`;
    if (!fs.existsSync(subDir)) {
        fs.mkdirSync(subDir, { recursive: true });
    }
    return subDir;
};

const storage = (type) => multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = getUploadPath(type || 'general');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const sendTelegramMessage = (message, imagePath) => {
    const token = process.env.TEL_BOT_TOKEN
    const chatId = process.env.CHAT_ID
    const bot = new TelegramBot(token, { polling: false })

    // Check if the file exists
    if (!fs.existsSync(imagePath)) {
        console.error('Image file not found:', imagePath)
        return;
    }

    // Send the image with a caption
    bot.sendPhoto(chatId, fs.createReadStream(imagePath), { caption: message })
        .then(() => {
            console.log('Telegram message sent successfully')
        })
        .catch((error) => {
            console.error('Error telegram sending message:', error);
        })
}

const findSuspectedUser = async ()=>{
    const knownDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'live.com'];

    const extraDotsRegex = /^[^.]+(\.{2,})[^@]+@/; 
    const tooManySegmentsRegex = /^[^.]+(\.[^.]+){2,}@/; 
    const unknownDomainRegex = new RegExp(`@(?!(${knownDomains.join('|')})$).*`, 'i'); 

  
    const nameWithExtraDotsRegex = /(\.{2,})/; 
    const nameTooManySegmentsRegex = /(\.[^.]+){2,}/; 
    const nameNonAlphanumericRegex = /[^a-zA-Z0-9\s.-]/; 

  
    const suspectedUsers = await User.find({
        $or: [
          
            { email: { $regex: extraDotsRegex } },
            { email: { $regex: tooManySegmentsRegex } }, 
            { email: { $regex: unknownDomainRegex } }, 

       
            { name: { $regex: nameWithExtraDotsRegex } }, 
            { name: { $regex: nameTooManySegmentsRegex } },
            { name: { $regex: nameNonAlphanumericRegex } }, 
        ]
    });

    return suspectedUsers
}

export {
    cookieOptions, generateOTP,
    getAvailableScratchCard,
    getAvailableTasks, sendEmail,
    sendTelegramMessage,
    findSuspectedUser,
    sendToken, setAndSendOTP, storage
};

