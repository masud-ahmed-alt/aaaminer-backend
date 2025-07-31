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
import {
  otpRequestLimiter,
  signupRequestLimiter,
} from "../microservices/apiLimiter.js";

const router = express.Router();

// Register a new user
router.post("/register", register);

// Login a user
router.post("/login", login);
router.get("/me", isAuthenticated, profile);

// Additional routes can go here (e.g., forgot password, logout)
router.post("/withdraw", isAuthenticated, withdrawRequest);
router.get("/myvoucher", isAuthenticated, myVouchers);

router.post(
  "/send-otp-email",
  isAuthenticated,
  verifyEmailSendOtp
);
router.post("/verify-email", isAuthenticated, verifyEmail);
router.get("/get-home-notification", getHomeNotification);

router.post("/send-otp-password", forgotPassSendOtp);
router.post("/recovery-password", passwordRecovery);

router.post("/update-profile", isAuthenticated, updateProfile);
router.post("/change-password", isAuthenticated, changePassword);

router.get(
  "/check-redeem-eligibility",
  isAuthenticated,
  checkRedeemEligibility
);

export default router;
