import Project from "../models/project.models.js";
import Task from "../models/task.models.js";
import User from "../models/user.models.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createTask = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params // Destructuring projectId from req.params

    const { title, assignedTo, description, priority, dueDate } = req.body
    if (!title || !assignedTo)
        throw new AppError("Bad Request", 400)

    const project = await Project.findById(req.params.projectId)
    if (!project)
        throw next(new AppError("Project not Found", 404))

    //authorization
    if (
        req.user.role !== "admin" &&
        project.owner.toString() !== req.user._id.toString()
    ) {
        return next(new AppError("Not authorized to create task", 403));
    }

    const assignee = await User.findById(assignedTo)
    if (!assignee)
        throw next(new AppError("Assignee not found", 404))

    if (!project.members.includes(assignee._id)) {
        return next(new AppError("User is not a project member", 403))
    }

    const task = new Task({
        title,
        description,
        priority,
        dueDate,
        project: projectId,
        assignedTo,
        createdBy: req.user._id
    })

    res.status(201).json({
        status: "success",
        data: { task }
    })
})