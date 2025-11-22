import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import User from "../database/models/User";
import Product from "../database/models/Product";
import mongoose from "mongoose";

// --- Profile and Management ---

// @desc    Get user profile (User Dashboard)
// @route   GET /api/v1/users/profile
// @access  Private (User)
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  // req.user is set by the protect middleware
  const user = await User.findById(req.user!.id).select("-password");

  if (user) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      addresses: user.addresses,
      role: user.role,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private (User)
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id);
  const { firstName, lastName, email, password } = req.body;

  if (user) {
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;

    // Only update password if explicitly provided
    if (password) {
      // The pre-save hook in the User model will handle hashing
      user.password = password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      email: updatedUser.email,
      message: "Profile updated successfully",
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// --- Address Management ---

// @desc    Add a new address to user profile
// @route   POST /api/v1/users/addresses
// @access  Private (User)
export const addAddress = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id);
  const newAddress = req.body; // Expects { street, city, state, zipCode, country }

  if (user) {
    user.addresses.push(newAddress);
    const updatedUser = await user.save();
    res.status(201).json(updatedUser.addresses);
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// --- Wishlist Management ---

// @desc    Get user's wishlist
// @route   GET /api/v1/products/user/wishlist
// @access  Private (User)
export const getWishlist = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id).populate("wishlist");

  if (user) {
    // Send back the populated wishlist products
    res.json(user.wishlist);
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// @desc    Add or remove a product from wishlist
// @route   POST /api/v1/products/user/wishlist/:productId
// @access  Private (User)
export const toggleWishlist = async (req: AuthRequest, res: Response) => {
  const { productId } = req.params;

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  const productObjectId = new mongoose.Types.ObjectId(productId);

  try {
    // Check if product is already in wishlist
    const user = await User.findOne({ _id: userId, wishlist: productObjectId });

    let updatedUser;

    if (user) {
      // Product exists → remove it
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { wishlist: productObjectId } },
        { new: true }
      );
      res.json({
        message: "Product removed from wishlist",
        wishlist: updatedUser?.wishlist.map((id) => id.toString()),
      });
    } else {
      // Product not in wishlist → add it
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { wishlist: productObjectId } },
        { new: true }
      );
      res.json({
        message: "Product added to wishlist",
        wishlist: updatedUser?.wishlist.map((id) => id.toString()),
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Product Reviews and Ratings ---

// @desc    Add a product review and rating
// @route   POST /api/v1/products/:id/reviews
// @access  Private (User)
export const addProductReview = async (req: AuthRequest, res: Response) => {
  const { rating, review } = req.body;
  const userId = req.user!.id;
  const { id: productId } = req.params;

  const product = await Product.findById(productId);
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.userId.toString() === userId.toString()
    );

    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: "Product already reviewed by this user" });
    }

    const newReview = {
      userId: new mongoose.Types.ObjectId(userId),
      name: `${user.firstName} ${user.lastName}`,
      rating: Number(rating),
      review,
      createdAt: new Date(),
    };

    // Add the new review
    product.reviews.push(newReview as any);

    // The ProductSchema pre-save hook automatically updates averageRating and numReviews
    await product.save();

    res.status(201).json({
      message: "Review added successfully",
      averageRating: product.averageRating,
    });
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};
