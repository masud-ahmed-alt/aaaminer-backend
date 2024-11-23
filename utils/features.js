import jwt from "jsonwebtoken"
import nodemailer from 'nodemailer';
import Task from "../models/Task.js";
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



const sendEmail = async (email, subject, message) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        service: process.env.SMTP_SERVICE,
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
        text: message,
    };
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
        throw new Error('Failed to send email');
    }
};

const getAvailableTasks = async (userId) => {
    return await Task.find({ completedBy: { $ne: userId } })
};


export {
    sendToken, sendEmail,
    cookieOptions,
    getAvailableTasks
}