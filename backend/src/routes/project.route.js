import express from "express"
import {
    createProject,
    getMyProjects,
    updateProject,
    deleteProject
} from "../controllers/project.controller.js"
import protect from "../middleware/auth.middleware.js"
import restrictTo from "../middleware/role.middleware.js"

const router = express.Router()

router
    .route('/')
    .post(protect,restrictTo('admin','manager'),createProject)
    .get(protect,getMyProjects)

router
    .route('/:id')
    .patch(protect,restrictTo('admin','manager'),updateProject)
    .delete(protect,restrictTo('admin','manager'),deleteProject)

export default router