import express from "express";
import cors from "cors";
import morgan from "morgan";
import { notFound, errorHandler } from "./middleware/errorMiddleware";

// Import Routes
import authRoutes from "./routes/v1/authRoutes";
import productRoutes from "./routes/v1/productRoutes";
import orderRoutes from "./routes/v1/orderRoutes";
import adminRoutes from "./routes/v1/adminRoutes";
// Admin routes should be imported last or secured correctly

const app = express();

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Body parser for JSON
app.use(morgan("dev")); // Logging

// Routes
app.get("/", (req, res) => {
  res.send("E-commerce API is running...");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/admin", adminRoutes); // Protected by admin middleware

// Custom Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;
