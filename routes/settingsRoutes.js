// routes/adminRoutes.js
import express from "express";
import {
  getSettings,
  toggleRedeem,
} from "../controllers/settingsController.js";
import { isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/settings-status", isAdmin, getSettings);
router.post("/toggle-redeem", isAdmin, toggleRedeem);

export default router;
