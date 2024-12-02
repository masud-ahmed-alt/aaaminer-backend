import jwt from 'jsonwebtoken';
import { ErrorHandler } from '../utils/utility.js';
import rateLimit from 'express-rate-limit';



export const isAuthenticated = (req, resp, next) => {
  const token = req.cookies[process.env.COOKIE_NAME]
  if (!token) return next(new ErrorHandler("Please login to access this resource!", 401))
  const decodedData = jwt.verify(token, process.env.JWT_SECRET)
  req.user = decodedData._id
  next()
}




import rateLimit from 'express-rate-limit';

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


