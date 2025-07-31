// rateLimiter.js
import rateLimit from "express-rate-limit";

// ✅ Utility function to get clean client IP
const getClientIp = (req, res) => {
  let ip = "";

  const xForwardedFor = req.headers["x-forwarded-for"];
  if (xForwardedFor) {
    const forwardedIp = xForwardedFor.split(",")[0].trim();
    if (forwardedIp) ip = forwardedIp;
  }

  // fallback to req.ip or connection address
  if (!ip) {
    ip = req.ip || req.connection?.remoteAddress || "";
  }

  // Normalize IPv6 to IPv4 format where possible
  if (ip.startsWith("::ffff:")) ip = ip.substring(7);
  if (ip === "::1") ip = "127.0.0.1";

  return ip;
};


export const createRateLimiter = ({
  max,
  windowMs = 24 * 60 * 60 * 1000,
  message = "Too many attempts. Please try again later.",
  useUserIdIfAvailable = true,
} = {}) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req, res) => {
      if (useUserIdIfAvailable && req.user?.id) {
        return req.user.id;
      }
      return getClientIp(req, res);
    },
    handler: (req, res, next, options) => {
      res.status(options.statusCode).json({
        success: false,
        message,
      });
    },
  });
};
