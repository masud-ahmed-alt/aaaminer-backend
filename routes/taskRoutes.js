import express from 'express';
import { completeTask } from '../controllers/taskController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Middleware to protect routes
router.use(authMiddleware);

// Complete a task
router.post('/complete', completeTask);

// Additional task-related routes can go here

export default router;
