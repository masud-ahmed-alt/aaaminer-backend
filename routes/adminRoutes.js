import express from "express";
import {
    addRedeemCode,
    adminLogin, adminLogout, adminProfile, adminRegister, allUsers,
    bulkRedeemAction,
    createHomeNotification, deleteCarousalImage, deleteUser, getBannedUser, getSingleUser,
    getSuspectedUser,
    sendAnnouncement,
    setTopTenUser,
    uploadCarousalImage,
    userBanActions,
    userGrowData, userReviewActions, withdrawHistory,
    withdrawRequestActions,
    withdrawRequestDelete
} from "../controllers/adminController.js";
import { isAdmin } from "../middlewares/authMiddleware.js";




const router = express.Router();

// Login a user
router.post('/login', adminLogin);
router.post('/register', adminRegister);
router.get('/logout',isAdmin, adminLogout);

router.get("/me", isAdmin, adminProfile)
router.get("/all-users", isAdmin, allUsers)
router.post("/delete-user/:id", isAdmin, deleteUser)
// router.get("/live-user-count", isAdmin, liveUserCount)
router.get("/withdraw", isAdmin, withdrawHistory)
router.post("/withdraw-actions/:id", isAdmin, withdrawRequestActions)
router.post("/bulk-redeem", isAdmin, bulkRedeemAction)



router.get("/user-growth", isAdmin, userGrowData)


router.put("/send-mail", isAdmin, sendAnnouncement)
router.post("/create-home-notification", isAdmin, createHomeNotification)


router.post("/upload-carousal", isAdmin, uploadCarousalImage)
router.delete('/delete-carousal/:id', deleteCarousalImage);


// User validation routes
router.get("/get-single-user/:id", isAdmin, getSingleUser);


// find suspected users
router.get("/get-suspected-user", isAdmin, getSuspectedUser);
router.get("/get-banned-user", isAdmin, getBannedUser);
router.put("/user-ban-action/:userId", isAdmin, userBanActions);
router.put("/user-review-action/:userId", isAdmin, userReviewActions);

router.get("/top-ten-user", isAdmin, setTopTenUser)
router.delete("/delete-request", isAdmin, withdrawRequestDelete)


// Redeem Code 
router.post("/add-redeem-code", isAdmin, addRedeemCode)

export default router;