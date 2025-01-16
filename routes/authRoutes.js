import express from 'express';
import { register, login, profile, withdrawRequest, myVouchers, verifyEmailSendOtp, verifyEmail, forgotPassSendOtp, passwordRecovery, getHomeNotification, updateProfile, changePassword, checkRedeemEligibility } from '../controllers/authController.js';
import { isAuthenticated, otpRequestLimiter, signupRequestLimiter } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Register a new user
router.post('/register',signupRequestLimiter, register);

// Login a user
router.post('/login', login);
router.get('/me', isAuthenticated, profile);

// Additional routes can go here (e.g., forgot password, logout)
router.post('/withdraw', isAuthenticated, withdrawRequest);
router.get('/myvoucher', isAuthenticated, myVouchers);


router.post("/send-otp-email",otpRequestLimiter, isAuthenticated, verifyEmailSendOtp)
router.post("/verify-email",isAuthenticated, verifyEmail)
router.get("/get-home-notification", getHomeNotification)


router.post("/send-otp-password",otpRequestLimiter, forgotPassSendOtp)
router.post("/recovery-password",otpRequestLimiter, passwordRecovery)

router.post("/update-profile",isAuthenticated, updateProfile)
router.post("/change-password",isAuthenticated, changePassword)



router.get("/check-redeem-eligibility",isAuthenticated, checkRedeemEligibility)

export default router;
