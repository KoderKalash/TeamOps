import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Project from "../models/project.models.js";
import APIFeatures from "../utils/apifeatures.js";

export const createProject = asyncHandler(async (req, res, next) => {
  const owner = req.user._id;
  const { name } = req.body;
  if (!name) throw new AppError("Name is required", 400);

  const newProject = new Project({ name, owner });
  const saveProject = await newProject.save();

  res.status(201).json({
    status: "success",
    data: saveProject,
  });
});

export const addProjectMembers = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const { userId, members } = req.body;
  if (members) return next(new AppError("Only userId is accepted", 400));

  if (!userId) return next(new AppError("UserId is required", 400));

  const project = await Project.findById(projectId);
  if (!project) return next(new AppError("Project not found", 404));

  if (
    req.user.role !== "admin" &&
    project.owner.toString() !== req.user._id.toString()
  )
    return next(new AppError("Not Authorized", 403));

  project.members.addToSet(userId);
  await project.save();

  res.status(200).json({
    status: "success",
    data: {
      projectId: project._id,
      members: project.members,
    },
  });
});

export const getMyProjects = asyncHandler(async (req, res, next) => {
  const role = req.user.role;

  let baseQuery;
  if (role === "user") {
    baseQuery = Project.find({
      members: req.user._id,
    });
  } else if (role === "manager") {
    baseQuery = Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    }).distinct("_id"); //remove duplicate results
  } else {
    baseQuery = Project.find();
  }
  const features = new APIFeatures(baseQuery, req.query)
    .filter()
    .search(["name","description"])
    .sort()
    .paginate();

  const projects = await features.query;

  res.status(200).json({
    status: "success",
    results: projects.length,
    data: { projects },
  });
});

export const updateProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  const role = req.user.role;
  if (!project) throw next(new AppError("Project does not exist", 404));

  if (role !== "admin" && project.owner.toString() !== req.user._id.toString())
    throw new AppError("Not Authorized to update this project", 403);

  delete req.body.owner;

  //update logic
  const updatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true } //to return the updated document
  );

  res.status(200).json({
    status: "success",
    data: { project: updatedProject },
  });
});

export const deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  const role = req.user.role;
  if (!project) throw new AppError("Project does not exist", 404);

  if (role !== "admin" && project.owner.toString() !== req.user._id.toString())
    throw new AppError("Not Authorized to delete this project", 403);

  await project.deleteOne();

  res.status(204).end();
});
