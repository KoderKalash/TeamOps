import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Project from "../models/project.models.js";

export const createProject = asyncHandler(async (req, res, next) => {
    const owner = req.user._id
    const { name } = req.body
    if (!name)
        throw new AppError("Name is required", 400)

    const newProject = new Project({ name, owner })
    const saveProject = await newProject.save()

    res.status(201).json({
        status: "success",
        data: saveProject
    })
})

export const getMyProjects = asyncHandler(async (req, res, next) => {
    const role = req.user.role
    let projects

    if (role === 'admin')
        projects = await Project.find()

    else if (role === 'manager')
        projects = await Project.find({
            $or: [{ owner: req.user._id },
            { members: req.user._id }]
        })
    else
        projects = await Project.find({
            members: req.user._id
        })

    res.status(200).json({
        status: "success",
        results: projects.length,
        data: { projects }
    })
})

export const updateProject = asyncHandler(async (req, res, next) => {
    const project = await Project.findById(req.params.id)
    const role = req.user.role
    if (!project)
        throw next(new AppError("Project does not exist", 404))

    if (role !== 'admin' && project.owner.toString() !== req.user._id.toString())
        throw new AppError("Not Authorized to update this project", 403)

    delete req.body.owner;


    //update logic
    const updatedProject = await Project.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true } //to return the updated document
    )


    res.status(200).json({
        status: "success",
        data: { project: updatedProject }
    })
})

export const deleteProject = asyncHandler(async (req, res, next) => {
    const project = await Project.findById(req.params.id)
    const role = req.user.role
    if (!project)
        throw new AppError("Project does not exist", 404)

    if (role !== 'admin' && project.owner.toString() !== req.user._id.toString())
        throw new AppError("Not Authorized to delete this project", 403)

    //delete logic
    await project.deleteOne()

    res.status(204).json({
        status: "success",
        data: null
    })
})