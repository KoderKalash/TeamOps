import User from "../models/user.models.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { signToken } from "../utils/jwt.js";
import bcrypt from "bcrypt";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    throw new AppError(("Credentials required", 401));

  const user = new User({ name, email, password });

  const saveU = await user.save();

  res.status(201).json(saveU);
});

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError("Credentials Required", 400);

  const user = await User.findOne({ email });
  if (!user) throw new AppError("User not Found", 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError("Wrong Password!", 401);

  const token = signToken(user._id);

  res.status(201).json({
    status: "success",
    token,
  });
};
