import jwt from 'jsonwebtoken';
import { ErrorHandler } from '../utils/utility.js';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import Admin from '../models/Admin.js';

/**
 * Middleware to check if the user is authenticated
 */
export const isAuthenticated = (req, res, next) => {
  const token = req.cookies[process.env.COOKIE_NAME];
  if (!token) {
    return next(new ErrorHandler("Please login to access this resource!", 401));
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedData._id;
    next();
  } catch (error) {
    return next(new ErrorHandler("Invalid or expired token!", 401));
  }
};



export const isAdmin = async (req, res, next) => {
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
};
