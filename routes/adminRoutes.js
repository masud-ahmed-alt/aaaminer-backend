import express from "express";
import {
    addRedeemCode,
    adminLogin, adminLogout, adminProfile, adminRegister, allUsers,
    bulkRedeemAction, bulkRedeemActionLegacy,
    createHomeNotification, deleteCarousalImage, deleteUser, getBannedUser, getCarousalImages, getSingleUser, updateUser,
    getSuspectedUser,
    sendAnnouncement,
    uploadCarousalImage,
    userBanActions,
    userGrowData, userReviewActions, withdrawHistory,
    withdrawRequestActions,
    withdrawRequestDelete,
    createTask, getAllTasks, getTask, updateTask, deleteTask
} from "../controllers/adminController.js";
import { isAdmin } from "../middlewares/authMiddleware.js";

import { createRateLimiter } from "../microservices/apiLimiter.js";

const router = express.Router();

// Login a user
router.post('/login', createRateLimiter({
    max: 5,
    message: "Too many login attempts. Please try again later.",
}), adminLogin);
router.post('/register', adminRegister);
router.get('/logout', isAdmin, adminLogout);

router.get("/me", isAdmin, adminProfile)
router.get("/all-users", isAdmin, allUsers)
router.put("/update-user/:id", isAdmin, updateUser)
router.post("/delete-user/:id", isAdmin, deleteUser)
router.get("/withdraw", isAdmin, withdrawHistory)
router.post("/withdraw-actions/:id", isAdmin, withdrawRequestActions)
router.post("/bulk-redeem", isAdmin, bulkRedeemActionLegacy)
router.post("/bulk-redeem-codes", isAdmin, bulkRedeemAction)

router.get("/user-growth", isAdmin, userGrowData)

router.put("/send-mail", isAdmin, sendAnnouncement)
router.post("/create-home-notification", isAdmin, createHomeNotification)

router.get("/carousal", isAdmin, getCarousalImages);
router.post("/upload-carousal", isAdmin, uploadCarousalImage)
router.delete('/delete-carousal/:id', isAdmin, deleteCarousalImage);


// User validation routes
router.get("/get-single-user/:id", isAdmin, getSingleUser);

// find suspected users
router.get("/get-suspected-user", isAdmin, getSuspectedUser);
router.get("/get-banned-user", isAdmin, getBannedUser);
router.put("/user-ban-action/:userId", isAdmin, userBanActions);
router.put("/user-review-action/:userId", isAdmin, userReviewActions);

router.delete("/delete-request", isAdmin, withdrawRequestDelete)

router.post("/add-redeem-code", isAdmin, addRedeemCode)

// Task CRUD routes
router.post("/task", isAdmin, createTask);
router.get("/tasks", isAdmin, getAllTasks);
router.get("/task/:id", isAdmin, getTask);
router.put("/task/:id", isAdmin, updateTask);
router.delete("/task/:id", isAdmin, deleteTask);

export default router;