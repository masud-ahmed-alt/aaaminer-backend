import jwt from 'jsonwebtoken';
import { ErrorHandler } from '../utils/utility.js';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import Admin from '../models/Admin.js';

/**
 * Middleware to check if the user is authenticated
 * Supports both cookie-based (web) and header-based (mobile) authentication
 */
export const isAuthenticated = (req, res, next) => {
  let token = null;

  // First, try to get token from cookies (for web clients)
  if (req.cookies && req.cookies[process.env.COOKIE_NAME]) {
    token = req.cookies[process.env.COOKIE_NAME];
  }
  // If not in cookies, try to get from Authorization header (for mobile apps)
  else if (req.headers.authorization) {
    const authHeader = req.headers.authorization;
    // Support "Bearer token" format
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = authHeader;
    }
  }
  // Also check Cookie header (for mobile apps that send cookie as header)
  else if (req.headers.cookie) {
    const cookieHeader = req.headers.cookie;
    // Parse cookie header to find the token
    // Format: "aaaminer=token" or "COOKIE_NAME=token"
    const cookieName = process.env.COOKIE_NAME;
    const cookieRegex = new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`);
    const match = cookieHeader.match(cookieRegex);
    if (match) {
      token = match[1];
    }
    // Also check for "aaaminer=token" format (Android app format)
    const aaaminerMatch = cookieHeader.match(/(?:^|;\s*)aaaminer=([^;]+)/);
    if (aaaminerMatch) {
      token = aaaminerMatch[1];
    }
  }

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



/**
 * Middleware to check if the user is an admin
 * Supports both cookie-based (web) and header-based (mobile) authentication
 */
export const isAdmin = async (req, res, next) => {
  try {
    let token = null;

    // First, try to get token from cookies (for web clients)
    if (req.cookies && req.cookies[process.env.COOKIE_NAME]) {
      token = req.cookies[process.env.COOKIE_NAME];
    }
    // If not in cookies, try to get from Authorization header (for mobile apps)
    else if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      // Support "Bearer token" format
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else {
        token = authHeader;
      }
    }
    // Also check Cookie header (for mobile apps that send cookie as header)
    else if (req.headers.cookie) {
      const cookieHeader = req.headers.cookie;
      // Parse cookie header to find the token
      const cookieName = process.env.COOKIE_NAME;
      const cookieRegex = new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`);
      const match = cookieHeader.match(cookieRegex);
      if (match) {
        token = match[1];
      }
      // Also check for "aaaminer=token" format (Android app format)
      const aaaminerMatch = cookieHeader.match(/(?:^|;\s*)aaaminer=([^;]+)/);
      if (aaaminerMatch) {
        token = aaaminerMatch[1];
      }
    }

    // Debug logging for cookie issues
    if (!token && process.env.NODE_ENV === "production") {
      console.log("🔍 isAdmin: No token found", {
        hasCookies: !!req.cookies,
        cookieName: process.env.COOKIE_NAME,
        cookieKeys: req.cookies ? Object.keys(req.cookies) : [],
        hasAuthHeader: !!req.headers.authorization,
        hasCookieHeader: !!req.headers.cookie,
        origin: req.headers.origin,
      });
    }

    if (!token) {
      return next(new ErrorHandler("Please login to access this resource!", 401));
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decodedData._id);

    if (!admin) {
      return next(new ErrorHandler("Admin privileges required!", 403));
    }

    req.admin = admin._id;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new ErrorHandler("Invalid or expired token!", 401));
    }
    return next(new ErrorHandler("Authentication failed!", 401));
  }
};
