import express from 'express';
import { register, login, profile, withdrawRequest, myVouchers, verifyEmailSendOtp, verifyEmail, forgotPassSendOtp } from '../controllers/authController.js';
import { isAuthenticated, otpRequestLimiter } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Register a new user
router.post('/register', register);

// Login a user
router.post('/login', login);
router.get('/me', isAuthenticated, profile);

// Additional routes can go here (e.g., forgot password, logout)
router.post('/withdraw', isAuthenticated, withdrawRequest);
router.get('/myvoucher', isAuthenticated, myVouchers);


router.post("/send-otp-email",otpRequestLimiter, isAuthenticated, verifyEmailSendOtp)
router.post("/verify-email",isAuthenticated, verifyEmail)


router.post("/send-otp-password",otpRequestLimiter, forgotPassSendOtp)

export default router;
