import { catchAsyncError } from "../middlewares/errorMiddleware.js";
import Admin from "../models/Admin.js";
import { sendToken } from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";
import User from "../models/User.js"
import Withdraw from "../models/Withdraw.js";


export const adminLogin = catchAsyncError(async (req, res, next) => {
    const { adminCode } = req.body;
    if (!adminCode) return next(new ErrorHandler("Please add admin code", 400))
    const admin = await Admin.findOne({ adminCode })

    if (!admin) return next(new ErrorHandler("Unknown admin", 401))

    sendToken(res, admin, 200, `Welcome  ${admin.adminName}!`)
})

export const adminRegister = catchAsyncError(async (req, res, next) => {
    const { adminCode, adminName } = req.body;
    if (!adminCode || !adminName) return next(new ErrorHandler("Please add admin code and adminName", 400))
    const admin = await Admin.create({ adminCode, adminName })

    if (!admin) return next(new ErrorHandler("Something went wrong", 400))

    res.status(201).json({
        success: true,
        message: "Admin created"
    })
})

export const allUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find()
        .select("name username email walletPoints isverified createdAt")
        .sort("-createdAt")
    res.status(200).json({
        success: true,
        users
    })
})

export const withdrawHistory = catchAsyncError(async (req, res, next) => {

    const { status } = req.query
    let withdraw = []

    if (!status) return next(new ErrorHandler("Please select withdraw status. e.g: [success, processing, rejected]"))
    if (status === "processing")
        withdraw = await Withdraw.find({ status: "processing" })
    if (status === "success")
        withdraw = await Withdraw.find({ status: "success" })
    if (status === "rejected")
        withdraw = await Withdraw.find({ status: "rejected" })

    res.status(200).json({
        success: true,
        withdraw
    })
})


export const setupSocketEvents = (io) => {
    io.on('connection', async (socket) => {
        console.log('New client connected:', socket.id);

        // Emit current user count immediately after connection
        const userCount = await User.countDocuments();
        socket.emit('liveUserCount', {
            success: true,
            users: userCount,
        });

        // Handle further user count updates when new users register
        socket.on('getLiveUserCount', async () => {
            const updatedUserCount = await User.countDocuments();
            socket.emit('liveUserCount', {
                success: true,
                users: updatedUserCount,
            });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};



