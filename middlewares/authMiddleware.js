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




export const otpRequestLimiter = rateLimit({
  windowMs: 1440 * 60 * 1000, 
  max: 500, 
  message: {
    success: false,
    message: 'Too many OTP requests, please try again after 24 hours'
  },
  standardHeaders: true, 
  legacyHeaders: false,  
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});


