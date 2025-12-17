import bcrypt from "bcryptjs";
import { catchAsyncError } from "../middlewares/errorMiddleware.js";
import HomeNotification from "../models/HomeNotification.js";
import User from "../models/User.js";
import Withdraw from "../models/Withdraw.js";
import Settings from "../models/Settings.js";
import {
  extractName,
  generateUsername,
  getActivityLog,
  sendToken,
  setAndSendOTP,
} from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";
import { logger } from "../utils/logger.js";

export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;
  let referal = req.body.referal;

  // Validate all required fields
  if (!name || !email || !password) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new ErrorHandler("Invalid email format", 400));
  }

  // Split email into local part and domain
  const [localPart, domain] = email.split("@");

  // Validate against known/trusted domains
  const knownDomains = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "live.com",
  ];
  if (!knownDomains.includes(domain)) {
    return next(
      new ErrorHandler("Email domain is not from a trusted provider.", 400)
    );
  }

  // Additional stricter checks for Gmail
  if (domain === "gmail.com") {
    // Reject if too many dots in local part (e.g., more than 2)
    const dotCount = (localPart.match(/\./g) || []).length;
    if (dotCount > 1) {
      return next(new ErrorHandler("Suspicious email detected.", 400));
    }

    // Reject if local part starts/ends with dot or has consecutive dots
    if (/(\.\.)|(^\.)|(\.$)|(\+)/.test(localPart)) {
      return next(new ErrorHandler("Suspicious email detected.", 400));
    }
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(
      new ErrorHandler("You are already registered. Please log in.", 400)
    );
  }

  let referalUser = null;

  // Check referral username if provided
  if (referal) {
    referal = referal.toLowerCase();
    referalUser = await User.findOne({ username: referal });
    if (!referalUser) {
      return next(new ErrorHandler("Referral user not found.", 404));
    }
  }

  // Auto-generate username and name
  const username = await generateUsername();
  // const name = await extractName(email);

  try {
    // Create the new user
    const user = await User.create({
      email,
      name,
      username,
      password,
      walletPoints: 500,
      referredBy: referalUser ? referalUser._id : null,
    });

    const userCount = await User.countDocuments();
    req.io.emit("liveUserCount", {
      success: true,
      users: userCount,
    });

    getActivityLog(user.name, "new profile created");
    // Send response with token
    try {
      sendToken(res, user, 201, `Welcome`);
    } catch (error) {
      return next(new ErrorHandler("Failed to generate authentication token", 500));
    }
  } catch (error) {
    logger.error("Registration failed", error);
    return next(
      new ErrorHandler("Registration failed. Please try again.", 500)
    );
  }
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new ErrorHandler("Please enter email and password", 400));
  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("Invalid email or password", 401));

  // use bcryptjs consistently
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return next(new ErrorHandler("Invalid email or password", 401));
  
  // Handle case where user.name might be undefined
  const welcomeMessage = user.name ? `Welcome  ${user.name}!` : "Welcome!";
  try {
    sendToken(res, user, 200, welcomeMessage);
  } catch (error) {
    return next(new ErrorHandler("Failed to generate authentication token", 500));
  }
});

export const logout = catchAsyncError(async (req, res, next) => {
  // Clear the cookie by setting it to expire immediately
  const cookieName = process.env.COOKIE_NAME;
  if (!cookieName) {
    return next(new ErrorHandler("Cookie name not configured", 500));
  }

  res
    .status(200)
    .cookie(cookieName, "", {
      expires: new Date(0),
      httpOnly: true,
      sameSite: "none",
      secure: true,
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});

export const profile = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  const profileUser = await User.findById(user);
  
  if (!profileUser) {
    return next(new ErrorHandler("User not found", 404));
  }
  
  const referred = await User.find({ referredBy: user, isverified: true })
    .select("username")
    .countDocuments();

  let profile = {
    ...profileUser.toObject(),
    referredCount: referred,
  };

  res.status(200).json({
    success: true,
    profile,
  });
});

// get myvouchers and withdraw request history
export const myVouchers = catchAsyncError(async (req, res, next) => {
  const userId = req.user?._id || req.user;
  const { status } = req.query;

  if (!status) {
    return next(new ErrorHandler("Please select status", 400));
  }

  const validStatuses = ["all", "success", "processing", "rejected"];
  if (!validStatuses.includes(status)) {
    return next(new ErrorHandler("Invalid status", 400));
  }

  // Build filter
  let filter = { user: userId };
  if (status !== "all") {
    filter.status = status;
  }

  // ✅ Updated field selection to include `voucher` and `amount` for "all" and "success"
  const selectFields = ["success", "all"].includes(status)
    ? "name redeemOption voucher upi_id amount points status createdAt updatedAt"
    : "name redeemOption upi_id amount points status createdAt updatedAt";

  const sortField = status === "success" ? "-updatedAt" : "-createdAt";

  // Fetch vouchers
  const vouchers = await Withdraw.find(filter)
    .select(selectFields)
    .sort(sortField);

  return res.status(200).json({
    success: true,
    vouchers,
  });
});

// send OTP for email verification

export const verifyEmailSendOtp = catchAsyncError(async (req, res, next) => {
  const userid = req.user;
  const user = await User.findById(userid);
  
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  setAndSendOTP(user, "Profile Verification !");

  res.status(200).json({
    success: true,
    message: `Otp send to ${user.email}`,
  });
});

// verify email after otp verification
export const verifyEmail = catchAsyncError(async (req, res, next) => {
  const userid = req.user;
  const { otp } = req.body;

  const user = await User.findById(userid).select(
    "otp emailOTP otpExpiry referredBy"
  );
  if (!user) return next(new ErrorHandler("User not found", 404));

  if (otp !== user.emailOTP || user.otpExpiry < Date.now())
    return next(new ErrorHandler("Invalid OTP or OTP has expired !", 400));

  user.isverified = true;
  user.emailOTP = undefined;
  user.otpExpiry = undefined;

  // Add referral rewards if applicable
  if (user.referredBy) {
    const referalUser = await User.findById(user.referredBy);
    if (referalUser) {
      referalUser.walletPoints += 500;
      await referalUser.save();
    }
  }

  await user.save();

  res.status(201).json({
    success: true,
    message: "Congratulation! Profile verified !",
  });
});

// send OTP for forgot password
export const forgotPassSendOtp = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new ErrorHandler("Please enter email !", 400));

  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler("Email not found !", 404));
  setAndSendOTP(user, "OTP for Password Recovery!");
  res.status(200).json({
    success: true,
    message: `OTP send to ${email}`,
  });
});

export const passwordRecovery = catchAsyncError(async (req, res, next) => {
  const { email, password, otp } = req.body;
  const user = await User.findOne({ email }).select(
    "emailOTP otpExpiry isverified password"
  );
  if (!user) return next(new ErrorHandler("User not found!", 404));

  if (otp !== user.emailOTP || user.otpExpiry < Date.now())
    return next(new ErrorHandler("Invalid OTP or OTP has expired !", 400));

  user.password = password;
  user.emailOTP = undefined;
  user.otpExpiry = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully!",
  });
});

export const getHomeNotification = catchAsyncError(async (req, res, next) => {
  const notification = await HomeNotification.findOne()
    .select("title createdAt")
    .sort("-createdAt");

  return res.status(200).json({
    success: true,
    notification,
  });
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const userId = req.user;
  const { name, phone } = req.body;
  let country = req.body.country;

  if (!userId) {
    return next(new ErrorHandler("Unauthorized access", 401));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("Profile not found", 404));
  }

  if (!name) return next(new ErrorHandler("Name field is required!", 400));

  if (name && typeof name !== "string") {
    return next(new ErrorHandler("Invalid name format", 400));
  }

  if (country && typeof country !== "string") {
    return next(new ErrorHandler("Invalid country format", 400));
  }

  const phoneRegex = /^[0-9]{10}$/;
  if (phone) {
    if (!phoneRegex.test(phone)) {
      return next(
        new ErrorHandler("Invalid phone number. Must be 10 digits.", 400)
      );
    }
  }

  if (name) user.name = name.trim();
  if (phone) user.phone = phone.trim();

  if (country) {
    country = country.toLowerCase();
    user.country = country.trim();
  }

  await user.save();
  getActivityLog(user.name, "profile updated");

  res.status(200).json({
    success: true,
    message: "Profile updated successfully!",
  });
});

export const changePassword = catchAsyncError(async (req, res, next) => {
  const userId = req.user;
  const { currentPassword, newPassword } = req.body;

  if (!userId) {
    return next(new ErrorHandler("Unauthorized access", 401));
  }

  // Validate inputs
  if (!currentPassword || !newPassword) {
    return next(
      new ErrorHandler("Please provide both current and new password", 400)
    );
  }

  // Find the user
  const user = await User.findById(userId).select("+password");
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Compare the current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return next(new ErrorHandler("Current password is incorrect", 400));
  }

  // Update to new password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

export const checkRedeemEligibility = catchAsyncError(
  async (req, res, next) => {
    const userId = req.user;
    if (!userId) {
      return next(new ErrorHandler("Invalid user ID", 400));
    }
    // Fetch the user with only required fields
    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    // Consolidate all ineligibility checks
    if (user.isBanned) {
      return next(new ErrorHandler("You are permanently banned", 401));
    } else if (user.walletPoints < 10000) {
      return next(new ErrorHandler("You are not eligible to redeem", 401));
    }


    res.status(200).json({
      success: true,
      isEligible: true,
    });
  }
);

// Withdraw functionalities
export const withdrawRequest = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  const { wallet, option = 0 } = req.body;

  // Step 1: Fetch user data
  const userData = await User.findById(user);
  if (!userData) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Step 2: Validate user status
  if (!userData.isverified) {
    return next(new ErrorHandler("Please verify your profile.", 400));
  }

  if (userData.isBanned) {
    return next(new ErrorHandler("You're not eligible to redeem", 400));
  }

  if (userData.inreview) {
    return next(
      new ErrorHandler(
        "Your profile is under review. You cannot redeem at this time.",
        400
      )
    );
  }

  // Step 3: Validate country
  if (!userData.country) {
    return next(
      new ErrorHandler("Please update your country to make a redeem", 400)
    );
  }

  // Step 4: Get redeem settings
  const settings = await Settings.getSettings();
  
  // Step 5: Check if redeem is paused
  if (settings.redeemPaused) {
    return next(
      new ErrorHandler(
        "Redemption is temporarily paused. Please try later",
        400
      )
    );
  }

  // Step 6: Determine country-specific settings
  const isIndia = userData.country.toLowerCase() === "india";
  const minRedeemAmount = isIndia 
    ? settings.minRedeemAmountIndia 
    : settings.minRedeemAmountOther;
  const validPoints = isIndia 
    ? settings.redeemAmountsIndia 
    : settings.redeemAmountsOther;

  // Step 7: Validate wallet amount exists
  if (!wallet || wallet <= 0) {
    return next(
      new ErrorHandler(
        `Minimum redeem points is ${minRedeemAmount.toLocaleString()}`,
        400
      )
    );
  }

  // Step 8: Validate wallet meets minimum requirement
  if (userData.walletPoints < minRedeemAmount) {
    return next(
      new ErrorHandler(
        `Minimum redeem points is ${minRedeemAmount.toLocaleString()}`,
        400
      )
    );
  }

  // Step 9: Validate wallet is in valid points list
  const validPointsSet = new Set(validPoints);
  if (!validPointsSet.has(wallet)) {
    const pointsList = validPoints.map(p => p.toLocaleString()).join(", ");
    return next(
      new ErrorHandler(
        `Please select from: ${pointsList}`,
        400
      )
    );
  }

  // Step 10: Validate sufficient balance
  if (userData.walletPoints < wallet) {
    return next(new ErrorHandler("Insufficient points", 400));
  }

  // Step 11: Validate and assign redeem option
  let redeemName;
  const optionValue = typeof option === 'string' ? parseInt(option, 10) : option;
  
  if (optionValue === 0) {
    redeemName = "Amazon gift voucher";
  } else if (optionValue === 1) {
    redeemName = "Google Play voucher";
  } else {
    return next(
      new ErrorHandler(
        "Invalid option. Use 0 for Amazon, 1 for Google Play.",
        400
      )
    );
  }

  // Step 12: Calculate amount and process withdrawal
  const amount = wallet * 0.001;
  userData.walletPoints -= wallet;

  await Withdraw.create({
    user: user,
    name: redeemName,
    redeemOption: optionValue.toString(),
    amount,
    points: wallet,
  });

  await userData.save();
  getActivityLog(userData.name, `redeem requested ${wallet} pts`);

  res.status(201).json({
    success: true,
    message: "Withdrawal requested",
  });
});

// Increase free spin limits
export const increaseSpinLimits = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user;
    if (!userId) {
      return next(new ErrorHandler("Unauthorized access", 401));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // If user still has unused free spins
    if (user.freeSpinLimit > 0) {
      return next(
        new ErrorHandler("You still have free spins left to use!", 400)
      );
    }

    // No daily spins left
    if (user.dailySpinLimit <= 0) {
      return next(
        new ErrorHandler("You have reached the maximum daily spin limit.", 400)
      );
    }

    let addedSpins = 0;

    if (user.dailySpinLimit > 1) {
      user.dailySpinLimit -= 2;
      user.freeSpinLimit += 2;
      addedSpins = 2;
    } else if (user.dailySpinLimit === 1) {
      user.dailySpinLimit -= 1;
      user.freeSpinLimit += 1;
      addedSpins = 1;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Congratulations! Free spin limits increased by ${addedSpins}!`,
    });
  } catch (error) {
    next(error);
  }
});

// complete spin and deduct freeSpinLimit
export const completeSpin = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user;
    const { points } = req.body;
    if (points === undefined || points === null) {
      return next(new ErrorHandler("Points are required", 400));
    }

    if (!userId) {
      return next(new ErrorHandler("Unauthorized access", 401));
    }
    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    if (user.freeSpinLimit <= 0) {
      return next(new ErrorHandler("No free spins left", 400));
    }

    if (points >= 3000) {
      return next(
        new ErrorHandler("Something went wrong, Please try again leter", 400)
      );
    }

    var message = "";
    if (points >= 5000) {
      message = `🎉Congratulations!🎉 \nYou have won the jackpot!`;
    } else if (points > 0) {
      message = `🎉Congratulations!🎉`;
    } else {
      message = "Better luck next time!";
    }

    user.walletPoints += points;
    user.freeSpinLimit -= 1;
    await user.save();
    res.status(200).json({
      success: true,
      points,
      message,
    });
  } catch (error) {
    next(error);
  }
});
