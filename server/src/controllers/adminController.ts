import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import Product from "../database/models/Product";
import Order from "../database/models/Order";
import slugify from "slugify";

// @desc    Create a new product
// @route   POST /api/v1/admin/products
// @access  Private/Admin
export const createProduct = async (req: AuthRequest, res: Response) => {
  const { name, description, price, category, stock, brand, images } = req.body;

  try {
    const product = new Product({
      name,
      slug: slugify(name, { lower: true, strict: true }),
      description,
      price,
      category,
      stock,
      brand,
      images,
      userId: req.user!.id, // Creator ID
      averageRating: 0,
      numReviews: 0,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: "Error creating product" });
  }
};

// @desc    Get all orders
// @route   GET /api/v1/admin/orders
// @access  Private/Admin
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  const orders = await Order.find({}).populate("userId", "email firstName");
  res.json(orders);
};

// @desc    Update order status (Tracking System)
// @route   PUT /api/v1/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { status } = req.body; // new status: 'Processing', 'Shipped', 'Delivered', etc.
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = status;
    if (status === "Delivered") {
      order.deliveredAt = new Date();
    }
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};
