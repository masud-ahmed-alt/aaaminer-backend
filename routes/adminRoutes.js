import express from "express"
import {
    adminLogin, adminProfile, adminRegister, allUsers,
    createHomeNotification, deleteCarousalImage, deleteUser, getBannedUser, getSingleUser,
    getSuspectedUser, sendAnnouncementEmail,
    uploadCarousalImage,
    userBanActions,
    userGrowData, withdrawHistory,
    withdrawRequestActions
} from "../controllers/adminController.js";
import { isAdmin } from "../middlewares/authMiddleware.js"


const router = express.Router();

// Login a user
router.post('/login', adminLogin);
// router.post('/register', adminRegister);

router.get("/me", isAdmin, adminProfile)
router.get("/all-users", isAdmin, allUsers)
router.post("/delete-user/:id", isAdmin, deleteUser)
// router.get("/live-user-count", isAdmin, liveUserCount)
router.get("/withdraw", isAdmin, withdrawHistory)
router.post("/withdraw-actions/:id",isAdmin, withdrawRequestActions)



router.get("/user-growth", isAdmin, userGrowData)


router.post("/send-announcement", sendAnnouncementEmail)
router.post("/create-home-notification", isAdmin, createHomeNotification)


router.post("/upload-carousal", isAdmin, uploadCarousalImage)
router.delete('/delete-carousal/:id', deleteCarousalImage);


// User validation routes
router.get("/get-single-user/:id", isAdmin, getSingleUser);


// find suspected users
router.get("/get-suspected-user", isAdmin, getSuspectedUser);
router.get("/get-banned-user", isAdmin, getBannedUser);
router.get("/user-ban-action/:userId", isAdmin, userBanActions);

export default router;