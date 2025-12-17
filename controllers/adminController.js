import fs from "fs";
import moment from "moment";
import multer from "multer";
import { catchAsyncError } from "../middlewares/errorMiddleware.js";
import Admin from "../models/Admin.js";
import Carousel from "../models/Carousel.js";
import HomeNotification from "../models/HomeNotification.js";
import User from "../models/User.js";
import Withdraw from "../models/Withdraw.js";
import { announcementMsg } from "../utils/announcementMsg.js";
import {
  cookieOptions,
  findSuspectedUser,
  getActivityLog,
  sendEmail,
  sendTelegramMessage,
  sendToken,
  storage,
} from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";
import { banMailMsg } from "../utils/banMessage.js";
import { logger } from "../utils/logger.js";
import { unbanMailMsg } from "../utils/unbanMessage.js";
import bcrypt from "bcryptjs";
import RedeemCode from "../models/RedeemCode.js";
import mongoose from "mongoose";
import { cloudinary, isCloudinaryConfigured } from "../utils/cloudinary.js";

const activeUsers = new Set();

export const adminProfile = catchAsyncError(async (req, res, next) => {
  const adminId = req.admin;
  const profile = await Admin.findById(adminId);
  return res.status(200).json({
    success: true,
    profile,
  });
});

export const adminLogin = catchAsyncError(async (req, res, next) => {
  const { adminCode, password } = req.body;
  if (!adminCode) return next(new ErrorHandler("Please enter admin code", 400));
  if (!password) return next(new ErrorHandler("Please enter password", 400));
  const admin = await Admin.findOne({ adminCode }).select("+password");
  if (!admin)
    return next(new ErrorHandler("Invalid admin code or password", 401));
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch)
    return next(new ErrorHandler("Invalid admin code or password", 401));

  // Handle case where admin.adminName might be undefined
  const welcomeMessage = admin.adminName ? `Welcome  ${admin.adminName}!` : "Welcome!";
  try {
    sendToken(res, admin, 200, welcomeMessage);
  } catch (error) {
    return next(new ErrorHandler("Failed to generate authentication token", 500));
  }
});

export const adminRegister = catchAsyncError(async (req, res, next) => {
  const { adminCode, adminName, password } = req.body;
  if (!adminCode || !adminName || !password)
    return next(
      new ErrorHandler("Please add admin code, adminName and password", 400)
    );
  const admin = await Admin.create({ adminCode, adminName, password });

  if (!admin) return next(new ErrorHandler("Something went wrong", 400));

  res.status(201).json({
    success: true,
    message: "Admin created",
  });
});

export const adminLogout = catchAsyncError(async (req, res, next) => {
  try {
    // Destroy session if it exists
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
      });
    }

    // Clear authentication cookie with matching options from sendToken
    res.clearCookie(process.env.COOKIE_NAME, cookieOptions);

    // Send logout response
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return next(error);
  }
});

export const allUsers = catchAsyncError(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const skip = (page - 1) * limit;

  // Search parameter
  const search = req.query.search ? req.query.search.trim() : "";

  // Build search filter
  const searchFilter = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  // Get total count with filter
  const totalUsers = await User.countDocuments(searchFilter);

  // Fetch users with filter
  const users = await User.find(searchFilter)
    .select(
      "name username email walletPoints isverified isBanned country inreview createdAt"
    )
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    totalUsers,
    currentPage: page,
    totalPages: Math.ceil(totalUsers / limit),
    users,
  });
});

export const updateUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { name, username, email, phone, country, walletPoints, wallet, isverified, isBanned, inreview, freeSpinLimit, dailySpinLimit } = req.body;

  if (!id) return next(new ErrorHandler("Please provide user id", 400));

  const user = await User.findById(id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  // Update fields if provided
  if (name !== undefined) user.name = name;
  if (username !== undefined) user.username = username;
  if (email !== undefined) {
    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: id } });
    if (existingUser) {
      return next(new ErrorHandler("Email already exists", 400));
    }
    user.email = email;
  }
  if (phone !== undefined) user.phone = phone;
  if (country !== undefined) user.country = country;
  if (walletPoints !== undefined) user.walletPoints = Number(walletPoints);
  if (wallet !== undefined) user.wallet = Number(wallet);
  if (isverified !== undefined) user.isverified = Boolean(isverified);
  if (isBanned !== undefined) user.isBanned = Boolean(isBanned);
  if (inreview !== undefined) user.inreview = Boolean(inreview);
  if (freeSpinLimit !== undefined) user.freeSpinLimit = Number(freeSpinLimit);
  if (dailySpinLimit !== undefined) user.dailySpinLimit = Number(dailySpinLimit);

  await user.save();

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user,
  });
});

export const deleteUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new ErrorHandler("Please provide user id", 400));

  const user = await User.findById(id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

export const setupSocketEvents = (io) => {
  io.on("connection", async (socket) => {
    try {
      const userCount = await User.countDocuments();
      socket.emit("liveUserCount", {
        success: true,
        users: userCount,
      });
    } catch (error) {
      console.error("Error sending live user count:", error);
    }

    // ✅ Add this connection to the active users
    activeUsers.add(socket.id);

    io.emit("liveActiveUserCount", {
      success: true,
      activeUsers: activeUsers.size,
    });

    socket.on("getLiveUserCount", async () => {
      const updatedUserCount = await User.countDocuments();
      socket.emit("liveUserCount", {
        success: true,
        users: updatedUserCount,
      });
    });

    socket.on("disconnect", () => {
      activeUsers.delete(socket.id);
      io.emit("liveActiveUserCount", {
        success: true,
        activeUsers: activeUsers.size,
      });
    });
  });
};

export const sendAnnouncement = catchAsyncError(async (req, res, next) => {
  const { subject, header, h2, p1, p2, p3, btn_text, btn_url } = req.body;
  const { userType, limit } = req.query;

  // Validate inputs
  if (!userType) return next(new ErrorHandler("Please provide userType", 400));
  if (!limit)
    return next(new ErrorHandler("Please specify sending limit", 400));

  if (!["newest", "oldest"].includes(userType))
    return next(
      new ErrorHandler("Invalid userType: must be 'newest', or 'oldest'", 400)
    );

  if (!subject || !header || !h2 || !p1 || !p2 || !p3 || !btn_text || !btn_url)
    return next(
      new ErrorHandler(
        "Please provide all required fields: subject, header, h2, p1, p2, p3, btn_text, btn_url",
        400
      )
    );

  let usersQuery = User.find({ isverified: true })
    .select("name email")
    .limit(limit)
    .lean();

  switch (userType) {
    case "newest":
      usersQuery = usersQuery.sort("-createdAt");
      break;
    case "oldest":
      usersQuery = usersQuery.sort("createdAt");
      break;
  }

  const users = await usersQuery;

  if (!users.length) return next(new ErrorHandler("No users found!", 404));

  try {
    await Promise.all(
      users.map((user) =>
        sendEmail(
          user.email,
          subject,
          announcementMsg(user.name, header, h2, p1, p2, p3, btn_text, btn_url)
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

export const createHomeNotification = catchAsyncError(
  async (req, res, next) => {
    const { title } = req.body;

    // Validate input
    if (!title)
      return next(new ErrorHandler("Please provide notification title", 400));

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
        message:
          "Previous notifications deleted, new notification created successfully",
        notification,
      });
    } catch (error) {
      // Handle unexpected errors
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const userGrowData = catchAsyncError(async (req, res, next) => {
  // Get the date for 7 days ago and 12 months ago
  const sevenDaysAgo = moment().subtract(7, "days").toDate();
  const twelveMonthsAgo = moment().subtract(12, "months").toDate();

  // Daily User Growth (group by day)
  const dailyGrowth = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo }, // Filter users created in the last 7 days
      },
    },
    {
      $project: {
        day: { $dayOfYear: "$createdAt" }, // Extract the day of the year from createdAt
        year: { $year: "$createdAt" }, // Extract the year from createdAt
      },
    },
    {
      $group: {
        _id: { day: "$day", year: "$year" }, // Group by day and year
        count: { $sum: 1 }, // Count users per day
      },
    },
    {
      $sort: { "_id.year": 1, "_id.day": 1 }, // Sort by year and day
    },
  ]);

  // Monthly User Growth (group by month)
  const monthlyGrowth = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: twelveMonthsAgo }, // Filter users created in the last 12 months
      },
    },
    {
      $project: {
        month: { $month: "$createdAt" }, // Extract the month from createdAt
        year: { $year: "$createdAt" }, // Extract the year from createdAt
      },
    },
    {
      $group: {
        _id: { month: "$month", year: "$year" }, // Group by month and year
        count: { $sum: 1 }, // Count users per month
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 }, // Sort by year and month
    },
  ]);

  // Helper function to get names of days (only day name, e.g., Monday, Tuesday)
  const getDayNames = (daysAgo) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = moment().subtract(daysAgo - i, "days");
      days.push(date.format("dddd")); // Only day name (e.g., Monday)
    }
    return days;
  };

  // Helper function to get month names (only month name, e.g., January, February)
  const getMonthNames = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const month = moment().subtract(i, "months");
      months.push(month.format("MMMM")); // Only month name (e.g., January)
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
      growthData.map((item) => [
        isDaily
          ? `${item._id.day}-${item._id.year}`
          : `${item._id.month}-${item._id.year}`,
        item.count,
      ])
    );

    // Fill the labels and data arrays based on the lastLabels array
    lastLabels.forEach((label, index) => {
      if (isDaily) {
        const dayKey = `${moment()
          .subtract(6 - index, "days")
          .dayOfYear()}-${moment().year()}`;
        labels.push(label);
        data.push(growthMap.get(dayKey) || 0);
      } else {
        const date = moment().subtract(11 - index, "months");
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
    last12Months,
  });
});

export const getSingleUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  const referralUser = await User.find({ referredBy: user.id });
  const referredBy = await User.findById(user.referredBy);
  return res.status(200).json({
    success: true,
    user,
    referredBy,
    referralUser,
  });
});

export const getCarousalImages = catchAsyncError(async (req, res, next) => {
  const carousal = await Carousel.find().select("url _id createdAt").sort("-createdAt");
  
  const host = req.get("host");
  const hostname = host.split(":")[0];
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  const isIp = /^[0-9.]+$/.test(hostname);
  const baseUrl = `${req.protocol}://${host}${isLocal || isIp ? "/" : "/api/"}`;
  
  const updatedCarousal = carousal.map((item) => ({
    _id: item._id,
    url: /^https?:\/\//i.test(item.url) ? item.url : `${baseUrl}${item.url}`,
    createdAt: item.createdAt,
  }));

  res.status(200).json({
    success: true,
    carousel: updatedCarousal,
  });
});

export const uploadCarousalImage = catchAsyncError(async (req, res, next) => {
  const type = "carousal";
  const upload = multer({ storage: storage(type) }).single("image");

  upload(req, res, async (err) => {
    if (err) {
      logger.error("File upload failed", err);
      return next(new ErrorHandler(`File upload failed`, 400));
    }
    if (!req.file) {
      return next(new ErrorHandler("No file uploaded", 400));
    }

    // Default to local file URL
    const localFilePath = `uploads/${type}/${req.file.filename}`;
    let finalUrl = localFilePath;
    let publicId = null;

    // If Cloudinary is configured, upload the file there
    if (isCloudinaryConfigured) {
      try {
        const folder =
          process.env.CLOUDINARY_CAROUSAL_FOLDER ||
          process.env.CLOUDINARY_FOLDER ||
          "carousal";

        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder,
        });

        finalUrl = uploadResult.secure_url;
        publicId = uploadResult.public_id;

        // Clean up local file after successful Cloudinary upload
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) {
            logger.warn("Failed to delete local carousel image after Cloudinary upload", unlinkErr);
          }
        });
      } catch (cloudErr) {
        logger.error("Cloudinary upload failed, falling back to local file storage", cloudErr);
        // Keep using localFilePath in case of failure
      }
    }

    const carousal = new Carousel({ url: finalUrl, publicId });
    await carousal.save();

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
    });
  });
});

export const deleteCarousalImage = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const carousal = await Carousel.findById(id);
  if (!carousal) {
    return next(new ErrorHandler("Carousal not found", 404));
  }

  const url = carousal.url || "";
  const isRemote = /^https?:\/\//i.test(url);

  // If the image was stored in Cloudinary, try to delete it there first
  if (carousal.publicId && isCloudinaryConfigured) {
    try {
      await cloudinary.uploader.destroy(carousal.publicId);
    } catch (cloudErr) {
      // Log but don't block deletion if Cloudinary fails
      logger.error("Failed to delete carousel image from Cloudinary", cloudErr);
    }
  }

  // For locally stored images, also remove the file from disk
  if (!isRemote && url) {
    fs.unlink(url, async (err) => {
      if (err && err.code !== "ENOENT") {
        return next(new ErrorHandler("Failed to delete the file", 500));
      }

      await carousal.deleteOne();
      res.status(200).json({
        success: true,
        message: "Carousal image deleted successfully",
      });
    });
    return;
  }

  // If there is no local file (e.g., Cloudinary-only), just remove the DB record
  await carousal.deleteOne();
  res.status(200).json({
    success: true,
    message: "Carousal image deleted successfully",
  });
});

export const getSuspectedUser = catchAsyncError(async (req, res, next) => {
  const suspectedUsers = await findSuspectedUser();

  res.status(200).json({
    success: true,
    count: suspectedUsers.length,
    users: suspectedUsers,
  });
});

export const getBannedUser = catchAsyncError(async (req, res, next) => {
  const bannedUsers = await User.find({
    isBanned: true,
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

    if (!userId) return next(new ErrorHandler("User ID is required", 400));

    if (!["ban", "unban"].includes(action))
      return next(
        new ErrorHandler("Please enter a valid action [eg: ban, unban]", 400)
      );

    const user = await User.findById(userId);
    if (!user) return next(new ErrorHandler("User not found", 404));

    const shouldBan = action === "ban";
    if (user.isBanned === shouldBan)
      return next(
        new ErrorHandler(
          `User is already ${shouldBan ? "banned" : "unbanned"}`,
          400
        )
      );

    user.isBanned = shouldBan;
    await user.save();

    try {
      const subject = shouldBan ? "Account Suspension" : "Account Unbanned";
      const message = shouldBan
        ? banMailMsg(user.name)
        : unbanMailMsg(user.name);
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

export const userReviewActions = catchAsyncError(async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { action } = req.body;

    if (!userId) return next(new ErrorHandler("User ID is required", 400));

    if (!["hold", "unhold"].includes(action))
      return next(
        new ErrorHandler("Please enter a valid action [eg: hold, unhold]", 400)
      );

    const user = await User.findById(userId);
    if (!user) return next(new ErrorHandler("User not found", 404));

    const shouldHold = action === "hold";

    if (user.inreview === shouldHold)
      return next(
        new ErrorHandler(
          `User is already ${shouldHold ? "on hold" : "not on hold"}`,
          400
        )
      );

    user.inreview = shouldHold;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User is now ${shouldHold ? "on hold" : "no longer on hold"}`,
    });
  } catch (error) {
    next(error);
  }
});

export const withdrawHistory = catchAsyncError(async (req, res, next) => {
  const { status } = req.query;
  if (!status)
    return next(
      new ErrorHandler(
        "Please select withdraw status. e.g: [success, processing, rejected]"
      )
    );

  const validStatuses = ["processing", "success", "rejected"];
  if (!validStatuses.includes(status)) {
    return next(
      new ErrorHandler(
        `Invalid status. Valid options are: ${validStatuses.join(", ")}`
      )
    );
  }

  const withdraws = await Withdraw.find({ status }).populate(
    "user",
    "name username country isBanned inreview"
  );

  res.status(200).json({
    success: true,
    withdraw: withdraws,
  });
});

export const withdrawRequestActions = catchAsyncError(
  async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
      return next(new ErrorHandler("Please select withdraw id", 400));
    }
    const { action, couponCode } = req.body;
    if (!["accept", "reject"].includes(action)) {
      return next(
        new ErrorHandler(
          "Please select a valid action [eg: accept, reject]",
          400
        )
      );
    }
    const withdraw = await Withdraw.findById(id);

    if (!withdraw) {
      return next(new ErrorHandler("Withdraw request not found", 404));
    }
    if (action === "reject") {
      if (withdraw.status === "rejected")
        return next(new ErrorHandler("Withdraw request already rejected", 400));
      const user = await User.findById(withdraw.user);
      user.walletPoints += withdraw.points;
      withdraw.status = "rejected";
      withdraw.voucher = "";
      await withdraw.save();
      await user.save();
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
  }
);

export const bulkRedeemAction = catchAsyncError(async (req, res, next) => {
  const { codes, amount, country, redeemType } = req.body;

  // Validate required filters
  if (!amount || !country || !redeemType) {
    return next(new ErrorHandler("Amount, country, and redeem type are required", 400));
  }

  if (!Array.isArray(codes) || codes.length === 0) {
    return next(new ErrorHandler("No codes provided", 400));
  }

  // Find matching withdrawal requests based on filters
  const withdraws = await Withdraw.find({
    status: "processing",
    amount: Number(amount),
    redeemOption: { $regex: redeemType, $options: "i" },
  }).populate({
    path: "user",
    select: "inreview isBanned country",
    match: { country: { $regex: country, $options: "i" } },
  });

  // Filter for genuine users (not banned, not in review) and matching country
  const validWithdraws = withdraws.filter(
    (w) =>
      w.user &&
      !w.user.isBanned &&
      !w.user.inreview &&
      w.user.country &&
      w.user.country.toLowerCase().includes(country.toLowerCase())
  );

  if (validWithdraws.length < codes.length) {
    return next(
      new ErrorHandler(
        `Only ${validWithdraws.length} matching requests found, but ${codes.length} codes provided`,
        400
      )
    );
  }

  // Map codes to withdrawal requests
  const results = [];
  const bulkOps = [];

  for (let i = 0; i < codes.length; i++) {
    const giftCode = typeof codes[i] === 'string' ? codes[i].trim() : codes[i]?.code?.trim() || codes[i]?.trim();
    const withdraw = validWithdraws[i];

    if (!giftCode || giftCode === "") {
      results.push({
        code: giftCode || `Code ${i + 1}`,
        request_id: withdraw?._id?.toString() || null,
        status: "failed",
        message: "Invalid code",
      });
      continue;
    }

    if (!withdraw) {
      results.push({
        code: giftCode,
        request_id: null,
        status: "failed",
        message: "No matching request found",
      });
      continue;
    }

    if (withdraw.status === "success") {
      results.push({
        code: giftCode,
        request_id: withdraw._id.toString(),
        status: "skipped",
        message: "Already accepted",
      });
      continue;
    }

    // Queue update
    bulkOps.push({
      updateOne: {
        filter: { _id: withdraw._id },
        update: {
          $set: {
            voucher: giftCode,
            status: "success",
          },
        },
      },
    });

    results.push({
      code: giftCode,
      request_id: withdraw._id.toString(),
      status: "success",
      message: "Queued for update",
    });
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

// Legacy endpoint for backward compatibility
export const bulkRedeemActionLegacy = catchAsyncError(async (req, res, next) => {
  const requests = req.body;

  if (!Array.isArray(requests) || requests.length === 0) {
    return next(new ErrorHandler("No data provided", 400));
  }

  const ids = requests.map((item) => item.request_id).filter((id) => id);

  // Fetch all relevant withdraws and populate user with full details for filtering
  const withdraws = await Withdraw.find({ _id: { $in: ids } }).populate({
    path: "user",
    select: "inreview isBanned country",
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
      results.push({
        request_id,
        status: "failed",
        message: "Invalid ID or giftCode",
      });
      continue;
    }

    const withdraw = withdrawMap.get(request_id);

    if (!withdraw) {
      results.push({
        request_id,
        status: "failed",
        message: "Withdraw not found",
      });
      continue;
    }

    // Check if user is genuine (not banned and not in review)
    if (!withdraw.user || withdraw.user.inreview === true || withdraw.user.isBanned === true) {
      results.push({
        request_id,
        status: "failed",
        message: withdraw.user?.isBanned ? "User is banned" : "User under review",
      });
      continue;
    }

    if (withdraw.status === "success") {
      results.push({
        request_id,
        status: "skipped",
        message: "Already accepted",
      });
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

    results.push({
      request_id,
      status: "success",
      message: "Queued for update",
    });
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


export const withdrawRequestDelete = catchAsyncError(async (req, res, next) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return next(
      new ErrorHandler(
        "Please provide at least one redeem ID in an array.",
        400
      )
    );
  }

  // Validate IDs (optional but recommended)
  const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));

  if (validIds.length === 0) {
    return next(new ErrorHandler("No valid withdraw IDs provided.", 400));
  }

  // Find which IDs actually exist
  const existingDocs = await Withdraw.find({ _id: { $in: validIds } }).select(
    "_id"
  );
  const existingIds = existingDocs.map((doc) => doc._id.toString());

  const notFoundIds = validIds.filter((id) => !existingIds.includes(id));

  // Delete only existing ones
  const result = await Withdraw.deleteMany({ _id: { $in: existingIds } });

  res.status(200).json({
    success: true,
    message: `${result.deletedCount} withdraw request(s) deleted successfully.`,
    deletedCount: result.deletedCount,
    notFoundIds: notFoundIds,
  });
});

export const addRedeemCode = catchAsyncError(async (req, res, next) => {
  const redeemCodeList = req.body;

  if (!Array.isArray(redeemCodeList) || redeemCodeList.length === 0) {
    return next(
      new ErrorHandler(
        "Request body must be a non-empty array of redeem codes",
        400
      )
    );
  }

  const codeDocs = [];

  for (const item of redeemCodeList) {
    const { redeemCode, amount, type } = item;

    if (
      !redeemCode ||
      redeemCode.trim() === "" ||
      !amount ||
      isNaN(amount) ||
      !type ||
      typeof type !== "string" ||
      type.trim() === ""
    ) {
      return next(
        new ErrorHandler(
          "Each item must contain a valid redeemCode, numeric amount, and type: ['0':Amazon Gift Code. '1': Google Play Voucher ]",
          400
        )
      );
    }

    codeDocs.push({
      code: redeemCode.trim(),
      amount: Number(amount),
      type: type.trim(),
    });
  }

  const insertedCodes = await RedeemCode.insertMany(codeDocs);

  res.status(201).json({
    success: true,
    message: `${insertedCodes.length} redeem code(s) added successfully`,
  });
});

/**
 * Improved User Scanning Function
 * Scans users for suspicious patterns and marks them for review
 * Enhanced with better detection logic - marks for review instead of auto-banning
 */
export const scanUser = async () => {
  try {
    const suspectedUsers = await findSuspectedUser();
    let scannedCount = 0;
    let markedForReview = 0;

    for (const user of suspectedUsers) {
      // Don't auto-ban, just mark for review
      // Admin can review and decide
      if (!user.inreview) {
        user.inreview = true;
        await user.save();
        markedForReview++;
      }
      scannedCount++;
    }

    logger.info(`User scan completed: ${scannedCount} suspected users found, ${markedForReview} marked for review`);
    
    // Send notification if significant number of suspected users found
    if (suspectedUsers.length > 10) {
      const message = `⚠️ User Scan Alert: ${suspectedUsers.length} suspected users detected and marked for review.`;
      sendTelegramMessage(message);
    }
  } catch (error) {
    console.error("Error in user scanning:", error);
  }
};
