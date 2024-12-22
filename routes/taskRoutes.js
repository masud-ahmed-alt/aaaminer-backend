import express from 'express';
import { completeScratchCard, completeTask, getRanking, getUserScratchCards, getUserTasks } from '../controllers/taskController.js';
import {isAuthenticated} from '../middlewares/authMiddleware.js';

const router = express.Router();

// Middleware to protect routes
router.use(isAuthenticated);

router.get("/get-tasks", getUserTasks)
router.get("/get-scratch-card", getUserScratchCards)
router.get("/get-ranking", getRanking)

// Complete a task
router.post('/complete', completeTask);
router.post('/complete-scratch-card', completeScratchCard);

// Additional task-related routes can go here

export default router;
