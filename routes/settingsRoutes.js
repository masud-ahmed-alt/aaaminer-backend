import express from "express";
import {
  getSettings,
  updateSettings,
  toggleRedeem,
  getRedeemSettings,
  checkAppUpdate,
} from "../controllers/settingsController.js";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/settings-status", isAdmin, getSettings);
router.put("/update-settings", isAdmin, updateSettings);
router.post("/toggle-redeem", isAdmin, toggleRedeem);
router.get("/redeem-settings", isAuthenticated, getRedeemSettings);
router.get("/check-update", checkAppUpdate);

export default router;
