import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/db"; // Assuming you reuse the connectDB function
import User from "./models/User";
import Product from "./models/Product";
import Order from "./models/Order";
import { IUser } from "./models/User";

dotenv.config();

// --- 1. Load Database Connection ---
connectDB();

// --- 2. Dummy Data (Replace with richer data as needed) ---

// Sample Admin User (The password "AdminPass123" will be hashed by the model's pre-save hook)
const adminUser: Partial<IUser> = {
  firstName: "System",
  lastName: "Admin",
  email: "admin@eshop.com",
  password: "AdminPass123",
  role: "admin",
  addresses: [
    {
      street: "100 Admin Ave",
      city: "Metropolis",
      state: "CA",
      zipCode: "90001",
      country: "USA",
      isDefault: true,
    },
  ],
};

// Dummy Products across categories
const dummyProducts = [
  {
    name: "4K Ultra HD Smart TV",
    slug: "4k-ultra-hd-smart-tv",
    description:
      "Experience stunning picture quality with vibrant colors and deep blacks. Includes smart features for streaming.",
    technicalDetails: "65-inch, OLED, 120Hz Refresh Rate, 3x HDMI 2.1",
    category: "Electronics",
    brand: "ElectroMax",
    price: 1299.99,
    stock: 15,
    images: ["/images/tv1.jpg"],
    isFeatured: true,
  },
  {
    name: "Organic Mixed Greens (500g)",
    slug: "organic-mixed-greens",
    description: "Freshly harvested organic mixed salad greens, ready to eat.",
    technicalDetails: "Weight: 500g, Certified Organic, Grown locally.",
    category: "Groceries",
    brand: "GreenFarm",
    price: 4.5,
    stock: 200,
    images: ["/images/greens1.jpg"],
    isFeatured: false,
  },
  {
    name: "Premium Cotton T-Shirt",
    slug: "premium-cotton-t-shirt",
    description:
      "Soft and breathable 100% cotton T-shirt, perfect for daily wear.",
    technicalDetails: "Material: 100% Pima Cotton, Weight: 180gsm.",
    category: "Shirts",
    brand: "EssentialWear",
    price: 24.99,
    stock: 50,
    images: ["/images/shirt1.jpg"],
    variants: [
      { type: "color", value: "White" },
      { type: "color", value: "Black" },
      { type: "size", value: "S" },
      { type: "size", value: "M" },
    ],
    isFeatured: true,
  },
  {
    name: "Slim Fit Denim Pants",
    slug: "slim-fit-denim-pants",
    description: "Classic five-pocket styling with a modern slim fit.",
    technicalDetails: "Material: 98% Cotton, 2% Elastane, Wash: Dark Indigo.",
    category: "Pants",
    brand: "DenimPro",
    price: 79.99,
    stock: 30,
    images: ["/images/pants1.jpg"],
  },
  {
    name: "Luxury Leather Wallet",
    slug: "luxury-leather-wallet",
    description: "Handcrafted genuine leather wallet with RFID protection.",
    category: "Fashion Accessories",
    brand: "StyleCraft",
    price: 49.0,
    stock: 12,
    images: ["/images/wallet1.jpg"],
  },
  {
    name: "Toilet Paper - 12 Rolls",
    slug: "toilet-paper-12-rolls",
    description: "Soft and strong 2-ply toilet paper, pack of 12 rolls.",
    category: "Daily Essentials",
    brand: "HomeNeeds",
    price: 15.5,
    stock: 80,
    images: ["/images/tp1.jpg"],
  },
];

// --- 3. Import Data Function ---

const importData = async () => {
  try {
    // Clear old data
    await destroyData();

    // 1. Create Users
    const createdUsers = await User.create([adminUser]);
    const admin = createdUsers[0];

    // 2. Assign Admin ID to Products (for ownership/creation tracking)
    const sampleProducts = dummyProducts.map((product) => {
      // This is a dummy field, assuming the Product model tracks who created it
      return { ...product, userId: admin._id };
    });

    // 3. Create Products
    await Product.create(sampleProducts);

    console.log("✅ Data Imported!");
    process.exit();
  } catch (error) {
    console.error(`❌ Error with data import: ${(error as Error).message}`);
    process.exit(1);
  }
};

// --- 4. Destroy Data Function ---

const destroyData = async () => {
  try {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    console.log("🗑️ Data Destroyed!");
  } catch (error) {
    console.error(`❌ Error destroying data: ${(error as Error).message}`);
    process.exit(1);
  }
};

// --- 5. Execution Logic ---

// Check for the '-d' argument to determine if we should destroy data
if (process.argv[2] === "-d") {
  destroyData().finally(() => mongoose.connection.close());
} else {
  importData().finally(() => mongoose.connection.close());
}
