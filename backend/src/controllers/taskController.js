import { Task } from "../models/Task.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";

const taskPopulate = [
  {
    path: "project",
    select: "name color status progress dueDate category"
  },
  {
    path: "assignee",
    select: "name email avatar role presence jobTitle"
  },
  {
    path: "reporter",
    select: "name email avatar role presence jobTitle"
  },
  {
    path: "comments.user",
    select: "name avatar role jobTitle"
  }
];

export const getTasks = asyncHandler(async (req, res) => {
  const { search = "", status, priority, project } = req.query;
  const query = { workspace: req.user.workspace._id };

  if (status && status !== "all") {
    query.status = status;
  }
  if (priority && priority !== "all") {
    query.priority = priority;
  }
  if (project) {
    query.project = project;
  }
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $elemMatch: { $regex: search, $options: "i" } } }
    ];
  }

  const tasks = await Task.find(query)
    .populate(taskPopulate)
    .sort({ dueDate: 1, createdAt: -1 })
    .lean();

  res.json({
    success: true,
    data: tasks
  });
});

export const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    workspace: req.user.workspace._id
  })
    .populate(taskPopulate)
    .lean();

  if (!task) {
    throw httpError(404, "Task not found");
  }

  res.json({
    success: true,
    data: task
  });
});

export const createTask = asyncHandler(async (req, res) => {
  const { title, project, assignee, description, status, priority, dueDate, sprint, estimatedHours, tags, checklist, attachments, category } =
    req.body;

  if (!title || !project || !assignee) {
    throw httpError(400, "Title, project, and assignee are required");
  }

  const task = await Task.create({
    workspace: req.user.workspace._id,
    reporter: req.user._id,
    title,
    project,
    assignee,
    description,
    status,
    priority,
    dueDate,
    sprint,
    estimatedHours,
    tags,
    checklist,
    attachments,
    category
  });

  const populatedTask = await Task.findById(task._id).populate(taskPopulate).lean();

  res.status(201).json({
    success: true,
    data: populatedTask
  });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    workspace: req.user.workspace._id
  });

  if (!task) {
    throw httpError(404, "Task not found");
  }

  const fields = [
    "title",
    "project",
    "assignee",
    "description",
    "status",
    "priority",
    "dueDate",
    "startDate",
    "sprint",
    "estimatedHours",
    "tags",
    "checklist",
    "attachments",
    "category"
  ];

  for (const field of fields) {
    if (req.body[field] !== undefined) {
      task[field] = req.body[field];
    }
  }

  await task.save();

  const populatedTask = await Task.findById(task._id).populate(taskPopulate).lean();

  res.json({
    success: true,
    data: populatedTask
  });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    workspace: req.user.workspace._id
  });

  if (!task) {
    throw httpError(404, "Task not found");
  }

  res.json({
    success: true,
    message: "Task deleted successfully"
  });
});

export const addTaskComment = asyncHandler(async (req, res) => {
  if (!req.body.text) {
    throw httpError(400, "Comment text is required");
  }

  const task = await Task.findOne({
    _id: req.params.id,
    workspace: req.user.workspace._id
  });

  if (!task) {
    throw httpError(404, "Task not found");
  }

  task.comments.push({
    user: req.user._id,
    text: req.body.text
  });

  await task.save();

  const populatedTask = await Task.findById(task._id).populate(taskPopulate).lean();

  res.status(201).json({
    success: true,
    data: populatedTask
  });
});
