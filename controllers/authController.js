
import { compare } from 'bcrypt';
import { catchAsyncError } from '../middlewares/errorMiddleware.js';
import User from '../models/User.js';
import { sendToken } from '../utils/features.js';
import { ErrorHandler } from '../utils/utility.js';

export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, username, password, referal } =
    req.body;

  // Validate all required fields
  if (!name || !email || !password || !username) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(
      new ErrorHandler(
        "You are already registered. Please log in.",
        400
      )
    );
  }

  const checkUser = await User.findOne({ username })
  if (checkUser) {
    if (username === checkUser.username) {
      return next(
        new ErrorHandler(
          "Username already taken. Please choose different.",
          400
        )
      );
    }
  }




  if (username == referal)
    return next(new ErrorHandler("Do not put your username is referral option", 400))

  let referalUser = null;

  // Handle referral logic
  if (referal) {
    referalUser = await User.findOne({ username: referal });
    if (!referalUser) {
      return next(new ErrorHandler("Invalid referral code", 400));
    }
  }

  try {
    // Create the new user
    const user = await User.create({
      name,
      email,
      username,
      password,
      walletPoints: referal ? 10000 : 5000,
      referredBy: referalUser ? referalUser._id : null,
    });

    // Add referral rewards if applicable
    if (referalUser) {
      referalUser.walletPoints += 5000;
      await referalUser.save();
    }

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
  const user  = req.user;
  const profile = await User.findById(user)
 
  res.status(200).json({
    success:true,
    profile
  })
})

