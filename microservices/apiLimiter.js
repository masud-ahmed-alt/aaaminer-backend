import rateLimit from "express-rate-limit";

// ✅ Utility function to extract clean client IP
const getClientIp = (req, res) => {
  const forwarded = req.headers["x-forwarded-for"];
  let ip = forwarded
    ? forwarded.split(",")[0].trim()
    : req.ip || req.connection?.remoteAddress || "";

  // Normalize IPv6-mapped IPv4 and loopback
  if (ip.startsWith("::ffff:")) ip = ip.slice(7);
  if (ip === "::1") ip = "127.0.0.1";

  return ip;
};

// ✅ Universal dynamic rate limiter
export const createRateLimiter = ({
  max,
  windowMs = 24 * 60 * 60 * 1000, // 24 hours by default
  message = "Too many attempts. Please try again later.",
  useUserIdIfAvailable = true,
} = {}) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,

    // Rate limit key: user ID (if logged in) or IP address
    keyGenerator: (req, res) => {
      const key = useUserIdIfAvailable && req.user?.id
        ? req.user.id
        : getClientIp(req, res);

      console.log("Rate limit key:", key); // 🐞 Debug log
      return key;
    },

    // Handler to return dynamic/static error message
    handler: (req, res, next, options) => {
      const dynamicMessage =
        typeof message === "function" ? message(req, res) : message;

      res.status(options.statusCode).json({
        success: false,
        message: dynamicMessage,
      });
    },
  });
};
