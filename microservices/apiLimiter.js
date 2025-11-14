import rateLimit from "express-rate-limit";

// Utility fallback IP extractor
const getClientIp = (req, res) => {
  const forwarded = req.headers["x-forwarded-for"];
  let ip = forwarded
    ? forwarded.split(",")[0].trim()
    : req.ip || req.connection?.remoteAddress || "";

  if (ip.startsWith("::ffff:")) ip = ip.slice(7);
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
      if (useUserIdIfAvailable && req.user) {
        // req.user may be a string id or an object
        if (typeof req.user === "string") return req.user;
        if (req.user.id) return req.user.id;
      }
      if (req.device_id) return `device_${req.device_id}`;
      return `ip_${getClientIp(req, res)}`;
    },
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
