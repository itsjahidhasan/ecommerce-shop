import { Request, Response } from "express";
import User from "../database/models/User";

import jwt, { SignOptions } from "jsonwebtoken";

export const generateToken = (id: string): string => {
  const { JWT_SECRET, JWT_EXPIRE } = process.env;

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const expiresIn = (JWT_EXPIRE || "1d") as SignOptions["expiresIn"];

  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn,
    algorithm: "HS256",
  });
};
// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password, // Hashed by pre-save hook
    role: "user",
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id.toString()),
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  // Note: matchPassword is a method defined on the User model
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id.toString()),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};
