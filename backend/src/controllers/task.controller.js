import Project from "../models/project.models.js";
import Task from "../models/task.models.js";
import User from "../models/user.models.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import APIFeatures from "../utils/apifeatures.js"

export const createTask = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params; // Destructuring projectId from req.params

  const { title, assignedTo, description, priority, dueDate } = req.body;
  if (!title || !assignedTo) return next(new AppError("Bad Request", 400));

  const project = await Project.findById(req.params.projectId);
  if (!project) return next(new AppError("Project not Found", 404));

  //authorization
  if (
    req.user.role !== "admin" &&
    project.owner.toString() !== req.user._id.toString()
  ) {
    return next(new AppError("Not authorized to create task", 403));
  }

  const assignee = await User.findById(assignedTo);
  if (!assignee) return next(new AppError("Assignee not found", 404));

  if (
    !project.members
      .map((id) => id.toString())
      .includes(assignee._id.toString())
  ) {
    return next(new AppError("User is not a project member", 403));
  }

  const task = new Task({
    title,
    description,
    priority,
    dueDate,
    project: projectId,
    assignedTo,
    createdBy: req.user._id,
  });

  const saveT = await task.save();

  res.status(201).json({
    status: "success",
    data: { task: saveT },
  });
});

export const getTasks = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const role = req.user.role;
  const project = await Project.findById(req.params.projectId);
  if (!project) return next(new AppError("Project not found", 404));

  if (
    role !== "admin" &&
    project.owner.toString() !== req.user._id.toString() &&
    !project.members
      .map((id) => id.toString())
      .includes(req.user._id.toString())
  )
    return next(new AppError("Not authorized", 403));

  let baseQuery;
  if (role === "user") {
    baseQuery = Task.find({
      project: projectId,
      assignedTo: req.user._id,
    });
  } else {
    baseQuery = Task.find({
      project: projectId,
    });
  }

  const features = new APIFeatures(baseQuery, req.query)
    .filter()
    .search()
    .sort()
    .paginate();

  const tasks = await features.query;

  res.status(200).json({
    status: "success",
    results: tasks.length,
    data: { tasks },
  });
});

export const updateTask = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;
  const role = req.user.role;
  const user = req.user._id;

  const { title, assignedTo, description, priority, dueDate } = req.body;

  const task = await Task.findById(req.params.taskId);
  if (!task) return next(new AppError("Task not found", 404));

  const project = await Project.findById(task.project);
  if (!project) return next(new AppError("Project not found", 404));

  const owner = project.owner.toString() === user.toString();

  if (
    role !== "admin" &&
    !owner &&
    !project.members.map((id) => id.toString()).includes(user.toString())
  )
    return next(new AppError("Not Authorized", 403));

  //Auth based updation
  if (role === "user") {
    if (task.assignedTo.toString() !== user.toString())
      return next(new AppError("Not Authorized", 403));

    const allowedUpdates = ["status"];
    const updatedKeys = Object.keys(req.body); // this gives array of keys present in req.body

    const isValid = updatedKeys.every((key) => allowedUpdates.includes(key));
    if (!isValid)
      return next(new AppError("Users can only update task status", 403));
  }

  if ((role === "manager" || role === "admin") && assignedTo) {
    const validAssignee = project.members
      .map((id) => id.toString())
      .includes(assignedTo.toString());

    if (!validAssignee)
      return next(new AppError("Assignee is not a member of the Project", 400));
  }

  //Protecting immutable fields

  delete req.body.createdBy;
  delete req.body.project;

  //final update
  const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: { task: updatedTask },
  });
});

export const deleteTask = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;
  const task = await Task.findById(taskId);
  if (!task) return next(new AppError("Task not found", 404));

  const project = await Project.findById(task.project);
  if (!project) return next(new AppError("Project not found", 404));

  const role = req.user.role;
  const isOwner = project.owner.toString() === req.user._id.toString();

  if (role === "user" || (role === "manager" && !isOwner))
    return next(new AppError("Not Authorized", 403));

  await task.deleteOne();

  res.status(204).end();
});
