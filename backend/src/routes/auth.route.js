import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import authLimiter from "../middleware/authLimiter.middleware.js";

const router = express.Router();

router.post("/signup", authLimiter, register);
router.post("/login",authLimiter, login);

export default router;
