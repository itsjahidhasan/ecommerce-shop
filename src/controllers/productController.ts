import { Request, Response } from "express";
import Product from "../database/models/Product";
import { FilterQuery } from "mongoose";

// GET /api/v1/products
export const getProducts = async (req: Request, res: Response) => {
  const {
    category,
    priceMin,
    priceMax,
    brand,
    rating,
    sort,
    search,
    page = 1,
    limit = 10,
  } = req.query;

  const query: FilterQuery<typeof Product> = {};

  // 1. Build Query Filters
  if (category) query.category = { $in: (category as string).split(",") };
  if (brand) query.brand = { $in: (brand as string).split(",") };
  if (priceMin || priceMax) {
    query.price = {};
    if (priceMin) query.price.$gte = parseFloat(priceMin as string);
    if (priceMax) query.price.$lte = parseFloat(priceMax as string);
  }
  // Simple Search (case-insensitive name or description)
  if (search)
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];

  // 2. Sorting Logic
  let sortOptions: { [key: string]: "asc" | "desc" } = { popularity: "desc" };
  if (sort === "price_asc") sortOptions = { price: "asc" };
  if (sort === "price_desc") sortOptions = { price: "desc" };
  if (sort === "newest") sortOptions = { createdAt: "desc" };

  // 3. Pagination Logic
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  try {
    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit as string))
      .skip(skip);

    const count = await Product.countDocuments(query);

    res.json({
      products,
      page: parseInt(page as string),
      pages: Math.ceil(count / parseInt(limit as string)),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
};

// GET /api/v1/products/:slug
export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching product" });
  }
};
