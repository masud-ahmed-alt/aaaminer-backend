import express from "express"
import {
    adminLogin, adminProfile, adminRegister, allUsers,
    createHomeNotification, deleteCarousalImage, getBannedUser, getSingleUser,
    getSuspectedUser, sendAnnouncementEmail,
    uploadCarousalImage,
    userGrowData, withdrawHistory
} from "../controllers/adminController.js";
import { isAdmin } from "../middlewares/authMiddleware.js"


const router = express.Router();

// Login a user
router.post('/login', adminLogin);
// router.post('/register', adminRegister);

router.get("/me", isAdmin, adminProfile)
router.get("/all-users", isAdmin, allUsers)
// router.get("/live-user-count", isAdmin, liveUserCount)
router.get("/withdraw", isAdmin, withdrawHistory)
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

export default router;