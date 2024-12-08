import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';
import Task from "../models/Task.js";
import { getMessage } from "./message.js";
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

const generateOTP = () => {
    return Math.random().toString().slice(2, 2 + 6);
}

const setAndSendOTP = async (user, subject) => {
    const otp = generateOTP()
    const message = getMessage(subject, user.name, otp)
    user.emailOTP = otp
    user.otpExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();
    await sendEmail(user.email, subject, message)
}

export {
    cookieOptions, generateOTP, getAvailableTasks, sendEmail, sendToken, setAndSendOTP
};
