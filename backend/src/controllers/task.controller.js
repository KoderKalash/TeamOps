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
        throw new AppError("Project not Found", 404)

    //authorization
    if (
        req.user.role !== "admin" &&
        project.owner.toString() !== req.user._id.toString()
    ) {
        return next(new AppError("Not authorized to create task", 403));
    }

    const assignee = await User.findById(assignedTo)
    if (!assignee)
        throw new AppError("Assignee not found", 404)

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

export const getTasks = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params
    const role = req.user.role
    const project = await Project.findById(req.params.projectId)
    if (!project)
        return next(new AppError("Project not found", 404))

    if (role !== 'admin' && project.owner.toString() !== req.user._id.toString() && !project.members.map(id => id.toString()).includes(req.user._id.toString()))
        return next(new AppError("Not authorized", 403))

    let tasks
    if (role === "admin" || role === "manager")
        tasks = await Task.find({
            project: projectId
        })
    else
        tasks = await Task.find({
            project: projectId,
            assignedTo: req.user._id
        })

    res.status(200).json({
        status: "success",
        results: tasks.length,
        data: { tasks }
    })
})

export const updateTask = asyncHandler(async (req, res, next) => {
    const { taskId } = req.params
    const role = req.user.role
    const user = req.user._id

    const { title, assignedTo, description, priority, dueDate } = req.body

    const task = await Task.findById(req.params.taskId)
    if (!task)
        throw new AppError("Task not found", 404)

    const project = await Project.findById(task.project)
    if(!project) 
        throw new AppError("Project not found",404)

    const owner = project.owner.toString() === user.toString()

    if(role !== "admin" && !owner && project.members.map(id=>id.toString()).includes(user.toString()))
        throw new AppError("Not Authorized",403)

    const updatedTask = await Task.findByIdAndUpdate(
        req.params.taskId,
        req.body,
        {new: true, runValidators: true}
    )

    //Auth based updation
        

})