import express from "express"
import { adminLogin, adminRegister, allUsers, withdrawHistory } from "../controllers/adminController.js";
import {isAdmin} from "../middlewares/authMiddleware.js"


const router = express.Router();

// Login a user
router.post('/login', adminLogin);
// router.post('/register', adminRegister);

router.get("/all-users", isAdmin, allUsers)
// router.get("/live-user-count", isAdmin, liveUserCount)
router.get("/withdraw", isAdmin, withdrawHistory)

export default router;