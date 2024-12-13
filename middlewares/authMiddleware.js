import jwt from 'jsonwebtoken';
import { ErrorHandler } from '../utils/utility.js';
import rateLimit from 'express-rate-limit';
import Admin from '../models/Admin.js';



export const isAuthenticated = (req, resp, next) => {
  const token = req.cookies[process.env.COOKIE_NAME]
  if (!token) return next(new ErrorHandler("Please login to access this resource!", 401))
  const decodedData = jwt.verify(token, process.env.JWT_SECRET)
  req.user = decodedData._id
  next()
}


export const otpRequestLimiter = rateLimit({
  windowMs: 1440 * 60 * 1000, // 24 hours
  max: 3, // Limit each user to 3 requests per 24 hours
  message: {
    success: false,
    message: 'Too many requests, please try again after 24 hours',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => {
    return req.user?.id || req.ip; // Use user ID if available, otherwise fallback to IP
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});

export const signupRequestLimiter = rateLimit({
  windowMs: 1440 * 60 * 1000, // 24 hours
  max: 3, // Limit each IP to 3 signup attempts per 24 hours
  message: {
    success: false,
    message: 'Too many signup attempts detected. Please wait 24 hours before trying again. Creating multiple accounts may result in a permanent ban.',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Use IP for unauthenticated users, fallback logic if a user ID is somehow present
    return req.ip;
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});


export const isAdmin = async (req, resp, next) => {
  try {
    const token = req.cookies[process.env.COOKIE_NAME];
    if (!token) {
      return next(new ErrorHandler("Please login to access this resource!", 401));
    }
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decodedData._id);

    if (!admin) {
      return next(new ErrorHandler("Admin privileges required!", 403));
    }
    req.admin = admin;
    next();
  } catch (error) {
    return next(new ErrorHandler("Authentication failed!", 401));
  }
}



