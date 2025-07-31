import express from "express";
import {
  register,
  login,
  profile,
  withdrawRequest,
  myVouchers,
  verifyEmailSendOtp,
  verifyEmail,
  forgotPassSendOtp,
  passwordRecovery,
  getHomeNotification,
  updateProfile,
  changePassword,
  checkRedeemEligibility,
} from "../controllers/authController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { createRateLimiter } from "../microservices/apiLimiter.js";

const router = express.Router();

// Register a new user
router.post(
  "/register",
  createRateLimiter({
    max: 5,
    message: "Too many registration attempts. Please try again later.",
  }),
  register
);

// Login a user
router.post("/login", login);
router.get("/me", isAuthenticated, profile);

// Additional routes can go here (e.g., forgot password, logout)
router.post("/withdraw", isAuthenticated, withdrawRequest);
router.get("/myvoucher", isAuthenticated, myVouchers);

router.post(
  "/send-otp-email",
  createRateLimiter({
    max: 3,
    message: "Too many attempts. Please try again later.",
  }),
  isAuthenticated,
  verifyEmailSendOtp
);
router.post("/verify-email", isAuthenticated, verifyEmail);
router.get("/get-home-notification", getHomeNotification);

router.post(
  "/send-otp-password",
  createRateLimiter({
    max: 3,
    message: "Too many attempts. Please try again later.",
  }),
  forgotPassSendOtp
);
router.post("/recovery-password", passwordRecovery);

router.post("/update-profile", isAuthenticated, updateProfile);
router.post("/change-password", isAuthenticated, changePassword);

router.get(
  "/check-redeem-eligibility",
  isAuthenticated,
  checkRedeemEligibility
);

export default router;
