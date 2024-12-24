import fs from 'fs';
import moment from 'moment';
import multer from 'multer';
import { catchAsyncError } from "../middlewares/errorMiddleware.js";
import Admin from "../models/Admin.js";
import Carousel from "../models/Carousel.js";
import HomeNotification from "../models/HomeNotification.js";
import User from "../models/User.js";
import Withdraw from "../models/Withdraw.js";
import { announcementMsg } from "../utils/announcementMsg.js";
import { sendEmail, sendToken, storage } from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";
import path from 'path';



export const adminProfile = catchAsyncError(async (req, res, next) => {
    const adminId = req.admin
    const profile = await Admin.findById(adminId)
    return res.status(200).json({
        success: true,
        profile
    })
})

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

export const sendAnnouncementEmail = catchAsyncError(async (req, res, next) => {
    // Fetch verified users
    const users = await User.find({ isverified: true }).select("name email");

    if (!users.length) return next(new ErrorHandler("No verified users found!", 404));

    try {
        // Send emails in parallel using Promise.all
        await Promise.all(
            users.map(async (user) => {
                await sendEmail(user.email, "Introducing Scratch Cards !", announcementMsg(user.name));
                // console.log(`Mail sent to ${user.name} at ${user.email}`);
            })
        );

        return res.status(200).json({
            success: true,
            message: "Announcement emails sent successfully!",
        });
    } catch (error) {
        console.error("Error sending emails:", error);
        return next(new ErrorHandler("Failed to send announcement emails.", 500));
    }
});



export const createHomeNotification = catchAsyncError(async (req, res, next) => {
    const { title } = req.body;

    // Validate input
    if (!title) return next(new ErrorHandler("Please provide notification title", 400));

    try {
        // Delete all existing notifications
        await HomeNotification.deleteMany();

        // Insert the new notification
        const notification = await HomeNotification.create({ title });

        if (!notification) {
            return next(new ErrorHandler("Something went wrong!", 400));
        }

        return res.status(201).json({
            success: true,
            message: "Previous notifications deleted, new notification created successfully",
            notification,
        });
    } catch (error) {
        // Handle unexpected errors
        return next(new ErrorHandler(error.message, 500));
    }
});



export const userGrowData = catchAsyncError(async (req, res, next) => {
    // Get the date for 7 days ago
    const sevenDaysAgo = moment().subtract(7, 'days').toDate();
    const twelveMonthsAgo = moment().subtract(12, 'months').toDate();

    // Daily User Growth (group by day)
    const dailyGrowth = await User.aggregate([
        {
            $match: {
                createdAt: { $gte: sevenDaysAgo }, // Filter users created in the last 7 days
            }
        },
        {
            $project: {
                day: { $dayOfYear: "$createdAt" },  // Extract the day of the year from createdAt
                year: { $year: "$createdAt" }  // Extract the year from createdAt
            }
        },
        {
            $group: {
                _id: { day: "$day", year: "$year" }, // Group by day and year
                count: { $sum: 1 } // Count users per day
            }
        },
        {
            $sort: { "_id.year": 1, "_id.day": 1 }  // Sort by year and day
        }
    ]);

    // Monthly User Growth (group by month)
    const monthlyGrowth = await User.aggregate([
        {
            $match: {
                createdAt: { $gte: twelveMonthsAgo }, // Filter users created in the last 12 months
            }
        },
        {
            $project: {
                month: { $month: "$createdAt" }, // Extract the month from createdAt
                year: { $year: "$createdAt" }  // Extract the year from createdAt
            }
        },
        {
            $group: {
                _id: { month: "$month", year: "$year" }, // Group by month and year
                count: { $sum: 1 } // Count users per month
            }
        },
        {
            $sort: { "_id.year": 1, "_id.month": 1 }  // Sort by year and month
        }
    ]);

    // Helper function to get names of days (only day name, e.g., Monday, Tuesday)
    const getDayNames = (daysAgo) => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = moment().subtract(daysAgo - i, 'days');
            days.push(date.format('dddd')); // Only day name (e.g., Monday)
        }
        return days;
    };

    // Helper function to get month names (only month name, e.g., January, February)
    const getMonthNames = () => {
        const months = [];
        for (let i = 0; i < 12; i++) {
            const month = moment().subtract(i, 'months');
            months.push(month.format('MMMM')); // Only month name (e.g., January)
        }
        return months.reverse(); // Reverse to show from most recent to oldest
    };

    // Get the last 7 days and 12 months names
    const last7Days = getDayNames(7);
    const last12Months = getMonthNames();

    // Format the data for the bar chart
    const formatForChart = (growthData, isDaily) => {
        const labels = [];
        const data = [];

        growthData.forEach(item => {
            const label = isDaily ? `${item._id.day}` : `${item._id.month}`; // Use only the day or month name
            labels.push(label);
            data.push(item.count);
        });

        return { labels, data };
    };

    // Format daily and monthly growth data
    const dailyChartData = formatForChart(dailyGrowth, true);
    const monthlyChartData = formatForChart(monthlyGrowth, false);

    // Return both daily and monthly growth data in chart format
    res.status(200).json({
        success: true,
        dailyGrowth: dailyChartData,
        monthlyGrowth: monthlyChartData,
        last7Days,
        last12Months
    });
});


export const getSingleUser = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        return next(new ErrorHandler("User not found", 404))
    }
    const referralUser = await User.find({ referredBy: user.id })
    const referredBy = await User.findById(user.referredBy)
    return res.status(200).json({
        success: true,
        user,
        referredBy,
        referralUser
    });
});


export const uploadCarousalImage = catchAsyncError(async (req, res, next) => {
    const type = "carousal"
    const upload = multer({ storage: storage(type) }).single('image');

    upload(req, res, async (err) => {
        if (err) {
            console.log(err);
            return next(new ErrorHandler(`File upload failed`, 400));
        }
        if (!req.file) {
            return next(new ErrorHandler("No file uploaded", 400));
        }
        const fileUrl = `uploads/${type}/${req.file.filename}`;
        const carousal = new Carousel({ url: fileUrl });
        await carousal.save();

        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
        });
    });
});


export const deleteCarousalImage = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const carousal = await Carousel.findById(id);
    if (!carousal) {
        return next(new ErrorHandler("Carousal not found", 404));
    }
    let filePath = carousal.url;
    fs.unlink(filePath, async (err) => {
        if (err) {
            return next(new ErrorHandler("Failed to delete the file", 500));
        }
        await carousal.deleteOne()
        res.status(200).json({
            success: true,
            message: 'Carousal image deleted successfully',
        });
    });
});

