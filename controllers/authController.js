
import { compare } from 'bcrypt';
import bcrypt from 'bcryptjs';
import { catchAsyncError } from '../middlewares/errorMiddleware.js';
import HomeNotification from '../models/HomeNotification.js';
import User from '../models/User.js';
import Withdraw from '../models/Withdraw.js';
import { generateUsername, sendToken, setAndSendOTP } from '../utils/features.js';
import { ErrorHandler } from '../utils/utility.js';

export const register = catchAsyncError(async (req, res, next) => {
  const { email, password, referal } = req.body;

  // Validate all required fields
  if (!email || !password) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  // Validate Email: Check for a valid email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new ErrorHandler("Invalid email format", 400));
  }

  // Check for unknown or suspicious domain in the email
  const knownDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'live.com'];
  const emailDomain = email.split('@')[1];
  if (!knownDomains.includes(emailDomain)) {
    return next(new ErrorHandler("Email domain is not from a trusted provider.", 400));
  }

  // Check if the user already exists by email
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new ErrorHandler("You are already registered. Please log in.", 400));
  }


  let referalUser = null;

  // Handle referral logic if referral is provided
  if (referal) {
    referalUser = await User.findOne({ username: referal });
    if (!referalUser) {
      return next(new ErrorHandler("Referral user does not exist", 400));
    }
  }
   const username = await generateUsername()

  try {
    // Create the new user
    const user = await User.create({
      email,
      name:"",
      username,
      password,
      walletPoints: referal ? 500 : 500,
      referredBy: referalUser ? referalUser._id : null,
    });

    const userCount = await User.countDocuments();
    req.io.emit('liveUserCount', {
      success: true,
      users: userCount,
    });

    // Send response with token
    sendToken(res, user, 201, `Welcome ${user.name}!`);
  } catch (error) {
    console.error(error);
    return next(new ErrorHandler("Registration failed. Please try again.", 500));
  }
});


export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new ErrorHandler("Please enter email and password", 400))
  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("Invalid email or password", 401))

  const isMatch = await compare(password, user.password)
  if (!isMatch) return next(new ErrorHandler("Invalid username or password", 401))

  sendToken(res, user, 200, `Welcome  ${user.name}!`)
})


export const profile = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  const profileUser = await User.findById(user)
  const referred = await User.find({ referredBy: user, isverified: true }).select("username").countDocuments()

  let profile = {
    ...profileUser.toObject(),
    referredCount: referred
  }

  res.status(200).json({
    success: true,
    profile
  })
})

// get myvouchers and withdraw request history
export const myVouchers = catchAsyncError(async (req, res, next) => {
  try {
    const userId = req.user;
    const { status } = req.query;

    if (!status) {
      return next(new ErrorHandler("Please select status", 400));
    }

    const validStatuses = ["success", "processing"];
    if (!validStatuses.includes(status)) {
      return next(new ErrorHandler("Invalid status", 400));
    }

    const selectFields = status === "success"
      ? "name voucher points createdAt updatedAt"
      : "name points createdAt updatedAt";

    const sortField = status === "success" ? "-updatedAt" : "-createdAt";

    const vouchers = await Withdraw.find({ user: userId, status })
      .select(selectFields)
      .sort(sortField);

    return res.status(200).json({
      success: true,
      vouchers,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});


// send OTP for email verification

export const verifyEmailSendOtp = catchAsyncError(async (req, res, next) => {
  const userid = req.user
  const user = await User.findById(userid)

  setAndSendOTP(user, "Email Verification !")

  res.status(200).json({
    success: true,
    message: `Otp send to ${user.email}`
  })
})

// verify email after otp verification
export const verifyEmail = catchAsyncError(async (req, res, next) => {
  const userid = req.user
  const { otp } = req.body

  const user = await User.findById(userid).select("otp emailOTP otpExpiry referredBy")
  if (!user) return next(new ErrorHandler("User not found", 404))

  if (otp !== user.emailOTP || user.otpExpiry < Date.now())
    return next(new ErrorHandler("Invalid OTP or OTP has expired !", 400))


  user.isverified = true;
  user.emailOTP = undefined;
  user.otpExpiry = undefined;


  // Add referral rewards if applicable
  let referalUser = []
  if (user.referredBy) {
    referalUser = await User.findById(user.referredBy)
    referalUser.walletPoints += 500
    await referalUser.save();
  }

  await user.save();

  res.status(201).json({
    success: true,
    message: "Congratulation! Profile verified !"
  })
})


// send OTP for forgot password
export const forgotPassSendOtp = catchAsyncError(async (req, res, next) => {
  const { email } = req.body
  if (!email) return next(new ErrorHandler("Please enter email !", 400))

  const user = await User.findOne({ email })
  if (!user) return next(new ErrorHandler("User not found !", 404))

  setAndSendOTP(user, "Password Recovery !")


  res.status(200).json({
    success: true,
    message: `OTP send to ${email}`
  })
})

export const passwordRecovery = catchAsyncError(async (req, res, next) => {
  const { email, password, otp } = req.body
  const user = await User.findOne({ email }).select("emailOTP otpExpiry isverified password")
  if (!user) return next(new ErrorHandler("User not found!", 404))

  if (otp !== user.emailOTP || user.otpExpiry < Date.now())
    return next(new ErrorHandler("Invalid OTP or OTP has expired !", 400))

  user.password = password;
  user.emailOTP = undefined;
  user.otpExpiry = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully!"
  });
})

export const getHomeNotification = catchAsyncError(async (req, res, next) => {

  const notification = await HomeNotification.findOne()
    .select("title createdAt")
    .sort("-createdAt")

  return res.status(200).json({
    success: true,
    notification
  })

})

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const userId = req.user;
  const { name, phone } = req.body;

  if (!userId) {
    return next(new ErrorHandler("Unauthorized access", 401));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("Profile not found", 404));
  }


  if (name && typeof name !== "string") {
    return next(new ErrorHandler("Invalid name format", 400));
  }

  const phoneRegex = /^[0-9]{10}$/;
  if (phone) {
    if (!phoneRegex.test(phone)) {
      return next(new ErrorHandler("Invalid phone number. Must be 10 digits.", 400));
    }
  }

  if (name) user.name = name.trim();
  if (phone) user.phone = phone.trim();

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully!",
  });
});



export const changePassword = catchAsyncError(async (req, res, next) => {
  const userId = req.user
  const { currentPassword, newPassword } = req.body

  if (!userId) {
    return next(new ErrorHandler("Unauthorized access", 401))
  }

  // Validate inputs
  if (!currentPassword || !newPassword) {
    return next(new ErrorHandler("Please provide both current and new password", 400))
  }

  // Find the user
  const user = await User.findById(userId).select('+password')
  if (!user) {
    return next(new ErrorHandler("User not found", 404))
  }

  // Compare the current password
  const isMatch = await bcrypt.compare(currentPassword, user.password)
  if (!isMatch) {
    return next(new ErrorHandler("Current password is incorrect", 400))
  }

  // Update to new password
  user.password = newPassword
  await user.save()

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});


export const checkRedeemEligibility = catchAsyncError(async (req, res, next) => {
  const userId = req.user;
  if (!userId) {
    return next(new ErrorHandler("Invalid user ID", 400));
  }
  // Fetch the user with only required fields
  const user = await User.findById(userId)
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  // Consolidate all ineligibility checks
  if (user.isBanned) {
    return next(new ErrorHandler("You are permanently banned", 401));
  } else if (user.walletPoints < 10000) {
    return next(new ErrorHandler("You are not eligible to redeem", 401));
  }
  // Step 1: Check if the user is in the top 10
  const topUsers = await User.find({
    walletPoints: { $gt: 10000 },
    isBanned: false,
    isverified: true,
  })
    .sort({ walletPoints: -1 })
    .limit(10)

  const isInTopTen = topUsers.some(u => u._id.toString() === userId.toString());

  if (!isInTopTen) {
    return next(new ErrorHandler("You're not in the top 10. Please collect more points.", 400));
  }
  res.status(200).json({
    success: true,
    isEligible: true,
  });
});


// Withdraw functionalities
export const withdrawRequest = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  const { wallet } = req.body;

  const userData = await User.findById(user);
  if (!userData) return next(new ErrorHandler("User not found", 404));

  if (userData.isBanned)
    return next(new ErrorHandler("You're not eligible to redeem", 400));

  if (!wallet || wallet < 10000 || userData.walletPoints < 10000)
    return next(new ErrorHandler("Minimum redeem points is 10,000", 400));

  if (wallet > 50000)
    return next(new ErrorHandler("Maximum redeem points is 50,000", 400));

  if (userData.walletPoints < wallet)
    return next(new ErrorHandler("Insufficient points", 400));

  // // Check if user already requested withdrawal in the current month
  // const startOfMonth = moment().startOf("month").toDate();
  // const endOfMonth = moment().endOf("month").toDate();

  // const existingRequest = await Withdraw.findOne({
  //   user,
  //   createdAt: { $gte: startOfMonth, $lte: endOfMonth },
  // });

  // if (existingRequest)
  //   return next(new ErrorHandler("You have already requested a withdrawal this month", 400));

  // Deduct points and create withdrawal request
  const amount = wallet * 0.001;
  userData.walletPoints -= wallet;

  await Withdraw.create({
    user: user,
    name: "Amazon gift voucher",
    amount,
    points: wallet,
  });

  await userData.save();

  res.status(201).json({
    success: true,
    message: "Withdrawal requested",
  });
});
