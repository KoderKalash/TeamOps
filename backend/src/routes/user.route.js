import express from "express";
import protect from "../middleware/auth.middleware.js";
import restrictTo from "../middleware/role.middleware.js";
import { getUsers } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/users", protect, restrictTo("admin"), getUsers);

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
  });
});

export default router;
