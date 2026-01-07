import express from "express";
import { deleteTask, updateTask } from "../controllers/task.controller.js";
import protect from "../middleware/auth.middleware.js";
import restrictTo from "../middleware/role.middleware.js";

const router = express.Router();

router
  .route("/:taskId")
  .patch(protect, updateTask)
  .delete(protect, restrictTo("admin", "manager"), deleteTask);

export default router;
