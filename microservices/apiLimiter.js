import rateLimit from "express-rate-limit";

const getClientIp = (req) => {
  const xForwardedFor = req.headers["x-forwarded-for"];
  let ip = xForwardedFor ? xForwardedFor.split(",")[0].trim() : req.ip || req.connection.remoteAddress || "";
  if (ip.startsWith("::ffff:")) ip = ip.substring(7);
  if (ip === "::1") ip = "127.0.0.1";
  return ip;
};

export const signupRequestLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many signup attempts detected. Please wait 24 hours before trying again. Creating multiple accounts may result in a permanent ban.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});

export const otpRequestLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many OTP requests. Please try again after 24 hours.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id || getClientIp(req);
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});
