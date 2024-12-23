import express from 'express';
import { completeScratchCard, completeTask, getCarousal, getRanking, getUserScratchCards, getUserTasks } from '../controllers/taskController.js';
import {isAuthenticated} from '../middlewares/authMiddleware.js';

const router = express.Router();



router.get("/carousals", getCarousal)

router.use(isAuthenticated);
router.get("/get-tasks", getUserTasks)
router.get("/get-scratch-card", getUserScratchCards)
router.get("/get-ranking", getRanking)


router.post('/complete', completeTask);
router.post('/complete-scratch-card', completeScratchCard);



export default router;
