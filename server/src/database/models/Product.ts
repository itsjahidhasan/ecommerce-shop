// ... (Content identical to previous Product Schema response)
// Includes name, slug, description, category, price, stock, images, reviews, etc.
// Includes pre-save hook for updating average rating
import mongoose, { Document, Schema } from "mongoose";

// --- Type Definitions ---
interface IReview {
  userId: mongoose.Schema.Types.ObjectId;
  name: string;
  rating: number;
  review: string;
  createdAt: Date;
}

interface IVariant {
  type: "color" | "size" | "material";
  value: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  technicalDetails: string;
  category: string;
  brand: string;
  price: number;
  discountedPrice?: number;
  images: string[];
  stock: number;
  variants: IVariant[];
  reviews: IReview[];
  averageRating: number;
  numReviews: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// --- Schema Definition ---
const ReviewSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true },
  },
  { timestamps: true }
);

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    technicalDetails: { type: String },
    category: { type: String, required: true, index: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    discountedPrice: { type: Number },
    images: [{ type: String }],
    stock: { type: Number, required: true, default: 0, min: 0 },
    variants: [
      {
        type: {
          type: String,
          enum: ["color", "size", "material"],
          required: true,
        },
        value: { type: String, required: true },
      },
    ],
    reviews: [ReviewSchema],
    averageRating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// --- Pre-save Hook (Update Average Rating) ---
ProductSchema.pre("save", function (this: IProduct, next: any) {
  if (this.reviews && this.reviews.length > 0) {
    const totalRating = this.reviews.reduce(
      (acc, review) => acc + review.rating,
      0
    );
    this.averageRating = parseFloat(
      (totalRating / this.reviews.length).toFixed(1)
    );
    this.numReviews = this.reviews.length;
  } else {
    this.averageRating = 0;
    this.numReviews = 0;
  }
  next();
});

const Product = mongoose.model<IProduct>("Product", ProductSchema);
export default Product;
