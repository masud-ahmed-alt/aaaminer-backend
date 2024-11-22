import express from 'express';
import { register, login, profile } from '../controllers/authController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Register a new user
router.post('/register', register);

// Login a user
router.post('/login', login);
router.get('/me', isAuthenticated, profile);

// Additional routes can go here (e.g., forgot password, logout)

export default router;
