import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import Order from "../database/models/Order";
import Product from "../database/models/Product";
import stripe from "../config/stripe";
import mongoose from "mongoose";

// --- Utility Function (Should reside in a dedicated service layer in full Clean Arch) ---

/**
 * Validates cart items against database prices and stock, and calculates the total amount in cents.
 * @param cartItems Array of items from the client.
 * @returns Total amount in cents.
 * @throws Error if product is not found, stock is insufficient, or data is invalid.
 */
const calculateOrderAmount = async (cartItems: any[]): Promise<number> => {
  let total = 0;

  // We must validate and calculate the price server-side for security.
  for (const item of cartItems) {
    if (!item.productId || !item.quantity || item.quantity <= 0) {
      throw new Error("Invalid item data in cart.");
    }

    const product = await Product.findById(item.productId);

    if (!product) {
      throw new Error(`Product not found for ID: ${item.productId}`);
    }

    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for product: ${product.name}`);
    }

    const price = product.discountedPrice || product.price;
    total += price * item.quantity;
  }

  // Total must be returned in cents for Stripe API
  return Math.round(total * 100);
};

// --- Controller Functions ---

// @desc    Create new order and Stripe Payment Intent
// @route   POST /api/v1/orders/checkout
// @access  Private (User)
export const createOrder = async (req: AuthRequest, res: Response) => {
  const { cartItems, shippingAddress, paymentMethod } = req.body;
  const userId = req.user!.id;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: "No items in cart" });
  }

  if (!shippingAddress) {
    return res.status(400).json({ message: "Shipping address is required" });
  }

  try {
    // 1. Calculate Server-Side Total (in cents)
    const amountInCents = await calculateOrderAmount(cartItems);
    const finalTotal = amountInCents / 100;

    // 2. Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      // Optional: Include descriptive metadata
      metadata: {
        userId: userId,
        cartHash: new mongoose.Types.ObjectId().toString(),
      },
      automatic_payment_methods: { enabled: true },
    });

    // 3. Create the Order document (Status: Pending)
    const order = await Order.create({
      userId,
      items: cartItems.map((item: any) => ({
        productId: item.productId,
        name: item.name,
        variant: item.variant,
        image: item.image,
        quantity: item.quantity,
        // IMPORTANT: Use the validated price from the server logic for accurate records
        price: item.price,
      })),
      totalAmount: finalTotal,
      shippingAddress,
      paymentMethod,
      paymentIntentId: paymentIntent.id,
      status: "Pending", // Waiting for Stripe confirmation
    });

    // 4. Respond with client secret for frontend payment form
    res.status(201).json({
      orderId: order._id,
      clientSecret: paymentIntent.client_secret,
      message: "Payment intent created. Waiting for confirmation.",
    });
  } catch (error: any) {
    console.error("Order/Stripe Error:", error.message);
    res.status(500).json({
      message:
        error.message ||
        "Order creation failed due to validation or payment error.",
    });
  }
};

// @desc    Get logged in user orders history
// @route   GET /api/v1/orders/history
// @access  Private (User)
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  // Note: Populating userId fields for display purposes
  const orders = await Order.find({ userId: req.user!.id })
    .sort({ createdAt: -1 })
    .populate("userId", "email firstName");

  res.json(orders);
};

// @desc    Endpoint for Stripe Webhook (handle payment success/failure)
// @route   POST /api/v1/orders/webhook
// @access  Public (Stripe)
export const stripeWebhook = async (req: Request, res: Response) => {
  // --- SECURITY CRITICAL ---
  // A robust webhook MUST verify the signature header (Stripe-Signature)
  // using stripe.webhooks.constructEvent to prevent fraudulent requests.
  // (This requires a raw body parser, configured in app.ts/routes)

  const event = req.body;

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntentSucceeded = event.data.object;
      const orderId = paymentIntentSucceeded.metadata?.orderId; // If metadata was passed

      // 1. Update Order Status
      const order = await Order.findOneAndUpdate(
        { paymentIntentId: paymentIntentSucceeded.id },
        {
          isPaid: true,
          paidAt: new Date(),
          status: "Processing", // Ready for fulfillment
        },
        { new: true }
      );

      if (order) {
        // 2. Real-time Stock Update: Reduce product stock
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity }, // Decrement stock
          });
        }
      }
      console.log(`Payment Intent Succeeded: ${paymentIntentSucceeded.id}`);
      break;

    case "payment_intent.payment_failed":
      const paymentIntentFailed = event.data.object;
      // Handle failed payment (e.g., email user, log error)
      await Order.findOneAndUpdate(
        { paymentIntentId: paymentIntentFailed.id },
        { status: "Cancelled" }
      );
      console.log(`Payment Intent Failed: ${paymentIntentFailed.id}`);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
};
