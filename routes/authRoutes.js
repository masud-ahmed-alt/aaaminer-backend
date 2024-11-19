import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

// Register a new user
router.post('/register', register);

// Login a user
router.post('/login', login);

// Additional routes can go here (e.g., forgot password, logout)

export default router;
