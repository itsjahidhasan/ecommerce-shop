import dotenv from "dotenv";
import { connectDB } from "./config/db";
import app from "./app";

dotenv.config();

// Connect Database
connectDB();

const PORT = process.env.PORT || 5000;

console.log("Starting server...");

// app.listen(PORT, () =>
//   console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
// );

export default app;
