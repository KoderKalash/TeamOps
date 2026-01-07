import express from "express";
import { createTask, getTasks } from "../controllers/task.controller.js";
import protect from "../middleware/auth.middleware.js";
import restrictTo from "../middleware/role.middleware.js";

const router = express.Router();

router
  .route("/:projectId/tasks")
  .post(protect, restrictTo("admin", "manager"), createTask)
  .get(protect, getTasks);

export default router;
