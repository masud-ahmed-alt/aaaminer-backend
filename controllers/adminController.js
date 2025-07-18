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
import { findSuspectedUser, getActivityLog, sendEmail, sendTelegramMessage, sendToken, storage } from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";
import TopTenUsers from '../models/TopTenUsers.js';
import { banMailMsg } from '../utils/banMessage.js';
import { unbanMailMsg } from '../utils/unbanMessage.js';
import { compare } from 'bcrypt';
import RedeemCode from '../models/RedeemCode.js';

const activeUsers = new Set();


export const adminProfile = catchAsyncError(async (req, res, next) => {
    const adminId = req.admin
    const profile = await Admin.findById(adminId)
    return res.status(200).json({
        success: true,
        profile
    })
})

export const adminLogin = catchAsyncError(async (req, res, next) => {
    const { adminCode, password } = req.body;
    if (!adminCode) return next(new ErrorHandler("Please enter admin code", 400))
    if (!password) return next(new ErrorHandler("Please enter password", 400))
    const admin = await Admin.findOne({ adminCode }).select("+password")
    if (!admin) return next(new ErrorHandler("Invalid admin code or password", 401))
    const isMatch = await compare(password, admin.password)
    if (!isMatch) return next(new ErrorHandler("Invalid admin code or password", 401))

    sendToken(res, admin, 200, `Welcome  ${admin.adminName}!`)
})

export const adminRegister = catchAsyncError(async (req, res, next) => {
    const { adminCode, adminName, password } = req.body;
    if (!adminCode || !adminName || !password) return next(new ErrorHandler("Please add admin code, adminName and password", 400))
    const admin = await Admin.create({ adminCode, adminName, password })

    if (!admin) return next(new ErrorHandler("Something went wrong", 400))

    res.status(201).json({
        success: true,
        message: "Admin created",
    })
})

export const adminLogout = catchAsyncError(async (req, res, next) => {
    try {
        // Destroy session if it exists
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    return next(err); // Pass the error to the error handler
                }
            });
        }

        // Clear authentication cookie
        res.clearCookie(process.env.COOKIE_NAME, {
            httpOnly: true,
            secure: true,
            sameSite: 'None', // Ensure compatibility with cross-site cookies
        });

        // Send logout response
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        return next(error);
    }
});



export const allUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find()
        .select("name username email walletPoints isverified isBanned createdAt")
        .sort("-createdAt")
    res.status(200).json({
        success: true,
        users
    })
})

export const deleteUser = catchAsyncError(async (req, res, next) => {
    const { id } = req.params
    if (!id) return next(new ErrorHandler("Please provide user id", 400))

    const user = await User.findById(id)
    if (!user) return next(new ErrorHandler("User not found", 404))

    await user.deleteOne()

    res.status(200).json({
        success: true,
        message: "User deleted successfully",
    });
});


export const setupSocketEvents = (io) => {
    io.on('connection', async (socket) => {
       
        try {
            const userCount = await User.countDocuments();
            socket.emit('liveUserCount', {
                success: true,
                users: userCount,
            });
        } catch (error) {
            console.error("Error sending live user count:", error);
        }

        // ✅ Add this connection to the active users
        activeUsers.add(socket.id);
     
        io.emit('liveActiveUserCount', {
            success: true,
            activeUsers: activeUsers.size
        });

        socket.on('getLiveUserCount', async () => {
            const updatedUserCount = await User.countDocuments();
            socket.emit('liveUserCount', {
                success: true,
                users: updatedUserCount,
            });
        });

        socket.on('disconnect', () => {
            activeUsers.delete(socket.id);
            io.emit('liveActiveUserCount', {
                success: true,
                activeUsers: activeUsers.size
            });
        });
    });
};



export const sendAnnouncement = catchAsyncError(async (req, res, next) => {
    const { subject, header, h2, p1, p2, p3, btn_text, btn_url } = req.body;
    const { userType, limit } = req.query;

    // Validate inputs
    if (!userType)
        return next(new ErrorHandler("Please provide userType", 400));
    if (!limit)
        return next(new ErrorHandler("Please specify sending limit", 400));

    if (!["newest", "oldest"].includes(userType))
        return next(new ErrorHandler("Invalid userType: must be 'newest', or 'oldest'", 400));

    if (!subject || !header || !h2 || !p1 || !p2 || !p3 || !btn_text || !btn_url)
        return next(new ErrorHandler("Please provide all required fields: subject, header, h2, p1, p2, p3, btn_text, btn_url", 400));

    let usersQuery = User.find({ isverified: true }).select("name email").limit(limit).lean();

    switch (userType) {
        case "newest":
            usersQuery = usersQuery.sort("-createdAt");
            break;
        case "oldest":
            usersQuery = usersQuery.sort("createdAt");
            break;

    }

    const users = await usersQuery;

    if (!users.length)
        return next(new ErrorHandler("No users found!", 404));

    try {
        await Promise.all(
            users.map(user =>
                sendEmail(
                    user.email,
                    subject,
                    announcementMsg(user.name, header, h2, p1, p2, p3, btn_text,btn_url)
                )
            )
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
    // Get the date for 7 days ago and 12 months ago
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
                day: { $dayOfYear: "$createdAt" }, // Extract the day of the year from createdAt
                year: { $year: "$createdAt" }     // Extract the year from createdAt
            }
        },
        {
            $group: {
                _id: { day: "$day", year: "$year" }, // Group by day and year
                count: { $sum: 1 }                   // Count users per day
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
                year: { $year: "$createdAt" }   // Extract the year from createdAt
            }
        },
        {
            $group: {
                _id: { month: "$month", year: "$year" }, // Group by month and year
                count: { $sum: 1 }                       // Count users per month
            }
        },
        {
            $sort: { "_id.year": 1, "_id.month": 1 }     // Sort by year and month
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
    const formatForChart = (growthData, isDaily, lastLabels) => {
        const labels = [];
        const data = [];

        // Create a map of labels to counts for easier alignment
        const growthMap = new Map(
            growthData.map(item => [
                isDaily ? `${item._id.day}-${item._id.year}` : `${item._id.month}-${item._id.year}`,
                item.count,
            ])
        );

        // Fill the labels and data arrays based on the lastLabels array
        lastLabels.forEach((label, index) => {
            if (isDaily) {
                const dayKey = `${moment().subtract(6 - index, 'days').dayOfYear()}-${moment().year()}`;
                labels.push(label);
                data.push(growthMap.get(dayKey) || 0);
            } else {
                const date = moment().subtract(11 - index, 'months');
                const monthKey = `${date.month() + 1}-${date.year()}`;
                labels.push(label);
                data.push(growthMap.get(monthKey) || 0);
            }
        });

        return { labels, data };
    };

    // Format daily and monthly growth data
    const dailyChartData = formatForChart(dailyGrowth, true, last7Days);
    const monthlyChartData = formatForChart(monthlyGrowth, false, last12Months);

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

export const getSuspectedUser = catchAsyncError(async (req, res, next) => {

    const suspectedUsers = await findSuspectedUser()

    res.status(200).json({
        success: true,
        count: suspectedUsers.length,
        users: suspectedUsers,
    });
});

export const getBannedUser = catchAsyncError(async (req, res, next) => {

    const bannedUsers = await User.find({
        isBanned: true
    });

    res.status(200).json({
        success: true,
        count: bannedUsers.length,
        users: bannedUsers,
    });
});

export const userBanActions = catchAsyncError(async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { action } = req.body;

        if (!userId)
            return next(new ErrorHandler("User ID is required", 400));

        if (!["ban", "unban"].includes(action))
            return next(new ErrorHandler("Please enter a valid action [eg: ban, unban]", 400));

        const user = await User.findById(userId);
        if (!user)
            return next(new ErrorHandler("User not found", 404));

        const shouldBan = action === "ban";
        if (user.isBanned === shouldBan)
            return next(new ErrorHandler(`User is already ${shouldBan ? "banned" : "unbanned"}`, 400));

        user.isBanned = shouldBan;
        await user.save();


        try {
            const subject = shouldBan ? "Account Suspension" : "Account Unbanned";
            const message = shouldBan ? banMailMsg(user.name) : unbanMailMsg(user.name);
            await sendEmail(user.email, subject, message);
        } catch (emailError) {
            console.error("Failed to send email:", emailError);
        }

        res.status(200).json({
            success: true,
            message: `User successfully ${shouldBan ? "banned" : "unbanned"}`,
        });
    } catch (error) {
        next(error);
    }
});


export const withdrawHistory = catchAsyncError(async (req, res, next) => {
    const { status } = req.query;
    if (!status) return next(new ErrorHandler("Please select withdraw status. e.g: [success, processing, rejected]"));


    const validStatuses = ["processing", "success", "rejected"];
    if (!validStatuses.includes(status)) {
        return next(new ErrorHandler(`Invalid status. Valid options are: ${validStatuses.join(', ')}`));
    }

    const withdraws = await Withdraw.find({ status })
        .populate("user", "name username country")

    res.status(200).json({
        success: true,
        withdraw: withdraws,
    });
});

export const withdrawRequestActions = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        return next(new ErrorHandler("Please select withdraw id", 400));
    }
    const { action, couponCode } = req.body;
    if (!["accept", "reject"].includes(action)) {
        return next(new ErrorHandler("Please select a valid action [eg: accept, reject]", 400));
    }
    const withdraw = await Withdraw.findById(id);

    if (!withdraw) {
        return next(new ErrorHandler("Withdraw request not found", 404));
    }
    if (action === "reject") {
        if (withdraw.status === "rejected")
            return next(new ErrorHandler("Withdraw request already rejected", 400));
        const user = await User.findById(withdraw.user)
        user.walletPoints += withdraw.points
        withdraw.status = "rejected";
        withdraw.voucher = "";
        await withdraw.save()
        await user.save()
        return res.status(200).json({
            success: true,
            message: "Withdraw request rejected",
        });
    }
    if (action === "accept") {
        if (withdraw.status === "success")
            return next(new ErrorHandler("Withdraw request already accepted", 400));

        if (!couponCode || couponCode.trim() === "") {
            return next(new ErrorHandler("Please input a valid coupon value", 400));
        }
        withdraw.voucher = couponCode.trim();
        withdraw.status = "success";
        await withdraw.save();

        return res.status(200).json({
            success: true,
            message: "Withdraw request accepted",
        });
    }
});


export const bulkRedeemAction = catchAsyncError(async (req, res, next) => {
  const requests = req.body;

  if (!Array.isArray(requests) || requests.length === 0) {
    return next(new ErrorHandler("No data provided", 400));
  }

  const ids = requests
    .map((item) => item.request_id)
    .filter((id) => id);

  // Fetch all relevant withdraws and populate user
  const withdraws = await Withdraw.find({ _id: { $in: ids } }).populate({
    path: 'user',
    select: 'inreview'
  });

  // Map all withdraws regardless of user review status
  const withdrawMap = new Map();
  for (const w of withdraws) {
    withdrawMap.set(w._id.toString(), w);
  }

  const results = [];
  const bulkOps = [];

  for (const item of requests) {
    const { request_id, giftCode } = item;

    if (!request_id || !giftCode || giftCode.trim() === "") {
      results.push({ request_id, status: "failed", message: "Invalid ID or giftCode" });
      continue;
    }

    const withdraw = withdrawMap.get(request_id);

    if (!withdraw) {
      results.push({ request_id, status: "failed", message: "Withdraw not found" });
      continue;
    }

    if (!withdraw.user || withdraw.user.inreview === true) {
      results.push({ request_id, status: "failed", message: "User under review" });
      continue;
    }

    if (withdraw.status === "success") {
      results.push({ request_id, status: "skipped", message: "Already accepted" });
      continue;
    }

    // Queue update
    bulkOps.push({
      updateOne: {
        filter: { _id: request_id },
        update: {
          $set: {
            voucher: giftCode.trim(),
            status: "success",
          },
        },
      },
    });

    results.push({ request_id, status: "success", message: "Queued for update" });
  }

  if (bulkOps.length > 0) {
    await Withdraw.bulkWrite(bulkOps);
  }

  return res.status(200).json({
    success: true,
    message: "Bulk redeem complete",
    results,
  });
});





export const setTopTenUser = catchAsyncError(async (req, res, next) => {
    await TopTenUsers.deleteMany();
    const topTenUsers = await User.find({
        walletPoints: { $gt: 10000 },
        isBanned: false,
        isverified: true,
    })
        .select("_id username")
        .sort({ walletPoints: -1 })
        .limit(10);

    if (topTenUsers.length > 0) {
        const topTenUsersData = topTenUsers.map(user => ({ user: user._id }));
        await TopTenUsers.insertMany(topTenUsersData);
    }
    // Build Telegram message
    let message =
        "🎉 <b>Big Congratulations to Our Top Performers!</b>\n\n" +
        "🔥 The <b>Top 10 Users</b> of the week have been officially announced!\n\n" +
        "👏 These outstanding individuals have earned their spot through dedication and high wallet points.\n\n" +
        "Here’s the leaderboard:\n\n";


    topTenUsers.forEach((user, index) => {
        message += `${index + 1}. ${(user.username).toUpperCase()} \n`;
    });

    sendTelegramMessage(message)
    res.status(200).json({
        success: true,
        message: "Top 10 users created!"
    });
});



export const scanUser = async () => {
    const users = await findSuspectedUser();

    for (const user of users) {
        user.isBanned = true;
        await user.save();
        console.log(`${user.name} ban status ${user.isBanned} updated`);
    }
}


export const withdrawRequestDelete = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return next(new ErrorHandler("Please select redeem ID", 400));
    }

    const result = await Withdraw.findByIdAndDelete(id);

    if (!result) {
        return next(new ErrorHandler("Request not found.", 404));
    }

    res.status(200).json({
        success: true,
        message: "Withdraw request deleted successfully."
    });
});


export const addRedeemCode = catchAsyncError(async (req, res, next) => {
  const redeemCodeList = req.body;

  if (!Array.isArray(redeemCodeList) || redeemCodeList.length === 0) {
    return next(new ErrorHandler("Request body must be a non-empty array of redeem codes", 400));
  }

  const codeDocs = [];

  for (const item of redeemCodeList) {
    const { redeemCode, amount } = item;

    if (!redeemCode || redeemCode.trim() === "" || !amount || isNaN(amount)) {
      return next(
        new ErrorHandler("Each item must contain a valid redeemCode and numeric amount", 400)
      );
    }

    codeDocs.push({
      code: redeemCode.trim(),
      amount: Number(amount),
    });
  }

  const insertedCodes = await RedeemCode.insertMany(codeDocs);

  res.status(201).json({
    success: true,
    message: `${insertedCodes.length} redeem code(s) added successfully`,
  });
});