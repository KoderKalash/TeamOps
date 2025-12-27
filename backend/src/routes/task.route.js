import express from "express"
import { createTask } from "../controllers/task.controller.js"
import protect from "../middleware/auth.middleware.js"
import restrictTo from "../middleware/role.middleware.js"

const router = express.Router()

router
    .route('/:projectId/task')
    .post(protect,restrictTo("admin","manager"),createTask)


export default router