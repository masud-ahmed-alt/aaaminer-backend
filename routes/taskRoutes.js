import express from 'express';
import { completeTask, getUserTasks } from '../controllers/taskController.js';
import {isAuthenticated} from '../middlewares/authMiddleware.js';

const router = express.Router();

// Middleware to protect routes
router.use(isAuthenticated);

router.get("/get-tasks", getUserTasks)

// Complete a task
router.post('/complete', completeTask);

// Additional task-related routes can go here

export default router;
