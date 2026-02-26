import User from "../models/user.models.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { signToken } from "../utils/jwt.js";
import bcrypt from "bcrypt";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    throw new AppError("Credentials required", 400);

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  )
    throw new AppError("Invalid data types", 400);

  if (name.trim() === "" || email.trim() === "" || password.trim() === "")
    throw new AppError("Fields cannot be empty", 400);

  if (password.length < 6)
    throw new AppError("Password must be at least 6 characters", 400);

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (await User.findOne({ email: normalizedEmail }))
    throw new AppError("Email already exists", 409);

  const user = new User({
    name: normalizedName,
    email: normalizedEmail,
    password,
  });

  try {
    await user.save();
  } catch (error) {
    if (error?.code === 11000) throw new AppError("Email already exists", 409);
    throw error;
  }
  const token = signToken(user._id); //auto-login after registration

  res.status(201).json({
    name: user.name,
    email: user.email,
    token,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError("Credentials required", 400);

  if (typeof email !== "string" || typeof password !== "string")
    throw new AppError("Invalid data types", 400);

  if (email.trim() === "" || password.trim() === "")
    throw new AppError("Fields cannot be empty", 400);

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) throw new AppError("Invalid Credentials", 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError("Invalid Credentials", 401);

  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});
