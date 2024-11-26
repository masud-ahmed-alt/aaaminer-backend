import express from 'express';
import { completeTask, getRanking, getUserTasks } from '../controllers/taskController.js';
import {isAuthenticated} from '../middlewares/authMiddleware.js';

const router = express.Router();

// Middleware to protect routes
router.use(isAuthenticated);

router.get("/get-tasks", getUserTasks)
router.get("/get-ranking", getRanking)

// Complete a task
router.post('/complete', completeTask);

// Additional task-related routes can go here

export default router;
