import express from "express";
import { protect } from "../../middleware/authMiddleware";
import {
  getUserProfile,
  updateUserProfile,
  addAddress,
} from "../../controllers/userController";

const router = express.Router();

router.use(protect); // Apply protection to all routes in this router

// Profile Management
router.route("/profile").get(getUserProfile).put(updateUserProfile);

// Address Management
router.post("/addresses", addAddress);

export default router;

// --- Don't forget to import and use this router in src/app.ts ---
// app.use('/api/v1/users', userRoutes);
