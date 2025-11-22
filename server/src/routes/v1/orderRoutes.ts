import express from "express";
import {
  createOrder,
  getMyOrders,
  stripeWebhook,
} from "../../controllers/orderController";
import { protect } from "../../middleware/authMiddleware";

const router = express.Router();

// Protected user routes
router.post("/checkout", protect, createOrder);
router.get("/history", protect, getMyOrders);

// Public route for Stripe Webhook (needs raw body parser configuration)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

export default router;
