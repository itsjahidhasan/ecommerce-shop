import express from "express";
import { protect } from "../../middleware/authMiddleware";
import { authorize } from "../../middleware/roleMiddleware";
import {
  createProduct,
  getAllOrders,
  updateOrderStatus,
} from "../../controllers/adminController";

const router = express.Router();

// All routes here require ADMIN role
router.use(protect, authorize("admin"));

// Product Management
router.route("/products").post(createProduct);
// router.route('/products/:id').put(updateProduct).delete(deleteProduct);

// Order Management
router.route("/orders").get(getAllOrders);
router.route("/orders/:id/status").put(updateOrderStatus);

export default router;
