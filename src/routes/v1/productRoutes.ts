import express from "express";
import {
  getProducts,
  getProductBySlug,
} from "../../controllers/productController";
import { protect } from "../../middleware/authMiddleware";
import {
  addProductReview,
  getWishlist,
  toggleWishlist,
} from "../../controllers/userController";

const router = express.Router();

// Public routes (Listing and Detail)
router.get("/", getProducts);
router.get("/:slug", getProductBySlug);

// Protected user routes (Reviews, Wishlist)
router.post("/:id/reviews", protect, addProductReview); // Assuming :id is the Product ID
router.get("/user/wishlist", protect, getWishlist);
router.post("/user/wishlist/:productId", protect, toggleWishlist);

export default router;
